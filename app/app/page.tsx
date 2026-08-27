"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AppQrCard from "@/components/handygo/AppQrCard";
import AppDownloadButtons from "@/components/handygo/AppDownloadButtons";
import { PLAY_STORE_URL } from "@/lib/handygo-app-links";

type Platform = "loading" | "android" | "ios" | "desktop";

function detectPlatform(): Exclude<Platform, "loading"> {
  const ua = navigator.userAgent || navigator.vendor || "";

  if (/android/i.test(ua)) return "android";

  const isIphoneOrIpad = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as "MacIntel" but exposes touch points, unlike a real Mac.
  const isIpadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (isIphoneOrIpad || isIpadOS) return "ios";

  return "desktop";
}

export default function AppSmartLinkPage() {
  const [platform, setPlatform] = useState<Platform>("loading");

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (detected === "android") {
      window.location.replace(PLAY_STORE_URL);
    }
  }, []);

  // Server render and first client render both show this — the real
  // platform is only known after mount, so this keeps hydration in sync.
  if (platform === "loading" || platform === "android") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 bg-white text-center">
        <span
          className="w-10 h-10 rounded-full border-[3px] border-zinc-200 animate-spin"
          style={{ borderTopColor: "var(--brand)" }}
          aria-hidden
        />
        <p className="text-sm text-zinc-500">Taking you to Handygo…</p>
        <a
          href={PLAY_STORE_URL}
          className="text-sm font-semibold"
          style={{ color: "var(--brand)" }}
        >
          Tap here if you&apos;re not redirected
        </a>
      </main>
    );
  }

  if (platform === "ios") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 py-16 bg-white">
        <div className="max-w-sm w-full text-center">
          <Image
            src="/images/logo-green.png"
            alt="Handygo logo"
            width={56}
            height={56}
            className="rounded-2xl mx-auto mb-6"
          />
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            iOS App — Coming Soon
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">
            Handygo for iPhone is on its way
          </h1>
          <p className="text-zinc-500 leading-relaxed mb-8">
            We&apos;re polishing the iOS experience. In the meantime, Handygo
            is live on Android — share the link with an Android friend, or
            check back here soon.
          </p>
          <AppDownloadButtons className="justify-center" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: "#faf8f6" }}
    >
      <AppQrCard />
    </main>
  );
}
