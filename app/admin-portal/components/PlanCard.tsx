import { Button } from "./Button";
import type { PlanAdminRow } from "../services/types";

export interface PlanCardProps {
  plan: PlanAdminRow;
  onEdit: (planKey: PlanAdminRow["plan"]) => void;
}

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  const { amount, period } = splitPrice(plan.price);

  return (
    <section
      className={[
        "rounded-[16px] border border-ink-100 bg-white p-5",
        plan.highlighted ? "border-indigo-400 shadow-[0_0_0_1px_#6873ff]" : "",
      ].join(" ")}
    >
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-[24px] italic leading-none text-ink-900">
        {plan.name}
      </h2>

      <div className="mt-1 text-[26px] font-semibold leading-none text-ink-900">
        <span aria-hidden="true">{amount}</span>
        <span className="text-[13px] font-normal text-ink-400">{period}</span>
        <span className="sr-only">{amount}{period}</span>
      </div>

      <ul className="mt-3.5 mb-[18px] list-none">
        <li className="flex items-center gap-2 py-[6px] text-[13px] text-ink-600">
          <CheckIcon />
          {plan.limits.links}
        </li>
        <li className="flex items-center gap-2 py-[6px] text-[13px] text-ink-600">
          <CheckIcon />
          {plan.limits.views}
        </li>
        <li className="flex items-center gap-2 py-[6px] text-[13px] text-ink-600">
          <CheckIcon />
          {plan.limits.customDomains}
        </li>
        <li className="flex items-center gap-2 py-[6px] text-[13px] text-ink-600">
          <CheckIcon />
          {plan.limits.storage}
        </li>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 py-[6px] text-[13px] text-ink-600">
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>

      <Button className="w-full" onClick={() => onEdit(plan.plan)}>
        Edit plan
      </Button>
    </section>
  );
}

function splitPrice(price: string) {
  if (price === "Free") return { amount: "Free", period: "" };
  const [amount, period = ""] = price.split("/");
  return { amount, period: `/${period}` };
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px] flex-none text-green-500"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}
