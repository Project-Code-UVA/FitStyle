import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "⬡",
    title: "AI Body Analysis",
    desc: "Pose detection maps your shoulder width, hip ratio, and torso length — giving our AI your real proportions, not a guess.",
  },
  {
    icon: "◈",
    title: "Personal Style Profile",
    desc: "Set your vibe, color palette, preferred fit, and occasions. Your style profile powers every recommendation we make.",
  },
  {
    icon: "◎",
    title: "Smart Outfit Picks",
    desc: "Get curated outfit ideas matched to your body shape and taste — style advice that actually fits who you are.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Scan or Upload",
    desc: "Use your webcam or upload a photo. Our AI reads your body landmarks and maps your proportions in seconds.",
  },
  {
    num: "02",
    title: "Build Your Profile",
    desc: "Answer a few quick questions about your style preferences, color palette, and the occasions you dress for.",
  },
  {
    num: "03",
    title: "Get Your Outfits",
    desc: "Receive outfit recommendations tailored to your body and aesthetic. No generic advice — just looks made for you.",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
        <span className="text-xl font-bold tracking-tight">FitStyle</span>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-all active:scale-95"
        >
          Log In
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-8 tracking-wide uppercase">
            ✦ AI-Powered Fashion Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Style advice that<br />
            <span className="text-sky-400">fits your body.</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            FitStyle combines AI body analysis with your personal style preferences
            to recommend outfits that look great on <em>you</em> — not just on a model.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl bg-sky-400 text-zinc-900 font-semibold hover:bg-sky-300 transition-all active:scale-95"
            >
              Get Started Free
            </button>
            <button className="px-8 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:border-zinc-500 hover:text-white transition-all">
              See How It Works
            </button>
          </div>

          <p className="text-zinc-600 text-sm mt-6">No credit card required · Free to use</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for how you actually dress
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Every recommendation is backed by real body measurements and personal
              style data — not generic, one-size-fits-all advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all"
              >
                <div className="text-4xl text-sky-400 mb-5">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 md:px-12 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-zinc-400">Three steps to a wardrobe that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col gap-3">
                <span className="text-6xl font-bold text-zinc-800 leading-none">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to dress smarter?
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Start building your style profile today — it only takes 2 minutes.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 rounded-xl bg-sky-400 text-zinc-900 font-bold text-lg hover:bg-sky-300 transition-all active:scale-95"
          >
            Start for Free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-900 py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-bold text-zinc-300">FitStyle</span>
        <p className="text-zinc-600 text-sm">© 2026 FitStyle. AI-powered style intelligence.</p>
        <div className="flex gap-6 text-sm text-zinc-600">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
