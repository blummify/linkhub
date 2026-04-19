import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("signup.html");

  const logo = `<a class="flex items-center" href="/">
  <span class="sr-only">LinkHub</span>
  <img src="/link_hub_logo.png" alt="LinkHub logo" width="104" height="104" />
</a>`;

  const patched = bodyHtml
    .replace(
      /<div class="text-2xl font-extrabold[^"]*">[\s\S]*?LinkHub[\s\S]*?<\/div>/i,
      logo,
    )
    .replace(/href="#"\s*>(\s*Log In\s*)<\/a>/i, 'href="/login">$1</a>')
    .replace(/href="#"\s*>(\s*Create an account\s*)<\/a>/i, 'href="/signup">$1</a>');

  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: patched }} />;
}
