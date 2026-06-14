import { useEffect, useRef } from "react";
import gsap from "gsap";

const words = ["Intelligence.", "Automation.", "Freedom."];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headlineRef.current?.querySelectorAll(".word"),
        { y: 60, opacity: 0, rotateX: -30 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.12 }
      )
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current?.querySelectorAll("a, button"),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-surface pt-24 pb-20"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-glow-gold opacity-60 animate-pulse-slow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative z-10 section-container text-center py-0">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-border bg-surface-2/50 text-xs font-medium text-gold-400 tracking-wide">
          Now in Public Beta
        </div>

        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-[1.1]"
        >
          {words.map((word, i) => (
            <span key={word} className="block">
              <span
                className="word inline-block"
                style={{ willChange: "transform, opacity" }}
              >
                {word}
              </span>
            </span>
          ))}
          <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text-secondary font-normal">
            Powered by{" "}
            <span className="gradient-text font-bold">Infinite Agents</span>
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          Deploy autonomous AI agents that learn your workflow, make decisions in
          real time, and scale across every tool you use. No code required.
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#waitlist" className="btn-primary text-base px-8 py-4">
            Start Free Trial
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a href="#demo" className="btn-secondary text-base px-8 py-4">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Watch Demo
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs text-text-muted uppercase tracking-widest font-medium">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale">
            {["Vercel", "Raycast", "Linear", "Notion"].map((name) => (
              <span
                key={name}
                className="text-lg font-bold text-text-secondary tracking-tight"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
          }
          .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        `}
      </style>
    </section>
  );
}
