"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const DIFY_TOKEN = "ruK5MbvjLdoyquYI";

// Internal-only sections: no customer-facing FAQ bot here.
const EXCLUDED_PREFIXES = ["/admin", "/auth"];

export default function DifyChatWidget() {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isExcluded) return null;

  return (
    <>
      <Script id="dify-chatbot-config" strategy="afterInteractive">
        {`
          window.difyChatbotConfig = {
            token: '${DIFY_TOKEN}',
            baseUrl: 'https://udify.app',
          };
        `}
      </Script>
      <Script
        src="https://udify.app/embed.min.js"
        id={DIFY_TOKEN}
        strategy="afterInteractive"
      />
      <style>{`
        #dify-chatbot-bubble-button {
          background-color: #11645D !important;
        }
        #dify-chatbot-bubble-window {
          width: 24rem !important;
          height: 40rem !important;
        }
      `}</style>
    </>
  );
}
