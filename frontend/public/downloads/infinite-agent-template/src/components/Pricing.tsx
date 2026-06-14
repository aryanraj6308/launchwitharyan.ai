import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "Perfect for small teams getting started with AI automation.",
    features: [
      "Up to 5 custom agents",
      "1,000 task executions / mo",
      "Slack & email integrations",
      "Basic analytics dashboard",
      "Community support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "For growing teams that need advanced automation at scale.",
    features: [
      "Unlimited agents",
      "50,000 task executions / mo",
      "200+ integrations",
      "Real-time analytics & logs",
      "Custom training (2 models)",
      "Priority email & chat support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    description: "Custom solutions for organizations with complex workflows.",
    features: [
      "Everything in Pro",
      "Unlimited executions",
      "Dedicated agent training",
      "SSO & SAML / SCIM",
      "SOC 2 Type II reports",
      "99.99% SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="section bg-surface-2">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="section-label">Pricing</span>
          <h2 className="section-title">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="section-desc">
            No hidden fees. No surprises. Scale up or down anytime.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span
            className={`text-sm font-medium transition-colors ${
              !yearly ? "text-text-primary" : "text-text-muted"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly((y) => !y)}
            className="relative w-14 h-7 rounded-full bg-border cursor-pointer transition-colors hover:bg-border-hover"
            aria-label={`Switch to ${yearly ? "monthly" : "yearly"} billing`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                yearly ? "translate-x-7" : ""
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              yearly ? "text-text-primary" : "text-text-muted"
            }`}
          >
            Yearly{" "}
            <span className="text-teal-400 text-xs font-semibold">
              Save 20%
            </span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {plans.map((plan, i) => (
              <motion.div
                key={`${plan.name}-${yearly}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className={`relative glass rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "border-gold-500/40 shadow-lg shadow-gold-500/10 scale-[1.02] md:scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-xs font-bold text-white tracking-wide">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold font-display text-text-primary mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold font-display text-text-primary">
                    ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-text-muted text-sm ml-1.5">
                    /{yearly ? "year" : "month"}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
                    >
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
