import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: "./tests",

  webServer: {
    command: "node ./info-screens/server/index.js",

    url: "http://localhost:3000",

    cwd: path.resolve(__dirname, ".."),

    env: {
      RECEPTIONIST_KEY: "testkey",
      SAFETY_KEY: "safety",
      OBSERVER_KEY: "observer",
      TIMER_DURATION: "60",
    },

    reuseExistingServer: !process.env.CI,

    timeout: 10 * 1000,
  },

  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
});
