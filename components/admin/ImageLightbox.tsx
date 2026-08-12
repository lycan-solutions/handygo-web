"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

type ImageLightboxProps = {
  url: string;
  label: string;
  onClose: () => void;
};

const ImageLightbox = ({ url, label, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-10 max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <p className="text-white font-semibold">{label}</p>
          <div className="flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
            >
              Open original <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="max-w-full max-h-[75vh] rounded-lg object-contain bg-white"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
