import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🧠",
    title: "Autonomous Reasoning",
    description:
      "Agents analyze context, break down complex tasks, and execute multi-step plans without human intervention.",
  },
  {
    icon: "🔗",
    title: "Seamless Integrations",
    description:
      "Connect with Slack, Notion, GitHub, Jira, and 200+ tools through native connectors and webhooks.",
  },
  {
    icon: "📊",
    title: "Real-Time Analytics",
    description:
      "Monitor agent performance, task completion rates, and operational metrics on a live dashboard.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    description:
      "SOC 2 compliant, end-to-end encrypted, with granular role-based access control and audit logs.",
  },
  {
    icon: "⚡",
    title: "Low-Latency Execution",
    description:
      "Agents respond in under 200ms with edge-optimized inference and intelligent caching layers.",
  },
  {
    icon: "🎯",
    title: "Custom Training",
    description:
      "Fine-tune agents on your proprietary data, workflows, and business rules for personalized automation.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="section bg-surface-2">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="section-label">Features</span>
          <h2 className="section-title">
            Everything you need to{" "}
            <span className="gradient-text">automate</span> at scale
          </h2>
          <p className="section-desc">
            A unified platform packed with capabilities that turn hours of manual
            work into seconds of autonomous execution.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="glass glass-hover rounded-2xl p-8 group cursor-default"
            >
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold-500/10 text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </span>
              <h3 className="text-xl font-semibold font-display text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
