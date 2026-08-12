// Single source of truth for Handygo app download links.
// The printed/marketing QR code always points at APP_SMART_LINK — update the
// destinations below (not the QR) when a link changes.

/** Smart link encoded in the marketing QR code. Never change this without reprinting the QR. */
export const APP_SMART_LINK = "https://handygo.ai/app";

// TODO: Replace with the real Handygo Play Store listing URL once published.
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=ai.handygo.app";

/** Set to the real App Store URL when the iOS app ships; leave null until then. */
export const APP_STORE_URL: string | null = null;

/** Toggle off once the iOS app is live to switch the UI to a real download link. */
export const IOS_COMING_SOON = true;
