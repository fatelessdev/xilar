import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Don't allow setting via signup
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),
  ],

  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
});

// Export types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
