import { Hono } from "hono";
import type { AppEnv } from "../types";
import type { DbApplication } from "../types/application";
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

// Normalize Cloudflare D1 timestamps to ISO 8601 UTC
function toIsoTimestamp(value: string): string {
  const timestamp = value.trim();

  // D1 commonly stores timestamps as YYYY-MM-DD HH:MM:SS
  const sqliteTimestamp = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/;
  const match = sqliteTimestamp.exec(timestamp);

  const normalized = match
      ? `${match[1]}T${match[2]}${match[3] ?? ""}Z`
      : timestamp;

  // Require an explicit timezone to avoid ambiguous timestamps
  if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
          normalized
      )
  ) {
    throw new Error("Invalid application timestamp format");
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid application timestamp");
  }

  return parsed.toISOString();
}

// Check whether an existing application matches the request
function matchesExistingApplication(
    existing: DbApplication,
    data: {
      applicantName: string;
      applicationYear: number;
      applicationData: unknown;
    }
): boolean {
  if (
      existing.applicant_name !== data.applicantName ||
      existing.application_year !== data.applicationYear ||
      existing.application_data === null
  ) {
    return false;
  }

  try {
    return deepEqual(
        JSON.parse(existing.application_data),
        data.applicationData
    );
  } catch {
    return false;
  }
}

// Build a consistent submission confirmation
function toSubmissionConfirmation(application: DbApplication) {
  return {
    id: application.id,
    referenceNo: application.reference_no,
    status: application.status,
    submittedAt: toIsoTimestamp(application.submitted_at),
  };
}

// Build a recovery response
function toRecoveryResponse(application: DbApplication) {
  return {
    ...toSubmissionConfirmation(application),
    externalApplicationId: application.external_application_id,
    updatedAt: toIsoTimestamp(application.updated_at),
  };
}

// Build a status response
function toStatusResponse(application: DbApplication) {
  return {
    id: application.id,
    referenceNo: application.reference_no,
    status: application.status,
    updatedAt: toIsoTimestamp(application.updated_at),
  };
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
    // Check whether the external application ID already exists
    const existing = await getApplicationByExternalId(
        db,
        clientId,
        data.externalApplicationId
    );

    if (existing) {
      if (!matchesExistingApplication(existing, data)) {
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
        data: toSubmissionConfirmation(existing),
      });
    }

    // Create a new STR application
    const application = await createApplication(
        db,
        clientId,
        data
    );

    return c.json(
        {
          success: true,
          message: "Application submitted successfully",
          data: toSubmissionConfirmation(application),
        },
        201
    );
  } catch (error) {
    // Another concurrent request may have inserted the same ID
    const isUniqueConstraintError =
        error instanceof Error &&
        /UNIQUE constraint failed/i.test(error.message);

    if (isUniqueConstraintError) {
      try {
        // Re-fetch the record created by the competing request
        const existing = await getApplicationByExternalId(
            db,
            clientId,
            data.externalApplicationId
        );

        if (existing && matchesExistingApplication(existing, data)) {
          return c.json({
            success: true,
            message: "Application already exists",
            data: toSubmissionConfirmation(existing),
          });
        }

        return c.json(
            {
              success: false,
              message: "External application ID is already in use",
            },
            409
        );
      } catch (lookupError) {
        console.error(
            "Failed to resolve concurrent submission:",
            lookupError
        );

        return c.json(
            {
              success: false,
              message: "Unable to resolve application submission conflict",
            },
            500
        );
      }
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

// Retrieve an application using its external application ID
// Used by BantuanKu to recover uncertain submissions
applications.get("/external/:externalApplicationId", async (c) => {
  const externalApplicationId = c.req.param(
      "externalApplicationId"
  );

  const clientId = c.get("clientId");

  if (!externalApplicationId.trim()) {
    return c.json(
        {
          success: false,
          message: "External application ID is required",
        },
        400
    );
  }

  try {
    const application = await getApplicationByExternalId(
        c.env.str_mock_db,
        clientId,
        externalApplicationId
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
      data: toRecoveryResponse(application),
    });
  } catch (error) {
    console.error(
        "Failed to retrieve application by external ID:",
        error
    );

    return c.json(
        {
          success: false,
          message: "Failed to retrieve application",
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
      data: toStatusResponse(application),
    });
  } catch (error) {
    console.error(
        "Failed to retrieve application status:",
        error
    );

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
