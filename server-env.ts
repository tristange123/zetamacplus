import { config as loadEnv } from "dotenv";

if (process.env.APP_ENV === "test") {
  loadEnv({ path: ".env.test", override: true, quiet: true });
} else {
  loadEnv({ path: ".env", quiet: true });
  loadEnv({ path: ".env.local", override: true, quiet: true });
}
