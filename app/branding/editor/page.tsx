import { type Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EditorClient } from "./EditorClient";

export const metadata: Metadata = {
  title: "Open Editor",
  description: "Design your own custom theme with backgrounds, effects, and more.",
};

export default async function EditorPage() {
  const session = await auth();
  let isPaidUser = false;

  if (session?.user?.id) {
    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { planId: true },
    });
    isPaidUser = !!sub && sub.planId !== "free";
  }

  return <EditorClient isPaidUser={isPaidUser} />;
}
