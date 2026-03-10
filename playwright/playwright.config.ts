import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import { fileURLToPath } from "url";

// Manually recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: "./tests",

  // 1. Configure the Web Server
  webServer: {
    // The command to start your server
    command: "node ./info-screens/server/index.js",

    // The URL to wait for before starting tests (replaces your polling logic)
    url: "http://localhost:3000",

    // Set the working directory so the server finds its local files
    cwd: path.resolve(__dirname, ".."),

    // Inject your specific test environment variables
    env: {
      RECEPTIONIST_KEY: "testkey",
      SAFETY_KEY: "safety",
      OBSERVER_KEY: "observer",
      TIMER_DURATION: "60",
    },

    // If true, it won't try to start the server if one is already running on port 3000
    reuseExistingServer: !process.env.CI,

    // How long to wait for the server to boot (default is 60s)
    timeout: 10 * 1000,
  },

  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
});
