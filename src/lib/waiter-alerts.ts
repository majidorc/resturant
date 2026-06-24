type TableRequestAlert = {
  id: string;
  tableNumber: string;
  type: "CALL_WAITER" | "REQUEST_BILL";
};

export const DEFAULT_WAITER_DASHBOARD_TITLE = "ReviewBite Dashboard";

let audioContext: AudioContext | null = null;
let chimeIntervalId: ReturnType<typeof setInterval> | number | null = null;
let titleIntervalId: ReturnType<typeof setInterval> | number | null = null;
let titleFlashState = false;
let shouldContinueChime: (() => boolean) | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume = 0.28,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

export async function playServiceChime(): Promise<void> {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    playTone(context, 880, now, 0.16);
    playTone(context, 659, now + 0.22, 0.22);
  } catch {
    // Browsers may block audio until user interaction; visual alerts still apply.
  }
}

export function startChimeLoop(shouldContinue?: () => boolean) {
  stopChimeLoop();
  shouldContinueChime = shouldContinue ?? (() => true);

  const tick = () => {
    if (shouldContinueChime && !shouldContinueChime()) {
      stopChimeLoop();
      return;
    }

    void playServiceChime();
  };

  void tick();
  chimeIntervalId = window.setInterval(tick, 2200);
}

export function stopChimeLoop() {
  if (chimeIntervalId !== null) {
    window.clearInterval(chimeIntervalId);
    chimeIntervalId = null;
  }

  shouldContinueChime = null;
}

export function startTitleFlash(
  alertTitle: string,
  defaultTitle = DEFAULT_WAITER_DASHBOARD_TITLE,
) {
  stopTitleFlash(defaultTitle);
  titleFlashState = false;

  titleIntervalId = window.setInterval(() => {
    document.title = titleFlashState ? defaultTitle : alertTitle;
    titleFlashState = !titleFlashState;
  }, 900);
}

export function stopTitleFlash(defaultTitle = DEFAULT_WAITER_DASHBOARD_TITLE) {
  if (titleIntervalId !== null) {
    window.clearInterval(titleIntervalId);
    titleIntervalId = null;
  }

  if (typeof document !== "undefined") {
    document.title = defaultTitle;
  }
}

export function showTableRequestNotification(request: TableRequestAlert) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const requestLabel = request.type === "REQUEST_BILL" ? "Bill" : "Waiter";

  try {
    new Notification("🛎️ Table Request Alert!", {
      body: `Table ${request.tableNumber} is requesting a ${requestLabel}.`,
      tag: `waiter-request-${request.id}`,
    });
  } catch {
    // Notification API may fail in unsupported contexts.
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function stopAlertSequence(defaultTitle = DEFAULT_WAITER_DASHBOARD_TITLE) {
  stopChimeLoop();
  stopTitleFlash(defaultTitle);
}

export function buildUrgentTitle(tableNumber: string) {
  return `⚠️ [NEW REQUEST - TABLE ${tableNumber}]`;
}
