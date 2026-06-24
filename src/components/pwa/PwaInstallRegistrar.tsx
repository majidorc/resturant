"use client";

import { useEffect } from "react";
import { initPwaInstallCapture, ensureServiceWorkerRegistered } from "@/lib/pwa-install";

export function PwaInstallRegistrar() {
  useEffect(() => {
    initPwaInstallCapture();

    if (process.env.NODE_ENV === "production") {
      void ensureServiceWorkerRegistered();
    }
  }, []);

  return null;
}
