export function sendRNMessage({ type, data }: { type: string; data: any }) {
  window.ReactNativeWebView?.postMessage(
    JSON.stringify({
      type,
      data,
    })
  );
}

export async function isOriginalAudioEnabled(): Promise<boolean> {
  try {
    const res = await fetch('https://275a4827f0e6.ngrok-free.app/calls/is_original_audio_enabled');
    const data = await res.json();
    return true;
  } catch (error) {
    console.error('Error checking isOriginalAudioEnabled:', error);
    return true;
  }
}

