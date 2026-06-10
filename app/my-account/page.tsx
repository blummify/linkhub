import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import MyAccountClient from "./MyAccountClient";

export const metadata: Metadata = {
  title: "My account",
};

export default async function MyAccountPage() {
  // Defense-in-depth beyond middleware. Also lets us read passwordHash/pendingEmail
  // server-side — account type is decided here, never on the client.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, pendingEmail: true, passwordHash: true },
  });
  if (!user) redirect("/login");

  return (
    <MyAccountClient
      initial={{
        name: user.name ?? "",
        email: user.email ?? "",
        pendingEmail: user.pendingEmail ?? null,
        hasPassword: user.passwordHash != null, // never send the hash itself
      }}
    />
  );
}
