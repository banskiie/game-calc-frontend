// "use client"
// import { useEffect } from "react";

// export default function PWAProvider() {
//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker
//         .register("/sw.js")
//         .then((reg) => console.log("Service Worker registered in dev mode!", reg))
//         .catch((err) => console.error("Service Worker registration failed:", err));
//     }
//   }, []);

//   return null; // No UI needed
// }
