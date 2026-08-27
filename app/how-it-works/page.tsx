import type { Metadata } from "next";
import { MessageSquare, ShieldCheck, Wrench } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StepTour, { type TourStep } from "./StepTour";

export const metadata: Metadata = {
  title: "How it works — Handygo",
  description:
    "Post a job, agree the price, track your Ustaad, pay cash when the work is done. How booking a home repair on Handygo actually works.",
};

/**
 * The four steps, each shown as the actual app screen it happens on. The
 * images are exports from the Handygo prototype — the same screens the app is
 * built from — so the page teaches the real flow rather than describing it.
 *
 * Example rates inside the screenshots are blurred on purpose: the app shows
 * the real amount before you confirm, and a number printed on a marketing page
 * goes stale the day it changes.
 */
const STEPS: readonly TourStep[] = [
  {
    image: "/images/how-it-works/1-post.jpg",
    alt: "The Handygo request screen: what needs doing, who supplies the part, a photo and a voice note.",
    title: "Post the job",
    lines: [
      "Pick the service and say what the problem is.",
      "Add photos or a voice note instead of typing it out.",
      "Set the address and the time that suits you.",
    ],
  },
  {
    image: "/images/how-it-works/2-price.jpg",
    alt: "The offers screen: three CNIC-verified Ustaads with their rate, what is included and when they can come.",
    title: "Agree the price",
    lines: [
      "Either the price is fixed, or nearby Ustaads send you their rates.",
      "Each offer shows what is included, with parts and labour separately.",
      "Nothing starts until you accept an amount.",
    ],
  },
  {
    image: "/images/how-it-works/3-track.jpg",
    alt: "The booking screen: a live map, the Ustaad on the way, and the stage-by-stage timeline.",
    title: "Track them to your door",
    lines: [
      "Watch your Ustaad on the map once they set off.",
      "Call or chat from inside the app if you need to.",
      "Every stage updates itself — on the way, arrived, started, done.",
    ],
  },
  {
    image: "/images/how-it-works/4-pay.jpg",
    alt: "The completed booking: the cash amount, a rating prompt and a link to report a problem.",
    title: "Pay and rate",
    lines: [
      "Pay in cash when the work is finished — the rate you approved.",
      "Rate the Ustaad; ratings are what keep the good ones visible.",
      "If something is wrong, report it in the app and we have it redone.",
    ],
  },
];

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Every Ustaad is CNIC-verified",
    body: "We check identity documents before anyone can take a job, and verify in person. A stranger is coming into your home — that should not be a leap of faith.",
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

        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <StepTour steps={STEPS} />
          <p className="mt-10 text-xs leading-6 text-zinc-500 max-w-2xl">
            Screens from the Handygo app. The rates inside them are examples and
            are blurred on purpose — the app shows you the real amount before
            you confirm anything.
          </p>
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
      </main>

      <Footer />
    </>
  );
}
