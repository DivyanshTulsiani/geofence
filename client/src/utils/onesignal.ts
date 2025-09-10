declare global {
  interface Window {
    OneSignal: any;
  }
}

// VITE_ONESIGNAL_APP_ID=your-app-id-here


// Generate random ID (stored in localStorage)
export function getOrCreateUserId(): string {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
  }
  return userId;
}

export function initOneSignal(appId: string): void {
  const userId = getOrCreateUserId();

  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function () {
    window.OneSignal.init({
      appId,
      notifyButton: { enable: true },
      allowLocalhostAsSecureOrigin: true, // needed if testing locally
    });

    console.log("OneSignal initialized. Current permission:", Notification.permission);

    // 🔥 Explicitly show the permission popup
    window.OneSignal.showSlidedownPrompt();

    // Log the Player ID (subscriber ID)
    window.OneSignal.getUserId().then((id: string | null) => {
      console.log("OneSignal Player ID:", id);
    });

    // Attach random userId as OneSignal tag
    window.OneSignal.sendTag("userId", userId).then(() => {
      console.log("OneSignal tag set:", userId);
    });
  });
}
