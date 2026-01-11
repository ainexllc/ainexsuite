// Load environment variables from .env.local
const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env.local");
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
  }

  return env;
}

const envFromFile = loadEnvFile();

// Shared environment variables for all apps
const sharedEnv = {
  GROK_API_KEY: envFromFile.GROK_API_KEY || process.env.GROK_API_KEY || "",
  FAL_KEY: envFromFile.FAL_KEY || process.env.FAL_KEY || "",
};

module.exports = {
  apps: [
    {
      name: "main",
      cwd: "./apps/main",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3000, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "notes",
      cwd: "./apps/notes",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3001, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "journal",
      cwd: "./apps/journal",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3002, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "todo",
      cwd: "./apps/todo",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3003, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "health",
      cwd: "./apps/health",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3004, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "album",
      cwd: "./apps/album",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3005, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "habits",
      cwd: "./apps/habits",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3006, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "mosaic",
      cwd: "./apps/mosaic",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3007, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "fit",
      cwd: "./apps/fit",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3008, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "projects",
      cwd: "./apps/projects",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3009, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "flow",
      cwd: "./apps/flow",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3010, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "calendar",
      cwd: "./apps/calendar",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3014, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "docs",
      cwd: "./apps/docs",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3012, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "subs",
      cwd: "./apps/subs",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3011, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "tables",
      cwd: "./apps/tables",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3013, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
    {
      name: "admin",
      cwd: "./apps/admin",
      script: "pnpm",
      args: "dev --turbo",
      env: { PORT: 3020, NODE_ENV: "development", ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
      exec_mode: "fork",
      kill_timeout: 5000,
    },
  ],
};
