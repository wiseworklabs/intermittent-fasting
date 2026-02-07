import type { Metadata, Viewport } from "next";
import { Jua } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import NotificationManager from "./components/NotificationManager";
import InstallPrompt from "./components/InstallPrompt";
import { ToastProvider } from "./components/Toast";
import { Providers } from "./providers";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "FastTrack",
  description: "Intermittent Fasting Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FastTrack",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${jua.variable} font-sans antialiased`}
      >
        <Providers>
          <ToastProvider>
            {children}
            <InstallPrompt />
            <NotificationManager />
            <ServiceWorkerRegister />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
