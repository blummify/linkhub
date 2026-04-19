import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("login.html");

  const logo = `<a class="flex items-center" href="/">
  <span class="sr-only">LinkHub</span>
  <img src="/link_hub_logo.png" alt="LinkHub logo" width="128" height="128" />
</a>`;

  const patched = bodyHtml
    .replace(/<div class="flex items-center gap-2">[\s\S]*?<\/div>/i, logo)
    .replace(/href="#"\s*>(\s*Create an account\s*)<\/a>/i, 'href="/signup">$1</a>')
    .replace(/href="#"\s*>(\s*Log In\s*)<\/a>/i, 'href="/login">$1</a>');

  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: patched }} />;
}
