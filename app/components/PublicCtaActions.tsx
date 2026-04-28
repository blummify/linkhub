type PublicCtaActionsProps = {
  wrapperClassName?: string;
  primaryClassName: string;
  secondaryClassName: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

export function PublicCtaActions({
  wrapperClassName = "flex flex-col md:flex-row justify-center items-center gap-4",
  primaryClassName,
  secondaryClassName,
  primaryLabel = "Get Started for Free",
  secondaryLabel = "Book a Demo",
}: PublicCtaActionsProps) {
  return (
    <div className={wrapperClassName}>
      <button className={primaryClassName}>{primaryLabel}</button>
      <button className={secondaryClassName}>{secondaryLabel}</button>
    </div>
  );
}
