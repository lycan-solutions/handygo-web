"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { APP_SMART_LINK, IOS_COMING_SOON } from "@/lib/handygo-app-links";
import AppDownloadButtons from "./AppDownloadButtons";

export default function AppQrCard({
  title = "Scan to download Handygo",
  subtitle = "Book trusted Ustaads instantly",
  showButtons = true,
  qrUrl = APP_SMART_LINK,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  showButtons?: boolean;
  qrUrl?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-zinc-100 p-6 sm:p-8 ${className}`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-6">
        <Image
          src="/images/logo-green.png"
          alt="Handygo logo"
          width={32}
          height={32}
          className="rounded-lg flex-shrink-0"
        />
        <span className="font-bold text-lg tracking-tight" style={{ color: "#DB6234" }}>
          Handygo
        </span>
      </div>

      {/* QR code */}
      <div
        className="flex items-center justify-center p-4 rounded-xl mb-6"
        style={{ background: "#f5e8e0" }}
      >
        <div className="bg-white p-3 rounded-lg">
          <QRCodeSVG
            value={qrUrl}
            size={176}
            level="M"
            fgColor="#1a1a1a"
            bgColor="#ffffff"
            className="w-full h-auto max-w-[176px]"
          />
        </div>
      </div>

      {/* Copy */}
      <div className="text-center mb-6">
        <p className="font-semibold text-zinc-900 text-base">{title}</p>
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      </div>

      {IOS_COMING_SOON && (
        <div className="flex justify-center mb-6">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: "#f5e8e0", color: "#DB6234" }}
          >
            iOS coming soon
          </span>
        </div>
      )}

      {showButtons && (
        <AppDownloadButtons className="justify-center" />
      )}
    </div>
  );
}
