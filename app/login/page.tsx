import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("login.html");

  const patched = bodyHtml
    .replace(/href="#"\s*>(\s*Create an account\s*)<\/a>/i, 'href="/signup">$1</a>')
    .replace(/href="#"\s*>(\s*Log In\s*)<\/a>/i, 'href="/login">$1</a>');

  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: patched }} />;
}
