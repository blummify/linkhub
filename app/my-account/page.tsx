import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import MyAccountClient from "./MyAccountClient";

export const metadata: Metadata = {
  title: "My account",
};

export default async function MyAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  return <MyAccountClient twoFactorEnabled={user?.twoFactorEnabled ?? false} />;
}
