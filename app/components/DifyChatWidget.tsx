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
      {/* Dify ships the widget hard into the corner and sized for a big
          desktop: 24x40rem is 640px tall, which on a laptop leaves almost no
          page visible behind it. These rules pull it off the corner, cut it to
          a size that fits a short viewport, and give it a card's edges so it
          reads as a panel rather than a slab stuck to the glass. */}
      <style>{`
        #dify-chatbot-bubble-button {
          background-color: #11645D !important;
          right: 1.25rem !important;
          bottom: 1.25rem !important;
          width: 3.25rem !important;
          height: 3.25rem !important;
          box-shadow: 0 6px 20px rgb(17 100 93 / 28%) !important;
        }
        #dify-chatbot-bubble-window {
          right: 1.25rem !important;
          /* Sits above the bubble instead of covering it. */
          bottom: 5.25rem !important;
          width: 23rem !important;
          /* Never taller than the viewport allows, however tall the screen. */
          height: min(34rem, calc(100dvh - 8rem)) !important;
          border-radius: 1rem !important;
          overflow: hidden !important;
          box-shadow: 0 18px 48px rgb(28 40 38 / 22%) !important;
        }
        /* On a phone a fixed 23rem column would hang off the screen. */
        @media (max-width: 640px) {
          #dify-chatbot-bubble-window {
            left: 0.75rem !important;
            right: 0.75rem !important;
            width: auto !important;
            height: min(32rem, calc(100dvh - 7rem)) !important;
          }
        }
      `}</style>
    </>
  );
}
