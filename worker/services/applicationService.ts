import { D1Database } from "@cloudflare/workers-types";
import {
  type CreateApplicationPayload,
  type DbApplication,
  type ApplicationStatus,
} from "../types/application";

// Retrieve an application using its external application ID
export async function getApplicationByExternalId(
    db: D1Database,
    clientId: string,
    externalApplicationId: string
): Promise<DbApplication | null> {
  return db
      .prepare(`SELECT * FROM str_applications WHERE client_id = ? AND external_application_id = ?`)
      .bind(clientId, externalApplicationId)
      .first<DbApplication>();
}

// Retrieve an application using its internal ID
export async function getApplicationById(
    db: D1Database,
    clientId: string,
    applicationId: string
): Promise<DbApplication | null> {
  return db
      .prepare(`SELECT * FROM str_applications WHERE client_id = ? AND id = ?`)
      .bind(clientId, applicationId)
      .first<DbApplication>();
}

// Create a new STR application
export async function createApplication(
    db: D1Database,
    clientId: string,
    data: CreateApplicationPayload
): Promise<DbApplication> {
  const id = crypto.randomUUID();

  const referenceNo = `STR${data.applicationYear}-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

  await db
      .prepare(
          `INSERT INTO str_applications (
                    id,
                    client_id,
                    external_application_id,
                    reference_no,
                    applicant_name,
                    application_year
          ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
          id,
          clientId,
          data.externalApplicationId,
          referenceNo,
          data.applicantName,
          data.applicationYear
      )
      .run();

  const application = await getApplicationById(db, clientId, id);

  if (!application) {
    throw new Error("Failed to retrieve the created application");
  }

  return application;
}

// Retrieve all submitted STR applications for the admin dashboard
export async function getAllApplications(
    db: D1Database
): Promise<DbApplication[]> {
  const result = await db
      .prepare(
          `SELECT *
       FROM str_applications
       ORDER BY submitted_at DESC, id DESC`
      )
      .all<DbApplication>();

  return result.results;
}

// Retrieve an application by its internal ID (admin access)
export async function getAdminApplicationById(
    db: D1Database,
    applicationId: string
): Promise<DbApplication | null> {
  return db
      .prepare(
          `SELECT *
       FROM str_applications
       WHERE id = ?`
      )
      .bind(applicationId)
      .first<DbApplication>();
}

// Update an application's processing status
export async function updateApplicationStatus(
    db: D1Database,
    applicationId: string,
    status: ApplicationStatus
): Promise<DbApplication | null> {
  await db
      .prepare(
          `UPDATE str_applications
       SET status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
      )
      .bind(status, applicationId)
      .run();

  return getAdminApplicationById(db, applicationId);
}
