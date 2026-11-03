import { Hono } from "hono";
import { AppEnv } from "../types";

const programs = new Hono<AppEnv>();

// Rate limit
programs.use("/STR/eligibility", async (c, next) => {
  const clientIp = c.req.header("CF-Connecting-IP") ?? "unknown";

  const { success } =
    await c.env.STR_ELIGIBILITY_RATE_LIMITER.limit({
      key: `str-eligibility:${clientIp}`,
    });

  if (!success) {
    c.header("Retry-After", "60");

    return c.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        429
    );
  }

  await next();
});

interface StrEligibilityRow {
  program_code: string;
  program_name: string;
  scheme_year: number;
  criteria_json: string;
  version: number;
  updated_at: string;
}

programs.get("/STR/eligibility", async (c) => {
  const yearParam = c.req.query("year");

  if (
      yearParam !== undefined &&
      !/^\d{4}$/.test(yearParam)
  ) {
    return c.json(
        {
          success: false,
          message: "Invalid scheme year",
        },
        400
    );
  }

  const year = yearParam ? Number(yearParam) : null;

  try {
    const db = c.env.str_mock_db;

    const row = year !== null ? await db
            .prepare(`
                select program_code,
                    program_name,
                    scheme_year,
                    criteria_json,
                    version,
                    updated_at
                from str_eligibility_criteria
                where program_code = 'STR'
                  and scheme_year = ?
                  and is_active = 1 limit 1
            `)
            .bind(year)
            .first<StrEligibilityRow>()
        : await db
            .prepare(`
                select program_code,
                    program_name,
                    scheme_year,
                    criteria_json,
                    version,
                    updated_at
                from str_eligibility_criteria
                where program_code = 'STR'
                  and is_active = 1
                order by scheme_year desc limit 1
            `)
            .first<StrEligibilityRow>();

    if (!row) {
      return c.json(
          {
            success: false,
            message: "Active STR eligibility criteria not found",
          },
          404
      );
    }

    const criteria: unknown = JSON.parse(row.criteria_json);

    return c.json({
      success: true,
      data: {
        programCode: row.program_code,
        programName: row.program_name,
        schemeYear: row.scheme_year,
        version: row.version,
        updatedAt: row.updated_at,
        criteria,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve STR eligibility criteria:", error);

    return c.json(
        {
          success: false,
          message: "Failed to retrieve STR eligibility criteria",
        },
        500
    );
  }
});

export default programs;
