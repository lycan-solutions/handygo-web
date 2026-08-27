import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  CalendarCheck,
  CheckCircle2,
  IdCard,
  MapPin,
  Smartphone,
  Star,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Become an Ustaad — Handygo",
  description:
    "Get repair jobs in DHA and Clifton, Karachi. Register on the Handygo app, get verified, and start receiving work. Approval is usually same day.",
};

const NEED = [
  { icon: IdCard, text: "Your original CNIC" },
  { icon: Smartphone, text: "A phone number you use every day" },
  { icon: MapPin, text: "You work in DHA or Clifton" },
  {
    icon: CheckCircle2,
    text: "Real skill in AC, plumbing, electrical, appliance repair or carpentry",
  },
];

const STEPS = [
  {
    title: "Register in the app",
    body: "Download Handygo, choose “I am an Ustaad”, and sign up with your phone number.",
  },
  {
    title: "Send your documents",
    body: "CNIC front and back, and a selfie. This is how we know the person taking the job is the person in the picture.",
  },
  {
    title: "Meet us in person",
    body: "We verify you face to face before you get work. Approval is usually the same day, subject to that meeting.",
  },
  {
    title: "Start taking jobs",
    body: "Once approved, jobs near you appear in the app. Accept the ones you want.",
  },
];

const WHY = [
  {
    icon: Banknote,
    title: "Cash, on the spot",
    body: "The customer pays you in cash when the work is done. No waiting weeks to be paid.",
  },
  {
    icon: CalendarCheck,
    title: "You choose the work",
    body: "Nobody assigns you a job. You see what is near you and take what suits your day.",
  },
  {
    icon: Star,
    title: "Good work gets seen",
    body: "Customers rate you after every job, and a strong rating brings more work. Your reputation is yours.",
  },
];

export default function BecomeAnUstaadPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div
          style={{ background: "var(--brand)" }}
          className="py-14 px-5 sm:px-8"
        >
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              For Ustaads
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Work near you. Paid the same day.
            </h1>
            <p
              className="text-base leading-7 max-w-2xl"
              style={{ color: "var(--brand-light)" }}
            >
              If you fix ACs, pipes, wiring, appliances or furniture in DHA or
              Clifton, Handygo brings the customers to you. You keep choosing
              which jobs to take, and you get paid in cash when the work is
              finished.
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            What you need
          </h2>
          <p className="text-zinc-600 text-sm leading-7 mb-8 max-w-2xl">
            No shop, no company, no paperwork beyond this.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {NEED.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-5"
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "var(--brand)" }}
                />
                <span className="text-sm text-zinc-700 leading-6">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-zinc-100 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">
              Joining takes four steps
            </h2>
            <ol className="space-y-4">
              {STEPS.map(({ title, body }, i) => (
                <li key={title} className="flex gap-5">
                  <span
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "var(--brand-light)",
                      color: "var(--brand)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
                    <p className="text-sm text-zinc-600 leading-7">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">
            Why Ustaads stay
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {WHY.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6">
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
              The app is almost here
            </h2>
            <p className="text-zinc-600 text-sm leading-7 max-w-lg mx-auto mb-7">
              Handygo is launching on Google Play shortly. If you want to be one
              of the first Ustaads on the platform, write to us and we will get
              you registered as soon as it is live.
            </p>
            <a
              href="mailto:support@handygo.ai?subject=I%20want%20to%20join%20as%20an%20Ustaad"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--brand)" }}
            >
              Write to us
            </a>
            <p className="text-xs text-zinc-500 mt-5">
              Already a customer?{" "}
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
