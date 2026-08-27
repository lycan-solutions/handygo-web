import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  GraduationCap,
  IdCard,
  MapPin,
  ScanFace,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Become an Ustaad — Handygo",
  description:
    "Handygo verifies every Ustaad in person and trains them for a full day before they take a single job. If you have the skill, this is how you join.",
};

/**
 * The point of this page is that the bar is real. Every claim below maps to
 * something the system actually tracks — WorkerOnboardingStatus has a REJECTED
 * state, FaceMatchStatus is set by a human admin comparing CNIC to a live
 * selfie, and TrainingStatus has NEEDS_RETRAINING. Nothing here is decoration.
 */
const GATES = [
  {
    icon: IdCard,
    step: "Documents",
    title: "CNIC, front and back, plus a live selfie",
    body: "Not a form you fill in — actual documents, uploaded from your own phone.",
  },
  {
    icon: ScanFace,
    step: "Identity",
    title: "A person checks the photo against your face",
    body: "No software does this. Someone on our team compares your CNIC to your selfie and decides. If it does not match, you do not proceed.",
  },
  {
    icon: UserCheck,
    step: "In person",
    title: "We meet you before you meet a customer",
    body: "You come and sit with us. We ask about your work, where you have worked, and what you can actually do. Some people are turned away here.",
  },
  {
    icon: GraduationCap,
    step: "Training",
    title: "A full day, taught by us",
    body: "Before your first job you spend a day with our team. Skill is not enough on its own — how you speak to a customer in their home, how you quote, how you leave the place, all of it matters.",
  },
];

const WHY = [
  {
    icon: Banknote,
    title: "Cash, on the spot",
    body: "The customer pays you when the work is done. No waiting weeks to be paid.",
  },
  {
    icon: Star,
    title: "Good work gets seen",
    body: "Customers rate you after every job, and a strong rating brings more work. Your reputation is yours to build.",
  },
  {
    icon: MapPin,
    title: "Work close to home",
    body: "Jobs in DHA and Clifton, near where you already are. Less time on the road, more jobs in a day.",
  },
];

export default function BecomeAnUstaadPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div style={{ background: "var(--brand)" }} className="py-16 px-5 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              For Ustaads
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 max-w-2xl">
              We do not hand out jobs. We choose who gets them.
            </h1>
            <p
              className="text-base leading-7 max-w-2xl"
              style={{ color: "var(--brand-light)" }}
            >
              Anyone can call themselves an Ustaad. On Handygo you are verified
              in person, trained for a full day by our own team, and only then
              sent into somebody&apos;s home. That is the whole point of the
              platform — and it is why customers trust the Ustaads on it.
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            Four gates before your first job
          </h2>
          <p className="text-zinc-600 text-sm leading-7 mb-9 max-w-2xl">
            Each one is a real check, and each one turns people away. If you are
            good at your work, none of it should worry you.
          </p>

          <ol className="space-y-4">
            {GATES.map(({ icon: Icon, step, title, body }, i) => (
              <li
                key={title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 flex gap-5"
              >
                <div className="shrink-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--brand-light)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--brand)" }} />
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-1"
                    style={{ color: "var(--brand)" }}
                  >
                    {i + 1} · {step}
                  </p>
                  <h3 className="font-bold text-zinc-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-600 leading-7">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Said out loud rather than implied. A page that only lists benefits
              attracts everyone; this page is meant to attract the right people
              and deter the rest. */}
          <div
            className="mt-6 rounded-2xl border p-6 flex gap-4"
            style={{ borderColor: "var(--urgent)", background: "var(--urgent-soft)" }}
          >
            <XCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "var(--urgent)" }}
            />
            <div>
              <h3 className="font-bold mb-1" style={{ color: "var(--urgent)" }}>
                Applications do get rejected
              </h3>
              <p className="text-sm text-zinc-700 leading-7">
                If the identity check fails, if the work is not up to standard,
                or if the training day shows you are not ready, you will not be
                approved. Some Ustaads are asked to train again before they
                start. We would rather lose an Ustaad than send the wrong person
                into a customer&apos;s home.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-100 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Who we are looking for
            </h2>
            <p className="text-zinc-600 text-sm leading-7 mb-8 max-w-2xl">
              Trade skill is the first requirement, not the only one.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Real, working experience in AC, plumbing, electrical, appliance repair or carpentry",
                "A clean original CNIC in your own name",
                "You live or work in DHA or Clifton",
                "You can give a full day to training before your first job",
                "A smartphone you use every day",
                "You are willing to be rated by every customer you serve",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-5"
                >
                  <CheckCircle2
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "var(--brand)" }}
                  />
                  <span className="text-sm text-zinc-700 leading-6">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">
            What you get once you are in
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {WHY.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <Icon className="w-5 h-5 mb-4" style={{ color: "var(--brand)" }} />
                <h3 className="font-bold text-zinc-900 mb-1.5">{title}</h3>
                <p className="text-sm text-zinc-600 leading-6">{body}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-10 rounded-2xl p-8 sm:p-10 text-center"
            style={{ background: "var(--surface-subtle)" }}
          >
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              Think you meet the bar?
            </h2>
            <p className="text-zinc-600 text-sm leading-7 max-w-lg mx-auto mb-7">
              The app launches on Google Play shortly. Write to us with your
              trade and how long you have been doing it, and we will call you to
              arrange the interview and your training day.
            </p>
            <a
              href="mailto:support@handygo.ai?subject=Ustaad%20application&body=Trade%3A%20%0AYears%20of%20experience%3A%20%0AArea%3A%20"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--brand)" }}
            >
              Apply to join
            </a>
            <p className="text-xs text-zinc-500 mt-5">
              Looking to book a job instead?{" "}
              <Link href="/how-it-works" style={{ color: "var(--brand)" }}>
                See how booking works
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
