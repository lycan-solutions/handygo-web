"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Copy, Check, AlertCircle } from "lucide-react";
import { revealOtp } from "@/lib/api/admin";

/** Security auto-hide — independent of the OTP's own real expiry countdown. */
const AUTO_HIDE_SECONDS = 45;

type Phase = "confirm" | "loading" | "revealed" | "hidden" | "error";

type RevealOtpModalProps = {
  otpId: string;
  phone: string;
  onClose: () => void;
};

const formatCountdown = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

const RevealOtpModal = ({ otpId, phone, onClose }: RevealOtpModalProps) => {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [otp, setOtp] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [hideInSeconds, setHideInSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "revealed") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      setHideInSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          setOtp(null);
          setPhase("hidden");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Belt-and-suspenders: never let the plaintext OTP outlive this component,
  // regardless of how it unmounts (page navigation included).
  useEffect(() => {
    return () => setOtp(null);
  }, []);

  const handleReveal = async () => {
    setPhase("loading");
    setError("");
    try {
      const result = await revealOtp(otpId);
      const secsUntilExpiry = Math.max(
        0,
        Math.round((new Date(result.expiresAt).getTime() - Date.now()) / 1000)
      );
      setOtp(result.otp);
      setSecondsLeft(secsUntilExpiry);
      setHideInSeconds(Math.min(AUTO_HIDE_SECONDS, secsUntilExpiry || AUTO_HIDE_SECONDS));
      setPhase("revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal OTP.");
      setPhase("error");
    }
  };

  const handleClose = () => {
    setOtp(null);
    onClose();
  };

  const handleCopy = async () => {
    if (!otp) return;
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy is a convenience, not critical — silently ignore.
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {phase === "confirm" && (
          <>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Reveal OTP?</h3>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This is sensitive authentication information. Revealing this OTP for{" "}
              <span className="font-semibold text-gray-700">{phone}</span> will be recorded in
              the Admin audit log.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReveal}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700"
              >
                Reveal OTP
              </button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <div className="text-center py-8">
            <p className="text-gray-500">Revealing...</p>
          </div>
        )}

        {phase === "revealed" && otp && (
          <>
            <h3 className="text-lg font-bold text-gray-900">OTP Code</h3>
            <p className="text-3xl font-mono font-bold tracking-[0.3em] text-gray-900 mt-3 bg-gray-50 border border-gray-100 rounded-lg py-4 text-center select-all">
              {otp}
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Expires in:{" "}
              <span className="font-semibold text-gray-700">
                {secondsLeft !== null ? formatCountdown(secondsLeft) : "—"}
              </span>
            </p>
            {hideInSeconds !== null && (
              <p className="text-xs text-gray-400 mt-1">
                This will auto-hide in {hideInSeconds}s for security.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              >
                Close
              </button>
            </div>
          </>
        )}

        {phase === "hidden" && (
          <>
            <h3 className="text-lg font-bold text-gray-900">OTP Hidden</h3>
            <p className="text-sm text-gray-500 mt-2">
              This code was automatically hidden for security. Reveal it again if it&apos;s still
              needed.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              >
                Close
              </button>
            </div>
          </>
        )}

        {phase === "error" && (
          <>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Reveal Failed</h3>
            </div>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevealOtpModal;
