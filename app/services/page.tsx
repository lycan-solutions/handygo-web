import type { Metadata } from "next";
import Link from "next/link";
import {
  AirVent,
  Bug,
  Car,
  ClipboardList,
  Drill,
  Gavel,
  Hammer,
  MapPin,
  PaintRoller,
  SearchCheck,
  Sparkles,
  Trees,
  WashingMachine,
  Wrench,
  Zap,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Services — Handygo",
  description:
    "AC, plumbing, electrical, appliance repair and carpentry in DHA and Clifton, Karachi. Every Ustaad is CNIC-verified and the price is agreed before work starts.",
};

/**
 * Live services only. Six more categories exist in the app behind a
 * "coming soon" state; they are listed separately below rather than mixed in,
 * so nobody arrives expecting a plumber and finds a gardener they cannot book.
 */
const LIVE = [
  {
    name: "AC Technician",
    icon: AirVent,
    blurb: "Servicing, gas refill, cooling problems, installation and removal.",
  },
  {
    name: "Plumber",
    icon: Wrench,
    blurb: "Leaks, chokes, taps, motors, tanks and bathroom fittings.",
  },
  {
    name: "Electrician",
    icon: Zap,
    blurb: "Wiring, fuse boards, switches, lights, fans and UPS work.",
  },
  {
    name: "Appliance Repair",
    icon: WashingMachine,
    blurb: "Washing machines, fridges, microwaves and other home appliances.",
  },
  {
    name: "Carpenter",
    icon: Hammer,
    blurb: "Doors, locks, furniture repair, fittings and woodwork.",
  },
];

const SOON = [
  { name: "Cleaning", icon: Sparkles },
  { name: "Painter", icon: PaintRoller },
  { name: "Pest Control", icon: Bug },
  { name: "Car Wash", icon: Car },
  { name: "Gardener", icon: Trees },
  { name: "Handyman", icon: Drill },
];

/**
 * The three booking lanes the app actually implements. No prices here on
 * purpose: the app shows the real amount before you confirm, and a number
 * printed on a marketing page goes stale the day it changes.
 */
const LANES = [
  {
    icon: ClipboardList,
    title: "Fixed price",
    body: "For common jobs with a standard rate. You see the price, you book, an Ustaad accepts.",
  },
  {
    icon: Gavel,
    title: "Get bids",
    body: "Describe the job. Nearby Ustaads send their rates and you pick the one you want.",
  },
  {
    icon: SearchCheck,
    title: "Inspection first",
    body: "When nobody can quote without seeing it. An Ustaad comes, checks, and gives you a price before any work begins.",
  },
];

export default function ServicesPage() {
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
              Services
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Five services, done properly.
            </h1>
            <p className="text-zinc-600 text-base leading-7 max-w-2xl">
              We would rather do a few things well than list everything and
              deliver half of it. These five are live today in DHA and Clifton,
              Karachi — every Ustaad CNIC-verified, every price agreed before
              the work starts.
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
          <div className="grid gap-4 sm:grid-cols-2">
            {LIVE.map(({ name, icon: Icon, blurb }) => (
              <div
                key={name}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--brand-light)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--brand)" }} />
                </div>
                <h2 className="font-bold text-zinc-900 mb-1.5">{name}</h2>
                <p className="text-sm text-zinc-600 leading-6">{blurb}</p>
              </div>
            ))}

            <div
              className="rounded-2xl border border-dashed border-zinc-300 p-6 flex flex-col justify-center"
              style={{ background: "var(--surface-subtle)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Coming soon
              </p>
              <div className="flex flex-wrap gap-2">
                {SOON.map(({ name, icon: Icon }) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-100 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
              Three ways to agree a price
            </h2>
            <p className="text-zinc-600 text-sm leading-7 mb-8 max-w-2xl">
              Not every job can be priced the same way. The app picks the right
              one for the service you choose, and you always see the amount
              before you say yes.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {LANES.map(({ icon: Icon, title, body }) => (
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
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{ background: "var(--brand)" }}
          >
            <MapPin className="w-6 h-6 mb-4" style={{ color: "var(--brand-light)" }} />
            <h2 className="text-2xl font-bold text-white mb-2">
              DHA and Clifton, Karachi
            </h2>
            <p
              className="text-sm leading-7 max-w-xl"
              style={{ color: "var(--brand-light)" }}
            >
              That is the whole service area for now. We would rather have
              Ustaads who reach you quickly in two neighbourhoods than a map
              full of pins nobody can service. More areas will open as we add
              Ustaads.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 mt-7 rounded-xl bg-white px-5 py-3 text-sm font-semibold"
              style={{ color: "var(--brand)" }}
            >
              See how a booking works
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
