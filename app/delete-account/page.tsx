import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Delete Your Account — Handygo",
  description:
    "How to delete your Handygo account — step-by-step instructions for in-app deletion and email request.",
};

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5"
        style={{ background: "#DB6234" }}
      >
        {n}
      </span>
      <p className="text-zinc-600 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 border-b border-zinc-100 last:border-0 text-sm">
      <span className="font-semibold text-zinc-800 min-w-[120px]">{label}</span>
      <span className="text-zinc-600">{value}</span>
    </div>
  );
}

export default function DeleteAccountPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div style={{ background: "#faf8f6" }} className="py-14 px-5 sm:px-8 border-b border-zinc-100">
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: "#f5e8e0", color: "#DB6234" }}
            >
              Account
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Delete Your Account
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl">
              We&apos;re sorry to see you go. Below are the ways you can request permanent deletion of your Handygo account and all associated data.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 space-y-12">

          {/* Method 1 — In-app */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#f5e8e0", color: "#DB6234" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Option 1 — Delete in the app</h2>
            </div>

            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              The fastest way to delete your account is directly from within the Handygo app. Follow these steps:
            </p>

            <div className="space-y-4">
              <Step n={1}>Open the <strong>Handygo</strong> app and log in to your account.</Step>
              <Step n={2}>Tap your <strong>Profile</strong> icon or navigate to the Profile tab.</Step>
              <Step n={3}>Go to <strong>Settings</strong>.</Step>
              <Step n={4}>Scroll down to <strong>Danger Zone</strong>.</Step>
              <Step n={5}>Tap <strong>Delete Account</strong> and follow the confirmation prompts to permanently delete your account.</Step>
            </div>
          </section>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-zinc-100" />
            <span className="px-4 text-xs text-zinc-400 font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-zinc-100" />
          </div>

          {/* Method 2 — Email */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#f5e8e0", color: "#DB6234" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Option 2 — Request via email</h2>
            </div>

            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              If you&apos;re unable to access the app, you can request account deletion by emailing our support team.
            </p>

            <div
              className="rounded-xl border border-zinc-100 p-5 sm:p-6 mb-6"
              style={{ background: "#faf8f6" }}
            >
              <InfoRow label="Send email to" value={<a href="mailto:support@handygo.ai" style={{ color: "#DB6234" }} className="font-medium">support@handygo.ai</a>} />
              <InfoRow
                label="Subject line"
                value={
                  <code className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-xs">
                    Handygo Account Deletion Request
                  </code>
                }
              />
              <InfoRow label="Include" value="Your registered phone number and your role (client or worker)" />
            </div>

            <a
              href="mailto:support@handygo.ai?subject=Handygo%20Account%20Deletion%20Request&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20the%20deletion%20of%20my%20Handygo%20account.%0A%0ARegistered%20phone%20number%3A%20%0ARole%20(client%2Fworker)%3A%20%0A%0AThank%20you."
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: "#DB6234" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Send Deletion Request Email
            </a>
          </section>

          {/* What happens section */}
          <section className="rounded-2xl border border-zinc-100 p-6 sm:p-8" style={{ background: "#faf8f6" }}>
            <h2 className="text-lg font-bold text-zinc-900 mb-5">What happens when you delete your account</h2>
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Your account is disabled and login access is permanently removed.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                  text: "Your FCM notification token and all active sessions are cleared.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  ),
                  text: "Some records — such as jobs, bookings, messages, and reviews — may be retained where required for safety, fraud prevention, dispute handling, legal compliance, or service history purposes.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  text: "Deletion requests are processed within 7–30 business days.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start text-sm">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "#f5e8e0", color: "#DB6234" }}
                  >
                    {item.icon}
                  </span>
                  <p className="text-zinc-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Support */}
          <section className="text-center py-4">
            <p className="text-zinc-500 text-sm mb-4">
              Have questions about your data or need further help?
            </p>
            <a
              href="mailto:support@handygo.ai"
              className="text-sm font-semibold"
              style={{ color: "#DB6234" }}
            >
              Contact us at support@handygo.ai
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
