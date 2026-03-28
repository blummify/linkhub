import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("signup.html");

  const patched = bodyHtml
    .replace(/href="#"\s*>(\s*Log In\s*)<\/a>/i, 'href="/login">$1</a>')
    .replace(/href="#"\s*>(\s*Create an account\s*)<\/a>/i, 'href="/signup">$1</a>');

  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: patched }} />;
}
