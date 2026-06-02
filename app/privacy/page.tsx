import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Handygo",
  description:
    "How Handygo collects, uses, and protects your personal information when you use our home repair and service booking platform.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
        {title}
      </h2>
      <div className="text-zinc-600 text-sm leading-7 space-y-3">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#DB6234" }} />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPage() {
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
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
              Privacy Policy
            </h1>
            <p className="text-zinc-500 text-sm">
              Effective date: <strong>June 2, 2026</strong> &nbsp;·&nbsp; App: Handygo &nbsp;·&nbsp;{" "}
              <a href="mailto:support@handygo.ai" style={{ color: "#DB6234" }}>
                support@handygo.ai
              </a>
            </p>
          </div>
        </div>

        {/* Content */}
        <article className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
          <p className="text-zinc-500 text-sm leading-7 mb-10">
            Handygo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Handygo mobile application, an
            on-demand home repair and service booking platform. This Privacy Policy
            explains how we collect, use, store, and share your personal information
            when you use the Handygo app. By using Handygo, you agree to this policy.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly and information generated through your use of the app:</p>
            <ul className="mt-3 space-y-2">
              <Li><strong>Account &amp; profile information</strong> — name, profile photo, phone number, and email address if provided during registration.</Li>
              <Li><strong>Address &amp; job location</strong> — the address or location you provide when posting a job or requesting a service.</Li>
              <Li><strong>Precise device location</strong> — collected when the app is in use or when you are an active worker, to match jobs and enable live tracking.</Li>
              <Li><strong>Booking &amp; job details</strong> — service type, job description, status, history, and related metadata.</Li>
              <Li><strong>Chat messages</strong> — text messages exchanged between clients and workers through the in-app chat.</Li>
              <Li><strong>Media attachments</strong> — images, videos, and audio voice notes shared through the app during chats or job submissions.</Li>
              <Li><strong>Notification token (FCM)</strong> — a device token used to deliver push notifications to your device.</Li>
              <Li><strong>Device &amp; technical data</strong> — device model, operating system version, app version, and crash or error logs used to maintain and improve the service.</Li>
            </ul>
          </Section>

          <Section title="2. How We Use Location">
            <p>
              Location data is central to how Handygo works and is used only for service delivery:
            </p>
            <ul className="mt-3 space-y-2">
              <Li>
                <strong>Client job location</strong> — when you post a job, your job location is shared with nearby workers so they can evaluate and bid on the job.
              </Li>
              <Li>
                <strong>Worker live location</strong> — when a worker is online or assigned to a job, their location is shared with the client so the client can track arrival and progress in real time. This location sharing is limited to active job sessions.
              </Li>
            </ul>
            <p className="mt-3">We do not track location in the background beyond what is required for these service purposes.</p>
          </Section>

          <Section title="3. Camera, Microphone &amp; Media Access">
            <p>
              The app may request access to your device&apos;s camera, microphone, and media storage for the following purposes:
            </p>
            <ul className="mt-3 space-y-2">
              <Li><strong>Camera</strong> — to capture photos or videos of a job site and attach them to job postings or chat conversations.</Li>
              <Li><strong>Microphone</strong> — to record voice notes that can be sent through in-app chat as audio attachments.</Li>
              <Li><strong>Media/storage</strong> — to select and upload photos or videos from your device gallery for job or chat attachments.</Li>
            </ul>
            <p className="mt-3">These permissions are only used when you actively choose to share media; we do not access your camera or microphone in the background.</p>
          </Section>

          <Section title="4. Notifications">
            <p>
              We send push notifications to keep you informed about your activity on the platform. Notifications may include:
            </p>
            <ul className="mt-3 space-y-2">
              <Li>Booking confirmations and updates</Li>
              <Li>New messages from clients or workers</Li>
              <Li>New bids or bid updates on your job</Li>
              <Li>Job status changes (e.g., worker en route, job in progress, job completed)</Li>
            </ul>
            <p className="mt-3">You may disable notifications through your device settings, though this may affect your ability to use the service effectively.</p>
          </Section>

          <Section title="5. How We Share Your Information">
            <p>We do <strong>not</strong> sell your personal data. We share information only as necessary to provide the service:</p>
            <ul className="mt-3 space-y-2">
              <Li>
                <strong>Between clients and workers</strong> — when a worker bids on or is assigned to your job, relevant job details and contact information are shared between the two parties to facilitate the service.
              </Li>
              <Li>
                <strong>Service providers</strong> — we use third-party providers for hosting, cloud storage, push notification delivery (Firebase/FCM), and app infrastructure. These providers process data on our behalf under appropriate data protection terms.
              </Li>
              <Li>
                <strong>Legal compliance</strong> — we may disclose information if required by law, court order, or to protect the rights, safety, or property of Handygo, its users, or the public.
              </Li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We take reasonable measures to protect your personal information:
            </p>
            <ul className="mt-3 space-y-2">
              <Li>Data in transit is encrypted using HTTPS/TLS where supported.</Li>
              <Li>Access to user data is restricted to authorized personnel and systems only.</Li>
              <Li>Our backend is deployed in a production environment with standard access controls and monitoring.</Li>
            </ul>
            <p className="mt-3">
              No system is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Please contact us immediately at{" "}
              <a href="mailto:support@handygo.ai" style={{ color: "#DB6234" }}>
                support@handygo.ai
              </a>{" "}
              if you suspect any unauthorized use of your account.
            </p>
          </Section>

          <Section title="7. Account Deletion &amp; Data Retention">
            <p>
              You have the right to delete your account and associated data at any time. You may do so:
            </p>
            <ul className="mt-3 space-y-2">
              <Li>
                <strong>In-app</strong> — open the Handygo app → go to <em>Profile → Settings → Danger Zone → Delete Account</em> and confirm your choice.
              </Li>
              <Li>
                <strong>By email</strong> — send a request to{" "}
                <a href="mailto:support@handygo.ai" style={{ color: "#DB6234" }}>
                  support@handygo.ai
                </a>{" "}
                with the subject line <em>&quot;Handygo Account Deletion Request&quot;</em>, including your registered phone number and role (client or worker).
              </Li>
            </ul>
            <p className="mt-3">
              Upon deletion, your account is disabled, login access is removed, and your FCM token and active sessions are cleared. Some records — including jobs, bookings, messages, and reviews — may be retained where required for safety, fraud prevention, dispute handling, legal compliance, or service history purposes.
            </p>
            <p className="mt-3">Deletion requests are typically processed within <strong>7–30 days</strong>.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Handygo is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a minor has provided us with personal data, please contact us at{" "}
              <a href="mailto:support@handygo.ai" style={{ color: "#DB6234" }}>
                support@handygo.ai
              </a>{" "}
              and we will promptly delete the information.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. Continued use of Handygo after changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
            </p>
            <div className="mt-4 p-5 rounded-xl border border-zinc-100 bg-zinc-50">
              <p className="font-semibold text-zinc-800">Handygo Support</p>
              <a
                href="mailto:support@handygo.ai"
                className="font-medium"
                style={{ color: "#DB6234" }}
              >
                support@handygo.ai
              </a>
              <p className="text-zinc-500 mt-1">handygo.ai</p>
            </div>
          </Section>
        </article>
      </main>

      <Footer />
    </>
  );
}
