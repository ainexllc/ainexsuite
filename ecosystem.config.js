// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  return env;
}

const envFromFile = loadEnvFile();

// Shared environment variables for all apps
const sharedEnv = {
  GROK_API_KEY: envFromFile.GROK_API_KEY || process.env.GROK_API_KEY || '',
  XAI_API_KEY: envFromFile.XAI_API_KEY || process.env.XAI_API_KEY || '',
};

module.exports = {
  apps: [
    {
      name: 'main',
      cwd: './apps/main',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3000, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'notes',
      cwd: './apps/notes',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3001, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'journal',
      cwd: './apps/journal',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3002, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'todo',
      cwd: './apps/todo',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3003, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'health',
      cwd: './apps/health',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3004, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'album',
      cwd: './apps/album',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3005, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'habits',
      cwd: './apps/habits',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3006, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'display',
      cwd: './apps/display',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3007, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'fit',
      cwd: './apps/fit',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3008, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'projects',
      cwd: './apps/projects',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3009, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'workflow',
      cwd: './apps/workflow',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3010, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'calendar',
      cwd: './apps/calendar',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3014, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'track',
      cwd: './apps/track',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3015, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    },
    {
      name: 'admin',
      cwd: './apps/admin',
      script: 'pnpm',
      args: 'dev',
      env: { PORT: 3020, NODE_ENV: 'development', ...sharedEnv },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: 10000,
    }
  ]
};
