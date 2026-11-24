import { Hono } from "hono";
import type { AppEnv } from "../types";
import type { ApplicationStatus } from "../types/application";
import { adminAuth } from "../middleware/auth";
import { updateApplicationStatusSchema } from "../schemas/applicationSchema";
import {
  getAllApplications,
  getAdminApplicationById,
  updateApplicationStatus,
} from "../services/applicationService";
import {
  sendApplicationStatusWebhook,
} from "../services/webhookService";

const admin = new Hono<AppEnv>();

admin.use("/applications/*", adminAuth);
admin.use("/applications", adminAuth);

// Allowed status transitions
const allowedTransitions: Record<
    ApplicationStatus,
    ApplicationStatus[]
> = {
  submitted: ["under_review"],
  under_review: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

// Retrieve all applications
admin.get("/applications", async (c) => {
  try {
    const applications = await getAllApplications(
        c.env.str_mock_db
    );

    return c.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Failed to retrieve applications:", error);

    return c.json(
        {
          success: false,
          message: "Failed to retrieve applications",
        },
        500
    );
  }
});

// Update application status
admin.patch("/applications/:id/status", async (c) => {
  const applicationId = c.req.param("id");

  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json(
        {
          success: false,
          message: "Invalid JSON request body",
        },
        400
    );
  }

  const validation = updateApplicationStatusSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
        {
          success: false,
          message: "Invalid application status",
          errors: validation.error.flatten(),
        },
        400
    );
  }

  const newStatus = validation.data.status;

  try {
    const application = await getAdminApplicationById(
        c.env.str_mock_db,
        applicationId
    );

    if (!application) {
      return c.json(
          {
            success: false,
            message: "Application not found",
          },
          404
      );
    }

    const currentStatus = application.status;

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return c.json(
          {
            success: false,
            message: `Cannot change status from ${currentStatus} to ${newStatus}`,
          },
          409
      );
    }

    const updatedApplication = await updateApplicationStatus(
        c.env.str_mock_db,
        applicationId,
        newStatus,
        currentStatus
    );

    // Handle unsuccessful conditional status updates
    if (!updatedApplication) {
      return c.json(
          {
            success: false,
            message: "Application status has changed. Please refresh and try again.",
          },
          409
      );
    }

    // Notify BantuanKu after the status is successfully updated.
    // Keep the Worker alive until webhook delivery completes.
    c.executionCtx.waitUntil(
        sendApplicationStatusWebhook(
            c.env,
            updatedApplication
        )
    );

    return c.json({
      success: true,
      message: "Application status updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Failed to update application status:", error);

    return c.json(
        {
          success: false,
          message: "Failed to update application status",
        },
        500
    );
  }
});

export default admin;
