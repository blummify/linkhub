"use server";

import { db } from "@/lib/db";
import type { LinkRow } from "@/lib/linkRow";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { addLinkSchema } from "@/lib/validation/link.schema";

export async function getLinks(): Promise<LinkRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await db.link.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    return [];
  }
}

export async function getLinksCount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const count = await db.link.count({
      where: { userId: session.user.id }
    });
    return { count };
  } catch (error) {
    console.error("Error counting links:", error);
    return { count: 0 };
  }
}

export async function addLink(data: { title: string; url: string; icon?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = addLinkSchema.safeParse(data);
  if(!parsed.success) {
    return {error: parsed.error.issues[0].message};
  }

  try {
    const link = await db.link.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });
    revalidatePath("/user-dashboard");
    return { success: true, link };
  } catch (error) {
    console.error("Error adding link:", error);
    return { error: "Failed to add link" };
  }
}

export async function updateLink(id: string, data: { title?: string; url?: string; icon?: string; draft?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const link = await db.link.update({
      where: { id, userId: session.user.id },
      data,
    });
    revalidatePath("/user-dashboard");
    return { success: true, link };
  } catch (error) {
    console.error("Error updating link:", error);
    return { error: "Failed to update link" };
  }
}

export async function deleteLink(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.link.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/user-dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { error: "Failed to delete link" };
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    let profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }, // ← pulls in name, email, image
    });

    if (!profile) {
      profile = await db.profile.create({
        data: { userId: session.user.id },
        include: { user: true }, // ← same here
      });
    }

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

export async function claimHandle(handle: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!HANDLE_REGEX.test(handle)) {
    return { error: "Handle must be 3–24 characters: letters, numbers, underscores only." };
  }

  try {
    const taken = await db.profile.findFirst({ where: { handle } });
    if (taken && taken.userId !== session.user.id) {
      return { error: "That handle is already taken. Try another." };
    }

    await db.profile.update({
      where: { userId: session.user.id },
      data: { handle, hasClaimedHandle: true },
    });

    revalidatePath("/user-dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error claiming handle:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function dismissHandleClaim() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.profile.update({
      where: { userId: session.user.id },
      data: { hasClaimedHandle: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error dismissing handle claim:", error);
    return { error: "Something went wrong." };
  }
}
