import githubIcon from "../assets/github-mark.svg";
import { useEffect } from "react";

const GITHUB_REPO_URL = "https://github.com/BantuanKu-v1/str-mock-web";

export default function ApiDocumentationPage() {
  useEffect(() => {
    document.title = "STR Mock API Doc";

    return () => {
      document.title = "STR Mock";
    };
  }, []);

  return (
      <div className="api-docs">
        <header className="api-docs__header">
          <div className="api-docs__header-content">
            <div className="api-docs__header-top">
              <span className="api-docs__label">
                STR Mock Web
              </span>

              {GITHUB_REPO_URL && (
                  <a
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="api-docs__github"
                  >
                    <img src={githubIcon} alt="" aria-hidden="true" />
                    <span>GitHub Repository ↗</span>
                  </a>
              )}
            </div>

            <h1 className="api-docs__title">
              API Documentation
            </h1>

            <p className="api-docs__description">
              Integration guidelines for third-party applications
              connecting to the STR Mock Web API.
            </p>
          </div>
        </header>

        <main className="api-docs__content">
          <section className="api-docs__section">
            <h2>Overview</h2>

            <p>
              STR Mock Web is a simulated external agency system
              developed for academic demonstration and integration
              testing.
            </p>

            <p>
              Third-party applications can submit STR applications
              and retrieve their processing statuses through
              authenticated API requests.
            </p>

            <p>
              The API uses JSON for request and response bodies.
              All endpoints are prefixed with:
            </p>

            <pre>
              <code>/api/v1</code>
            </pre>
          </section>

          <section className="api-docs__section">
            <h2>Authentication</h2>

            <p>
              All third-party application endpoints require an API key
              in the Authorization header.
            </p>

            <pre>
              <code>
                {"Authorization: Bearer <YOUR_API_KEY>"}
              </code>
            </pre>

            <p>
              For requests containing JSON data, include:
            </p>

            <pre>
              <code>Content-Type: application/json</code>
            </pre>

            <p>
              API keys must be stored securely and should never be
              exposed in public repositories or client-side code.
            </p>
          </section>

          <section className="api-docs__section">
            <h2>Available Endpoints</h2>

            <div className="api-docs__endpoint">
              <span className="api-docs__method api-docs__method--post">
                POST
              </span>

              <code>/api/v1/applications</code>

              <p>Submit a new STR application.</p>
            </div>

            <div className="api-docs__endpoint">
              <span className="api-docs__method api-docs__method--get">
                GET
              </span>

              <code>/api/v1/applications/:id/status</code>

              <p>Retrieve the current processing status of an application.</p>
            </div>
          </section>

          <section className="api-docs__section">
            <h2>1. Submit an Application</h2>

            <div className="api-docs__endpoint">
              <span className="api-docs__method api-docs__method--post">
                POST
              </span>

              <code>/api/v1/applications</code>
            </div>

            <p>
              Submit a new application using a unique external
              application identifier.
            </p>

            <h3>Request Body</h3>

            <pre>
              <code>{`{
                "externalApplicationId": "BANTUANKU-APP-001",
                "applicantName": "Ahmad bin Ali",
                "applicationYear": 2026
              }`}</code>
            </pre>

            <h3>Request Fields</h3>

            <div className="api-docs__table-wrapper">
              <table className="api-docs__table">
                <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Validation</th>
                  <th>Description</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td><code>externalApplicationId</code></td>
                  <td>string</td>
                  <td>Required, 1-100 characters</td>
                  <td>
                    Unique application identifier generated by
                    the third-party system.
                  </td>
                </tr>

                <tr>
                  <td><code>applicantName</code></td>
                  <td>string</td>
                  <td>Required, 1-150 characters</td>
                  <td>Applicant's full name.</td>
                </tr>

                <tr>
                  <td><code>applicationYear</code></td>
                  <td>number</td>
                  <td>Integer, minimum 2027</td>
                  <td>Year of the STR application.</td>
                </tr>
                </tbody>
              </table>
            </div>

            <p>
              Leading and trailing whitespace is removed from string fields during validation.
            </p>

            <h3>Success Response - 201 Created</h3>

            <pre>
              <code>{`{
                "success": true,
                "message": "Application submitted successfully",
                "data": {
                  "id": "<generated-application-id>",
                  "referenceNo": "<generated-reference-number>",
                  "status": "submitted",
                  "submittedAt": "<ISO-8601-timestamp>"
                }
              }`}</code>
            </pre>

            <p>
              A successful submission creates a new application with an initial status of
              <code>submitted</code>.
            </p>

            <h3>Duplicate Submission - 200 OK</h3>

            <p>
              If the same external application ID is submitted again
              with the same applicant name and application year,
              the API returns the existing application instead of
              creating another record.
            </p>

            <pre>
              <code>{`{
                "success": true,
                "message": "Application already exists",
                "data": {
                  "id": "<existing-application-id>",
                  "referenceNo": "<existing-reference-number>",
                  "status": "submitted",
                  "submittedAt": "<existing-timestamp>"
                }
              }`}</code>
            </pre>

            <p>
              The response contains the existing application's current status which may differ from
              its original <code> submitted </code> status.
            </p>

            <p>
              If the same external application ID is reused with a different applicant name or application year,
              the API returns HTTP 409 Conflict.
            </p>
          </section>

          <section className="api-docs__section">
            <h2>2. Retrieve Application Status</h2>

            <div className="api-docs__endpoint">
              <span className="api-docs__method api-docs__method--get">
                GET
              </span>

              <code>/api/v1/applications/:id/status</code>
            </div>

            <p>
              Retrieve an application's current processing status
              using the application ID returned during submission.
            </p>

            <h3>Path Parameter</h3>

            <div className="api-docs__table-wrapper">
              <table className="api-docs__table">
                <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td><code>id</code></td>
                  <td>string</td>
                  <td>
                    Application ID returned by the submission endpoint.
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <h3>Success Response - 200 OK</h3>

            <pre>
              <code>{`{
                "success": true,
                "data": {
                  "id": "<application-id>",
                  "referenceNo": "<reference-number>",
                  "status": "under_review",
                  "updatedAt": "<ISO-8601-timestamp>"
                }
              }`}</code>
            </pre>

            <p>
              Applications are retrieved within the authenticated API client's scope.
            </p>

            <p>
              If the application does not exist or does not belong to the authenticated client,
              the API returns HTTP 404 Not Found.
            </p>
          </section>

          <section className="api-docs__section">
            <h2>Application Status Flow</h2>

            <pre>
              <code>{`submitted
                  |
                  v
              under_review
                  |
                  +----> approved
                  |
                  +----> rejected`}</code>
            </pre>

            <p>
              Every newly submitted application starts with the <code>submitted</code> status.
            </p>

            <p>
              Administrators can move applications to <code> under_review </code> before approving
              or rejecting them.
            </p>

            <p>
              Approved and rejected applications are final and cannot be changed further.
            </p>

            <h3>Supported Status Values</h3>

            <div className="api-docs__table-wrapper">
              <table className="api-docs__table">
                <thead>
                <tr>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td><code>submitted</code></td>
                  <td>
                    Application successfully received by STR Mock Web.
                  </td>
                </tr>

                <tr>
                  <td><code>under_review</code></td>
                  <td>
                    Application is being reviewed by an administrator.
                  </td>
                </tr>

                <tr>
                  <td><code>approved</code></td>
                  <td>
                    Application has been approved.
                  </td>
                </tr>

                <tr>
                  <td><code>rejected</code></td>
                  <td>
                    Application has been rejected.
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="api-docs__section">
            <h2>Error Responses</h2>

            <p>
              The API returns an appropriate HTTP status code and a JSON response describing the error.
            </p>

            <div className="api-docs__table-wrapper">
              <table className="api-docs__table">
                <thead>
                <tr>
                  <th>HTTP Status</th>
                  <th>Meaning</th>
                  <th>Possible Cause</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td>400</td>
                  <td>Bad Request</td>
                  <td>Invalid JSON or application data.</td>
                </tr>
                <tr>
                  <td>401</td>
                  <td>Unauthorized</td>
                  <td>Missing or invalid API key.</td>
                </tr>
                <tr>
                  <td>404</td>
                  <td>Not Found</td>
                  <td>Application not found for the authenticated client.</td>
                </tr>
                <tr>
                  <td>409</td>
                  <td>Conflict</td>
                  <td>External application ID is already in use.</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td>Internal Server Error</td>
                  <td>Application submission or retrieval failed.</td>
                </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="api-docs__section api-docs__section--notice">
            <h2>Important Notice</h2>

            <p>
              STR Mock Web is developed solely for academic demonstration and integration testing. It is not
              affiliated with, endorsed by, or operated by any Malaysian government agency.
            </p>

            <p>
              Use fictional applicant information when testing API integrations.
            </p>
          </section>
        </main>
      </div>
  );
}
