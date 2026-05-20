import "./branding.css";

export default function BrandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="branding-shell">{children}</div>;
}
