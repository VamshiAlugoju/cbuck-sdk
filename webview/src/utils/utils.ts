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
    const res = await fetch('https://197a83c01381.ngrok-free.app/calls/is_original_audio_enabled');
    const data = await res.json();
    return data?.isOriginalAudioEnabled === true;
  } catch (error) {
    console.error('Error checking isOriginalAudioEnabled:', error);
    return false;
  }
}

