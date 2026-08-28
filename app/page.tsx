import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Qr from "../components/handygo/AppQrCard";
export const metadata: Metadata = {
  title: "Handygo — On-Demand Home Repair & Service Booking",
  description:
    "Book trusted home repair and maintenance services instantly. Post a job, receive worker bids, track live progress, and chat securely.",
};

function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconBid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconTrack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

function IconReview() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 items-start py-5 border-b border-zinc-100 last:border-0">
      <div
        className="mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--brand-light)", color: "var(--brand)" }}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-zinc-900 mb-1">{title}</p>
        <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ background: "var(--brand)" }}
    >
      {n}
    </span>
  );
}

// Service names and images match Flutter app kServiceCategories in service_data.dart
const SERVICES = [
  {
    name: "AC Help",
    desc: "Air conditioning installation, repair & maintenance",
    image: "/images/services/ac.jpg",
    gradient: "from-cyan-50 to-teal-100",
    accent: "#0891b2",
  },
  {
    name: "Pest Control",
    desc: "Pest extermination & prevention treatments",
    image: "/images/services/pest.png",
    gradient: "from-lime-50 to-green-100",
    accent: "#4d7c0f",
  },
  {
    name: "Handyman",
    desc: "General home repairs, assembly & odd jobs",
    image: "/images/services/handyman.jpg",
    gradient: "from-slate-50 to-slate-100",
    accent: "#475569",
  },
  {
    name: "Deep Cleaning",
    desc: "Deep cleaning, housekeeping & sanitisation",
    image: "/images/services/deepcleaning.png",
    gradient: "from-emerald-50 to-green-100",
    accent: "#059669",
  },
  {
    name: "Paint / Painter",
    desc: "Interior & exterior painting and finishing",
    image: "/images/services/painting.jpg",
    gradient: "from-rose-50 to-pink-100",
    accent: "#e11d48",
  },
  {
    name: "Plumbing",
    desc: "Pipe fitting, leaks, drains & plumbing fixtures",
    image: "/images/services/plumber.jpg",
    gradient: "from-blue-50 to-sky-100",
    accent: "#2563eb",
  },
  {
    name: "Electrical",
    desc: "Electrical wiring, fuse boards, fixtures & repairs",
    image: "/images/services/electrician.jpg",
    gradient: "from-yellow-50 to-amber-100",
    accent: "#d97706",
  },
  {
    name: "Carpentry",
    desc: "Furniture, woodwork & carpentry repairs",
    image: "/images/services/carpenter.jpg",
    gradient: "from-stone-50 to-amber-50",
    accent: "#92400e",
  },
  {
    name: "Gardening",
    desc: "Garden maintenance, lawn care & landscaping",
    image: "/images/services/gardening.jpg",
    gradient: "from-green-50 to-emerald-100",
    accent: "#15803d",
  },
  {
    name: "Car Wash",
    desc: "Professional car washing & detailing at home",
    image: "/images/services/carwash.png",
    gradient: "from-sky-50 to-blue-100",
    accent: "#0284c7",
  },
];

