import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Server-side helper to get current session
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// Check if user is admin
export async function isAdmin() {
  const session = await getServerSession();
  return session?.user?.role === "admin";
}

// Require authentication - throws if not logged in
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Require admin role - throws if not admin
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}
