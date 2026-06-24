export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let captureInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function initPwaInstallCapture() {
  if (typeof window === "undefined" || captureInitialized) {
    return;
  }

  captureInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null;
  notifyListeners();
}

export function subscribeInstallPrompt(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function canNativeInstall() {
  return deferredPrompt !== null;
}

export async function ensureServiceWorkerRegistered() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing?.active) {
      return true;
    }

    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return true;
  } catch {
    return false;
  }
}

export function waitForInstallPrompt(timeoutMs: number) {
  const existing = getDeferredInstallPrompt();
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise<BeforeInstallPromptEvent | null>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve(getDeferredInstallPrompt());
    }, timeoutMs);

    const unsubscribe = subscribeInstallPrompt(() => {
      const prompt = getDeferredInstallPrompt();
      if (prompt) {
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve(prompt);
      }
    });
  });
}

export async function triggerNativeInstall() {
  await ensureServiceWorkerRegistered();

  let promptEvent = getDeferredInstallPrompt();
  if (!promptEvent) {
    promptEvent = await waitForInstallPrompt(3000);
  }

  if (!promptEvent) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    clearDeferredInstallPrompt();

    if (choice.outcome === "accepted") {
      return { ok: true as const };
    }

    return { ok: false as const, reason: "dismissed" as const };
  } catch {
    clearDeferredInstallPrompt();
    return { ok: false as const, reason: "error" as const };
  }
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroidDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android/i.test(navigator.userAgent);
}
