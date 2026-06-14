export default function CTA() {
  return (
    <section className="section relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-900/40 via-surface to-teal-900/40" />
      <div className="absolute inset-0 bg-glow opacity-80" />

      <div className="section-container relative z-10">
        <div className="glass rounded-3xl p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden border-gold-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <span className="section-label">Get Started</span>
            <h2 className="section-title max-w-3xl mx-auto">
              Ready to multiply your team&apos;s{" "}
              <span className="gradient-text">output</span> by 10x?
            </h2>
            <p className="mt-5 text-lg text-text-secondary max-w-xl mx-auto">
              Join 2,000+ forward-thinking companies already using InfiniteAgent
              to automate the impossible. Start your free trial today — no credit
              card needed.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#get-started"
                className="btn-primary text-base px-10 py-4 text-lg"
              >
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
              <a href="#contact" className="btn-ghost">
                Talk to Sales
              </a>
            </div>

            <p className="mt-6 text-xs text-text-muted">
              No credit card required &middot; 14-day free trial &middot; Cancel
              anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
