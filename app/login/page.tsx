import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("login.html");

  const logo = `<a class="flex items-center" href="/">
  <span class="sr-only">LinkHub</span>
  <span class="bg-white rounded-xl p-2 shadow-sm border border-surface-variant/30 dark:border-white/10">
    <img src="/logo.png" alt="LinkHub logo" width="36" height="36" />
  </span>
</a>`;

  const patched = bodyHtml
    .replace(/<div class="flex items-center gap-2">[\s\S]*?<\/div>/i, logo)
    .replace(/href="#"\s*>(\s*Create an account\s*)<\/a>/i, 'href="/signup">$1</a>')
    .replace(/href="#"\s*>(\s*Log In\s*)<\/a>/i, 'href="/login">$1</a>');

  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: patched }} />;
}
