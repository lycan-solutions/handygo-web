import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get the Handygo App",
  description:
    "Download Handygo on Google Play, or check back soon for iOS.",
};

export default function AppSmartLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
