import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "VP of Engineering, DataFlow",
    avatar: "SC",
    content:
      "We reduced our incident response time by 78% within two weeks of deploying InfiniteAgent. Its autonomous triage capabilities are nothing short of revolutionary.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "CTO, BuildStack",
    avatar: "MR",
    content:
      "The custom training feature let us encode years of domain expertise into agents that now handle 60% of our Level 1 & 2 support tickets autonomously.",
    rating: 5,
  },
  {
    name: "Priya Kapoor",
    role: "Director of Ops, CloudNine",
    avatar: "PK",
    content:
      "InfiniteAgent connected our entire toolchain in under an hour. The ROI was immediate — we're seeing 12+ hours saved per team member every week.",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-4" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < count ? "text-gold-400" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="testimonials" ref={ref} className="section">
      <div className="section-container">
        <div className="text-center mb-16">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">
            Loved by teams who{" "}
            <span className="gradient-text">ship fast</span>
          </h2>
          <p className="section-desc">
            Hear from engineering leaders who transformed their operations with
            InfiniteAgent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ y: 60, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="glass glass-hover rounded-2xl p-8 flex flex-col"
            >
              <StarRating count={t.rating} />
              <blockquote className="text-text-secondary leading-relaxed text-sm flex-1">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">
                    {t.name}
                  </div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
