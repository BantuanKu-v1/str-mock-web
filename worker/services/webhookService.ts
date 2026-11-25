import type { AppEnv } from "../types";
import type { DbApplication, ApplicationStatus } from "../types/application";

interface StrStatusWebhookPayload {
  eventType: "application.status_updated";
  provider: "str";
  externalApplicationId: string;
  providerApplicationId: string;
  referenceNo: string;
  status: ApplicationStatus;
  updatedAt: string;
}

const WEBHOOK_TIMEOUT_MS = 5000; // 5 seconds
const WEBHOOK_SECRET_HEADER = "X-Webhook-Secret";

// Normalize the provider timestamp to ISO 8601 UTC
function normalizeTimestamp(value: string): string {
  const timestamp = value.trim();

  const normalizedTimestamp =
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(timestamp)
          ? `${timestamp.replace(" ", "T")}Z`
          : timestamp;

  if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
          .test(normalizedTimestamp)
  ) {
    throw new Error("Invalid STR application timestamp");
  }

  const parsedTimestamp = new Date(normalizedTimestamp);

  if (!Number.isFinite(parsedTimestamp.getTime())) {
    throw new Error("Invalid STR application timestamp");
  }

  return parsedTimestamp.toISOString();
}

// Construct the STR application status webhook payload
function buildStatusWebhookPayload(
    application: DbApplication
): StrStatusWebhookPayload {
  return {
    eventType: "application.status_updated",
    provider: "str",
    externalApplicationId: application.external_application_id,
    providerApplicationId: application.id,
    referenceNo: application.reference_no,
    status: application.status,
    updatedAt: normalizeTimestamp(application.updated_at),
  };
}

// Notify BantuanKu when an STR application status changes
export async function sendApplicationStatusWebhook(
    env: AppEnv["Bindings"],
    application: DbApplication
): Promise<boolean> {
  const webhookUrl = env.BANTUANKU_WEBHOOK_URL?.trim();
  const webhookSecret = env.STR_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.error(
        "[STR Webhook] Missing webhook configuration",
        {
          applicationId: application.id,
          hasWebhookUrl: Boolean(webhookUrl),
          hasWebhookSecret: Boolean(webhookSecret),
        }
    );

    return false;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, WEBHOOK_TIMEOUT_MS);

  let stage = "validate_endpoint";

  try {
    const endpoint = new URL(webhookUrl);

    if (endpoint.protocol !== "https:") {
      throw new Error("Webhook endpoint must use HTTPS");
    }

    // Construct and validate the webhook payload
    stage = "build_payload";

    const payload = buildStatusWebhookPayload(application);

    // Log the delivery attempt without exposing the webhook secret
    console.info(
        "[STR Webhook] Sending application status update",
        {
          applicationId: application.id,
          referenceNo: application.reference_no,
          status: application.status,
          endpoint: `${endpoint.origin}${endpoint.pathname}`,
          updatedAt: payload.updatedAt,
        }
    );

    // Send the webhook request to BantuanKu
    stage = "send_request";

    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [WEBHOOK_SECRET_HEADER]: webhookSecret,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "manual",
    });

    // stage = "validate_response";

    // Reject unexpected redirects without following them
    if (response.status >= 300 && response.status < 400) {
      console.error(
          "[STR Webhook] Unexpected redirect response",
          {
            applicationId: application.id,
            status: application.status,
            httpStatus: response.status,
          },
      );

      return false;
    }

    if (!response.ok) {
      console.error(
          "[STR Webhook] Status synchronization failed",
          {
            applicationId: application.id,
            status: application.status,
            httpStatus: response.status,
            httpStatusText: response.statusText,
          }
      );

      return false;
    }

    console.info(
        "[STR Webhook] Status synchronization completed",
        {
          applicationId: application.id,
          referenceNo: application.reference_no,
          status: application.status,
          httpStatus: response.status,
        }
    );

    return true;

  } catch (error) {
    console.error(
        "[STR Webhook] Failed to deliver application status",
        {
          applicationId: application.id,
          status: application.status,
          stage,
          reason: controller.signal.aborted
              ? "Request timed out"
              : error instanceof Error
                  ? error.name
                  : "Unknown error",
          message: error instanceof Error
              ? error.message
              : String(error),
        }
    );

    return false;

  } finally {
    clearTimeout(timeout);
  }
}
