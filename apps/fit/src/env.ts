import { z } from 'zod';

const serverSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().optional(),
  FIREBASE_ADMIN_DATABASE_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

const isBuild = process.env.npm_lifecycle_event === 'build';

export const serverEnv = serverSchema.parse(
  isBuild
    ? {
        FIREBASE_ADMIN_PROJECT_ID: 'build-placeholder',
        FIREBASE_ADMIN_CLIENT_EMAIL: 'build@example.com',
        FIREBASE_ADMIN_PRIVATE_KEY: 'build-placeholder',
        FIREBASE_ADMIN_DATABASE_URL: 'https://example.com',
      }
    : {
        FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
        FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        FIREBASE_ADMIN_DATABASE_URL: process.env.FIREBASE_ADMIN_DATABASE_URL,
      }
);

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'build-placeholder',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'build-placeholder',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'build-placeholder',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'build-placeholder',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'build-placeholder',
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'build-placeholder',
});