function ServicesSection() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-12">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            What we cover
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
            Services made simple
          </h2>
          <p className="text-zinc-500 max-w-xl leading-relaxed">
            From urgent fixes to planned maintenance, Handygo helps customers
            connect with nearby skilled workers.
          </p>
        </div>

        {/* Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-zinc-100 flex flex-col"
            >
              {/* Service image */}
              <div className="relative w-full h-36 overflow-hidden">
                <Image
                  src={svc.image}
                  alt={svc.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              <div className="p-4">
                <p className="font-semibold text-zinc-900 text-sm leading-tight">{svc.name}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: svc.accent }}>
                  {svc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-zinc-400 text-center">
          More service categories will be available in the app.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-white pt-16 pb-24 px-5 sm:px-8">
          {/* Warm blob */}
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "var(--brand)" }}
          />
          <div className="relative max-w-6xl mx-auto">
            <div className="max-w-2xl">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6"
                style={{ background: "var(--brand-light)", color: "var(--brand)" }}
              >
                On-Demand Home Services
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight tracking-tight mb-6">
                Home repairs,{" "}
                <span style={{ color: "var(--brand)" }}>done right.</span>
                <br />
                Book in minutes.
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mb-10">
                Handygo connects you with skilled local workers for any home
                repair or maintenance job. Post a job, compare bids, track
                progress live — all from your phone.
              </p>
              <div className="flex flex-wrap gap-4">
                <div
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-white text-sm cursor-default select-none"
                  style={{ background: "var(--brand)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3 18.5v-13A1.5 1.5 0 0 1 4.914 4.1l12.5 6.5a1.5 1.5 0 0 1 0 2.8l-12.5 6.5A1.5 1.5 0 0 1 3 18.5z" />
                  </svg>
                  Coming soon on Google Play
                </div>
                <a
                  href="mailto:support@handygo.ai"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-zinc-700 border border-zinc-200 text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>

            {/* Floating phone mockup */}
            <div
              aria-hidden
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-64 h-[460px] rounded-[2.5rem] border-4 border-zinc-200 overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(160deg, var(--brand-light) 0%, var(--surface-subtle) 100%)" }}
            >
              <div className="pt-10 px-5 flex flex-col gap-3">
                <div className="h-2 w-20 rounded-full bg-zinc-300" />
                <div className="h-2 w-32 rounded-full bg-zinc-200" />
                <div
                  className="mt-4 rounded-xl p-3 text-xs text-white font-semibold"
                  style={{ background: "var(--brand)" }}
                >
                  New bid received
                </div>
                <div className="rounded-xl p-3 border border-zinc-200 bg-white text-xs text-zinc-600">
                  Worker arriving in 12 min
                </div>
                <div className="rounded-xl p-3 border border-zinc-200 bg-white text-xs text-zinc-600">
                  Job completed ✓
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} viewBox="0 0 12 12" style={{ fill: "var(--brand)" }} className="w-4 h-4">
                      <polygon points="6 1 7.5 4.5 11 5 8.5 7.5 9 11 6 9.5 3 11 3.5 7.5 1 5 4.5 4.5 6 1" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ background: "var(--brand)" }} className="py-10 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center">
            {[
              { v: "Fast", l: "Booking in minutes" },
              { v: "Live", l: "Real-time tracking" },
              { v: "Safe", l: "Verified workers" },
              { v: "Simple", l: "No hidden fees" },
            ].map((s) => (
              <div key={s.v}>
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-sm opacity-80 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <ServicesSection />

        {/* How it works */}
        <section className="py-20 px-5 sm:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
              How Handygo works
            </h2>
            <p className="text-zinc-500 mb-12 max-w-xl">
              Three simple steps from posting your job to getting it done.
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  n: 1,
                  title: "Post your job",
                  desc: "Describe what needs fixing, add photos or a voice note, and share your location. Your job is posted instantly.",
                },
                {
                  n: 2,
                  title: "Receive bids",
                  desc: "Nearby workers see your job and send offers with prices. Compare, chat, and pick the best fit.",
                },
                {
                  n: 3,
                  title: "Track & review",
                  desc: "Watch your worker's progress live on the map, communicate via chat, and leave a review when the job is done.",
                },
              ].map((step) => (
                <div key={step.n} className="flex flex-col gap-4">
                  <StepBadge n={step.n} />
                  <h3 className="font-semibold text-zinc-900 text-lg">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — two-column */}
        <section className="py-20 px-5 sm:px-8" style={{ background: "#faf8f6" }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
            {/* For Customers */}
            <div>
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: "var(--brand-light)", color: "var(--brand)" }}
              >
                For Customers
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Get any repair done fast
              </h2>
              <FeatureCard
                icon={<IconWrench />}
                title="Post any job"
                desc="From plumbing to painting — post any home repair or maintenance job in seconds with photos and location."
              />
              <FeatureCard
                icon={<IconBid />}
                title="Compare worker bids"
                desc="Receive competitive offers from nearby workers. Chat with candidates before you decide."
              />
              <FeatureCard
                icon={<IconTrack />}
                title="Live job tracking"
                desc="Track your worker's location in real time when they're on the way. No more guessing when they'll arrive."
              />
              <FeatureCard
                icon={<IconChat />}
                title="Rich in-app chat"
                desc="Send messages, images, videos, voice notes, and share your location — all within the conversation."
              />
              <FeatureCard
                icon={<IconReview />}
                title="Rate completed jobs"
                desc="Leave honest reviews after every job to help the community find the best workers."
              />
            </div>

            {/* For Workers */}
            <div>
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: "var(--brand-light)", color: "var(--brand)" }}
              >
                For Workers
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                Find work near you
              </h2>
              <FeatureCard
                icon={<IconLocation />}
                title="Nearby job requests"
                desc="Receive job notifications for requests in your area. Pick the jobs that match your skills and schedule."
              />
              <FeatureCard
                icon={<IconBid />}
                title="Send competitive bids"
                desc="Submit your price and availability to clients. Win jobs by offering clear, fair quotes."
              />
              <FeatureCard
                icon={<IconChat />}
                title="Chat with clients"
                desc="Clarify job details, share progress updates, and send photos — all through secure in-app messaging."
              />
              <FeatureCard
                icon={<IconTrack />}
                title="Update job progress"
                desc="Keep clients informed with real-time status updates as you work through each stage of the job."
              />
              <FeatureCard
                icon={<IconWrench />}
                title="Manage your work"
                desc="View all your active and completed jobs in one place. Build your rating and reputation on the platform."
              />
            </div>
          </div>
        </section>

        {/* Pre-footer: App coming soon */}
        <section className="py-24 px-5 sm:px-8 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

            {/* Phone mockup */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start w-full lg:w-auto">
              <div className="relative">
                {/* Glow behind phone */}
                <div
                  aria-hidden
                  className="absolute inset-0 scale-110 rounded-[3rem] blur-3xl opacity-20"
                  style={{ background: "var(--brand)" }}
                />
                {/* Phone shell */}
                <div
                  className="relative w-[220px] sm:w-[240px] h-[460px] sm:h-[500px] rounded-[2.75rem] border-[3px] border-zinc-200 shadow-2xl overflow-hidden flex flex-col"
                  style={{ background: "linear-gradient(160deg, var(--brand-light) 0%, var(--surface-subtle) 60%, var(--surface) 100%)" }}
                >
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <span className="text-[10px] font-semibold text-zinc-500">9:41</span>
                    <div className="w-16 h-4 rounded-full bg-zinc-900/80" />
                    <span className="text-[10px] font-semibold text-zinc-500">●●●</span>
                  </div>

                  {/* App header */}
                  <div className="px-4 pt-2 pb-3 flex items-center gap-2 border-b border-zinc-100">
                    <Image
                      src="/images/logo-teal.png"
                      alt="Handygo"
                      width={22}
                      height={22}
                      className="rounded-md"
                    />
                    <span className="text-sm font-bold" style={{ color: "var(--brand)" }}>Handygo</span>
                  </div>

                  {/* App body */}
                  <div className="flex-1 px-4 pt-4 flex flex-col gap-3">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Status</p>
                    <div
                      className="rounded-xl px-3 py-2.5 text-white"
                      style={{ background: "var(--brand)" }}
                    >
                      <p className="text-[10px] font-semibold opacity-80 mb-0.5">NEW</p>
                      <p className="text-xs font-bold">New worker bid received</p>
                    </div>
                    <div className="rounded-xl px-3 py-2.5 border border-zinc-100 bg-white">
                      <p className="text-[10px] font-semibold text-zinc-400 mb-0.5">EN ROUTE</p>
                      <p className="text-xs font-semibold text-zinc-700">Worker arriving in 8 min</p>
                    </div>
                    <div className="rounded-xl px-3 py-2.5 border border-zinc-100 bg-white">
                      <p className="text-[10px] font-semibold text-zinc-400 mb-0.5">DONE</p>
                      <p className="text-xs font-semibold text-zinc-700">Job completed ✓</p>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} viewBox="0 0 12 12" style={{ fill: "var(--brand)" }} className="w-3.5 h-3.5">
                          <polygon points="6 1 7.5 4.5 11 5 8.5 7.5 9 11 6 9.5 3 11 3.5 7.5 1 5 4.5 4.5 6 1" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-auto pb-4">Book repairs. Track workers. Chat live.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="flex-1 text-center lg:text-center">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
                style={{ background: "var(--brand-light)", color: "var(--brand)" }}
              >
                App Launch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-5">
                Handygo is coming soon<br className="hidden sm:block" /> on{" "}
                <span style={{ color: "var(--brand)" }}>Google Play</span>
              </h2>
              <p className="text-zinc-500 leading-relaxed   mx-auto lg:mx-0 mb-8" style={{ textAlign: "center" }}>
                We&apos;re preparing the first public release for Android. The app will let
                customers book repair services, compare worker offers, track jobs live on
                the map, and chat in real time — all in one place.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-center">
                <div
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white text-sm cursor-default select-none"
                  style={{ background: "var(--brand)" }}
                >
                  {/* Play icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M3 18.5v-13A1.5 1.5 0 0 1 4.914 4.1l12.5 6.5a1.5 1.5 0 0 1 0 2.8l-12.5 6.5A1.5 1.5 0 0 1 3 18.5z" />
                  </svg>
                  Coming soon on Google Play
                </div>
                <a
                  href="mailto:support@handygo.ai"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-zinc-700 border border-zinc-200 text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Qr />
      <Footer />
    </>
  );
}
