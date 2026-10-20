import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Offline shell for the browser build. The Android app ships its assets
// locally (and Capacitor owns the WebView), so the worker is skipped there.
if (
  import.meta.env.PROD &&
  "serviceWorker" in navigator &&
  !(globalThis as { Capacitor?: unknown }).Capacitor
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => undefined);
  });
}
