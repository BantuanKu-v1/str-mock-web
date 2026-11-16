import { Hono } from "hono";
import type { AppEnv } from "../types";
import { apiKeyAuth } from "../middleware/auth";
import { createApplicationSchema } from "../schemas/applicationSchema";
import {
  createApplication,
  getApplicationByExternalId,
  getApplicationById,
} from "../services/applicationService";

const applications = new Hono<AppEnv>();

// Authenticate all application routes
applications.use("*", apiKeyAuth);

// Compare JSON payloads without depending on object key order
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((item, index) => deepEqual(item, b[index]))
    );
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  return (
      keysA.length === keysB.length &&
      keysA.every(
          (key) =>
              Object.prototype.hasOwnProperty.call(objB, key) &&
              deepEqual(objA[key], objB[key])
      )
  );
}

// Submit an application
applications.post("/", async (c) => {
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

  const validation = createApplicationSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
        {
          success: false,
          message: "Invalid application data",
          errors: validation.error.flatten(),
        },
        400
    );
  }

  const data = validation.data;
  const clientId = c.get("clientId");
  const db = c.env.str_mock_db;

  try {
    // Check for an existing application
    const existing = await getApplicationByExternalId(
        db,
        clientId,
        data.externalApplicationId
    );

    if (existing) {
      let sameApplicationData = false;

      if (existing.application_data !== null) {
        try {
          sameApplicationData = deepEqual(
              JSON.parse(existing.application_data),
              data.applicationData
          );
        } catch {
          sameApplicationData = false;
        }
      }

      // The same external ID must represent the same submission
      if (
          existing.applicant_name !== data.applicantName ||
          existing.application_year !== data.applicationYear ||
          !sameApplicationData
      ) {
        return c.json(
            {
              success: false,
              message: "External application ID is already in use",
            },
            409
        );
      }

      return c.json({
        success: true,
        message: "Application already exists",
        data: {
          id: existing.id,
          referenceNo: existing.reference_no,
          status: existing.status,
          submittedAt: existing.submitted_at,
        },
      });
    }

    const application = await createApplication(
        db,
        clientId,
        data
    );

    return c.json(
        {
          success: true,
          message: "Application submitted successfully",
          data: {
            id: application.id,
            referenceNo: application.reference_no,
            status: application.status,
            submittedAt: application.submitted_at,
          },
        },
        201
    );
  } catch (error) {
    // Handle concurrent submissions using the same external ID
    const isUniqueConstraintError =
        error instanceof Error &&
        /UNIQUE constraint failed/i.test(error.message);

    if (isUniqueConstraintError) {
      return c.json(
          {
            success: false,
            message:
                "Application submission conflict. Please retry using the same application data.",
          },
          409
      );
    }

    console.error("Application submission failed:", error);

    return c.json(
        {
          success: false,
          message: "Failed to submit application",
        },
        500
    );
  }
});

// Retrieve an application's current status
applications.get("/:id/status", async (c) => {
  const applicationId = c.req.param("id");
  const clientId = c.get("clientId");

  try {
    const application = await getApplicationById(
        c.env.str_mock_db,
        clientId,
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

    return c.json({
      success: true,
      data: {
        id: application.id,
        referenceNo: application.reference_no,
        status: application.status,
        updatedAt: application.updated_at,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve application status:", error);

    return c.json(
        {
          success: false,
          message: "Failed to retrieve application status",
        },
        500
    );
  }
});

export default applications;
