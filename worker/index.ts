import { Hono } from "hono";
import { AppEnv } from "./types";
import applications from "./routes/applications";
import admin from "./routes/admin";
import adminAuth from "./routes/adminAuth";

const app = new Hono<AppEnv>();

app.get("/", (c) => {
  return c.json({
    name: "STR Mock RESTful API",
    version: "1.0.0",
    status: "running",
  });
});

app.get("/api/v1/health", (c) => {
  return c.json({
    success: true,
    message: "STR Mock API is running",
  });
});

app.get("/api/v1/health/db", async (c) => {
  try {
    const result = await c.env.str_mock_db
        .prepare("SELECT 1 AS connected")
        .first();

    return c.json({
      success: true,
      message: "Cloudflare D1 is connected",
      data: result,
    });
  } catch {
    return c.json(
        {
          success: false,
          message: "Cloudflare D1 connection failed",
        },
        500
    );
  }
});

// Third-party application endpoints
app.route("/api/v1/applications", applications);

// Administrative endpoints
app.route("/api/v1/admin", admin);

// Admin authentication endpoints
app.route("/api/v1/admin/auth", adminAuth);

export default app;
