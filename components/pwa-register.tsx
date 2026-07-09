"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrierung ist rein progressiv — kein Fehlerfall für die App.
      });
    }
  }, []);
  return null;
}
