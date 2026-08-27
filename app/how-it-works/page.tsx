import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  ClipboardList,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "How it works — Handygo",
  description:
    "Post a job, agree the price, track your Ustaad, pay cash when the work is done. How booking a home repair on Handygo actually works.",
};

/** Mirrors the real booking lifecycle in the app, not an idealised version. */
const STEPS = [
  {
    icon: ClipboardList,
    title: "Post the job",
    body: "Pick the service, say what the problem is, add photos or a voice note if it is easier than typing. Set the address and when you want it.",
  },
  {
    icon: Banknote,
    title: "Agree the price",
    body: "Depending on the job you either see a fixed price, receive rates from nearby Ustaads and pick one, or book an inspection so an Ustaad can look before quoting. Nothing starts until you accept an amount.",
  },
  {
    icon: MapPin,
    title: "Track them to your door",
    body: "Once an Ustaad accepts, you can see where they are on the map and chat with them in the app. No guessing whether anyone is actually coming.",
  },
  {
    icon: Star,
    title: "Pay and rate",
    body: "Pay in cash when the work is finished, then rate the Ustaad. Ratings are what keep good Ustaads visible and push bad ones out.",
  },
];

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Every Ustaad is verified and trained by us",
    body: "Someone on our team compares their CNIC to a live photo, meets them face to face, and puts them through a full day of training before they take a single job. A stranger is coming into your home — that should not be a leap of faith.",
  },
  {
    icon: Wrench,
    title: "Bad work gets redone",
    body: "If the job was not done properly, report it in the app. We look at it and have the work done again. You should not have to argue about it.",
  },
  {
    icon: MessageSquare,
    title: "Cancelling costs nothing",
    body: "Change your mind and there is no charge — for you or for the Ustaad. If they are already on the way we will tell you, because their time counts too.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div
          style={{ background: "var(--brand-light)" }}
          className="py-14 px-5 sm:px-8 border-b border-zinc-100"
        >
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "var(--surface)", color: "var(--brand)" }}
            >
              How it works
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Four steps, no surprises.
            </h1>
            <p className="text-zinc-600 text-base leading-7 max-w-2xl">
              Finding someone to fix a leak should not mean three phone calls
              and a price you only hear once the work is finished. Here is
              exactly what happens on Handygo.
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <ol className="space-y-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
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
                    Step {i + 1}
                  </p>
                  <h2 className="font-bold text-zinc-900 mb-1.5">{title}</h2>
                  <p className="text-sm text-zinc-600 leading-7">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-zinc-100 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              What we hold ourselves to
            </h2>
            <p className="text-zinc-600 text-sm leading-7 mb-8 max-w-2xl">
              Three things, written plainly, so you can hold us to them.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-zinc-200 p-6">
                  <Icon className="w-5 h-5 mb-4" style={{ color: "var(--brand)" }} />
                  <h3 className="font-bold text-zinc-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-600 leading-6">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Are you an Ustaad?
            </h2>
            <p className="text-zinc-600 text-sm leading-7 max-w-lg mx-auto mb-7">
              If you do AC, plumbing, electrical, appliance or carpentry work in
              DHA or Clifton, you can get jobs through Handygo. Approval is
              usually same day.
            </p>
            <Link
              href="/become-an-ustaad"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--brand)" }}
            >
              Join as an Ustaad
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
