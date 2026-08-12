"use client";

import { useEffect } from "react";
import {
  APP_STORE_URL,
  IOS_COMING_SOON,
  PLAY_STORE_URL,
} from "@/lib/handygo-app-links";
import AppQrCard from "@/components/handygo/AppQrCard";
import AppDownloadButtons from "@/components/handygo/AppDownloadButtons";

export default function HandygoAppPage() {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || "";

    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    if (isAndroid) {
      window.location.href = PLAY_STORE_URL;
      return;
    }

    if (isIOS && !IOS_COMING_SOON && APP_STORE_URL) {
      window.location.href = APP_STORE_URL;
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
          Download Handygo
        </h1>

        <p className="mt-3 text-zinc-600">
          Book trusted Ustaads instantly for home services.
        </p>

        <div className="mt-8">
          <AppQrCard />
        </div>

        <div className="mt-6 flex justify-center">
          <AppDownloadButtons />
        </div>
      </div>
    </main>
  );
}