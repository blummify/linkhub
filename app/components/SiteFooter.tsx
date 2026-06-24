import Link from "next/link";
import { LinkhubLogo } from "./icons/LinkhubLogo";

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low w-full py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center justify-center mb-4">
            <LinkhubLogo size="md" />
          </div>
          <p className="text-outline text-sm max-w-xs">
            The world&apos;s premier platform for editorial link curation and
            digital identity management.
          </p>
        </div>
        <div>
          <span className="font-inter text-xs uppercase tracking-widest text-primary font-bold block mb-4">
            Company
          </span>
          <ul className="space-y-2">
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <span className="font-inter text-xs uppercase tracking-widest text-primary font-bold block mb-4">
            Product
          </span>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="/pricing"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="/features"
              >
                Features
              </Link>
            </li>
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                Solutions
              </a>
            </li>
          </ul>
        </div>
        <div>
          <span className="font-inter text-xs uppercase tracking-widest text-primary font-bold block mb-4">
            Legal
          </span>
          <ul className="space-y-2">
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                className="text-outline hover:text-primary underline-offset-4 hover:underline transition-opacity text-sm"
                href="#"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-outline-variant">
        <p className="text-outline text-xs text-center">
          © {new Date().getFullYear()} LinkHub. The Digital Curator.
        </p>
      </div>
    </footer>
  );
}
