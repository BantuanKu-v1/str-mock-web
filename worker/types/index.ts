import { D1Database, RateLimit } from "@cloudflare/workers-types";

export type AppEnv = {
  Bindings: {
    str_mock_db: D1Database;
    API_KEY: string;
    ADMIN_API_KEY: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    STR_ELIGIBILITY_RATE_LIMITER: RateLimit;
    BANTUANKU_WEBHOOK_URL: string;
    STR_WEBHOOK_SECRET: string;
  };
  Variables: {
    clientId: string;
  };
};
