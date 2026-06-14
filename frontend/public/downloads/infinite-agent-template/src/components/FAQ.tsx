import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does InfiniteAgent differ from traditional automation tools?",
    answer:
      "Traditional tools rely on rigid, rule-based workflows that break when inputs change. InfiniteAgent uses LLM-powered reasoning to understand context, adapt to new situations, and make judgment calls — just like a human teammate would. This means it handles edge cases, ambiguous instructions, and multi-step decisions without constant hand-holding.",
  },
  {
    question: "Can I connect my existing tools and workflows?",
    answer:
      "Absolutely. InfiniteAgent ships with native connectors for 200+ popular tools including Slack, Notion, GitHub, GitLab, Jira, Linear, Google Workspace, Microsoft 365, Salesforce, HubSpot, and more. If your tool isn't supported yet, you can use our webhook API or build a custom connector with our SDK.",
  },
  {
    question: "How long does it take to train a custom agent?",
    answer:
      "Most users have a production-ready agent within 30 minutes. For basic use cases, you can simply describe what you need in natural language and the agent configures itself. For advanced custom training with your proprietary data, expect 2–4 hours of setup time, after which the agent continuously improves through reinforcement learning.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Yes. InfiniteAgent is SOC 2 Type II certified. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We offer dedicated VPC deployment for Enterprise plans, granular RBAC, full audit trails, and data retention policies that you control. We never train foundational models on your data.",
  },
  {
    question: "What happens if an agent makes a mistake?",
    answer:
      "Every action an agent takes is logged in a human-readable audit trail. You can review, approve, or reject actions in real time through the dashboard. For critical workflows, you can enable human-in-the-loop gates that require approval before an agent executes high-impact actions. Agents also self-correct — if an error is detected, they roll back and try an alternative approach.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. All plans — including annual — can be cancelled at any time with no penalties. If you cancel mid-cycle, you retain access until the end of your billing period. We also offer a 14-day free trial on the Pro plan with no credit card required.",
  },
];

const itemVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease: "easeInOut" },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section id="faq" className="section">
      <div className="section-container max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">
            Answers to <span className="gradient-text">common questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <div
                key={i}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-text-primary pr-4">
                    {faq.question}
                  </span>
                  <motion.svg
                    className="w-5 h-5 text-text-muted flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
