import { PostlyClient } from "@blummify/postly-sdk";

const globalForPostly = globalThis as unknown as {
  postly: PostlyClient | undefined;
};

export const postly =
  globalForPostly.postly ??
  new PostlyClient({
    baseUrl: process.env.POSTLY_BASE_URL!,
    apiKey: process.env.POSTLY_API_KEY!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostly.postly = postly;
}
