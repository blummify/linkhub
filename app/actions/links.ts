"use server";

import type { Link } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getLinks(): Promise<Link[]> {
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

export async function addLink(data: { title: string; url: string; icon?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const link = await db.link.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });
    revalidatePath("/user-admin");
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
    revalidatePath("/user-admin");
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
    revalidatePath("/user-admin");
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
    });

    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
