import { readFile } from "fs/promises";
import path from "path";

export type LoadedTemplate = {
  bodyClassName: string;
  bodyHtml: string;
};

function extractBody(html: string): LoadedTemplate {
  const bodyOpenMatch = html.match(/<body\b([^>]*)>/i);
  const bodyAttrs = bodyOpenMatch?.[1] ?? "";
  const bodyClassMatch = bodyAttrs.match(/class="([^"]*)"/i);
  const bodyClassName = bodyClassMatch?.[1] ?? "";

  const bodySplit = html.split(/<body\b[^>]*>/i);
  const afterBody = bodySplit.length > 1 ? bodySplit.slice(1).join("") : html;
  const beforeClose = afterBody.split(/<\/body>/i)[0] ?? afterBody;

  const withoutTailwindCdn = beforeClose.replace(
    /<script[^>]*src="https:\/\/cdn\.tailwindcss\.com[^"]*"[^>]*>\s*<\/script>/gi,
    "",
  );
  const withoutTailwindConfig = withoutTailwindCdn.replace(
    /<script[^>]*id="tailwind-config"[^>]*>[\s\S]*?<\/script>/gi,
    "",
  );

  return { bodyClassName, bodyHtml: withoutTailwindConfig.trim() };
}

export async function loadTemplateHtml(templateFileName: string): Promise<LoadedTemplate> {
  const templatePath = path.join(process.cwd(), "templates", templateFileName);
  const html = await readFile(templatePath, "utf8");
  return extractBody(html);
}

