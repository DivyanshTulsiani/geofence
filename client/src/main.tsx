import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { initOneSignal } from "./utils/onesignal";




if (typeof window !== "undefined") {
  initOneSignal(import.meta.env.VITE_ONESIGNAL_APP_ID!);
}


createRoot(document.getElementById("root")!).render(<App />);

import { registerSW } from "virtual:pwa-register";

registerSW();


// import { registerSW } from "virtual:pwa-register";

// registerSW({
//   immediate: true,
//   onNeedRefresh() {
//     console.log("New content available. Refresh the page.");
//   },
//   onOfflineReady() {
//     console.log("App ready to work offline.");
//   },
// });