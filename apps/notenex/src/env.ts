import { z } from "zod";
import { firebaseConfig as defaultFirebaseConfig } from "@ainexsuite/firebase";

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

const serverSchema = z
  .object({
    FIREBASE_ADMIN_PROJECT_ID: z.string().nonempty().optional(),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_ADMIN_PRIVATE_KEY: z.string().optional(),
    FIREBASE_ADMIN_DATABASE_URL: z.string().url().optional(),
    REMINDER_DISPATCH_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM_NUMBER: z.string().optional(),
    XAI_API_KEY: z.string().optional(),
  })
  .superRefine((fields, ctx) => {
    // Only validate Firebase Admin if any Firebase Admin field is set
    const hasAnyFirebaseAdminField =
      fields.FIREBASE_ADMIN_PROJECT_ID ||
      fields.FIREBASE_ADMIN_CLIENT_EMAIL ||
      fields.FIREBASE_ADMIN_PRIVATE_KEY ||
      fields.FIREBASE_ADMIN_DATABASE_URL;

    if (!hasAnyFirebaseAdminField) {
      return;
    }

    if (!fields.FIREBASE_ADMIN_PROJECT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_ADMIN_PROJECT_ID"],
        message:
          "Provide FIREBASE_ADMIN_PROJECT_ID to enable server-side Firebase features.",
      });
    }

    if (!fields.FIREBASE_ADMIN_CLIENT_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_ADMIN_CLIENT_EMAIL"],
        message:
          "Provide FIREBASE_ADMIN_CLIENT_EMAIL to enable server-side Firebase features.",
      });
    }

    if (!fields.FIREBASE_ADMIN_PRIVATE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_ADMIN_PRIVATE_KEY"],
        message:
          "Provide FIREBASE_ADMIN_PRIVATE_KEY to enable server-side Firebase features.",
      });
    }
  });

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? defaultFirebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    defaultFirebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? defaultFirebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    defaultFirebaseConfig.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    defaultFirebaseConfig.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? defaultFirebaseConfig.appId,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ??
    defaultFirebaseConfig.measurementId,
});

export const serverEnv = serverSchema.parse({
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_ADMIN_DATABASE_URL: process.env.FIREBASE_ADMIN_DATABASE_URL,
  REMINDER_DISPATCH_TOKEN: process.env.REMINDER_DISPATCH_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
  XAI_API_KEY: process.env.XAI_API_KEY,
});

export const firebaseClientConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
