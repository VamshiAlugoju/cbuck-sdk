export function sendRNMessage({ type, data }: { type: string; data: any }) {
  window.ReactNativeWebView?.postMessage(
    JSON.stringify({
      type,
      data,
    })
  );
}

export async function isOriginalAudioEnabled(): Promise<boolean> {
  const url = 'https://884ad789a49c.ngrok-free.app/calls/is_original_audio_enabled';
  console.log('Checking isOriginalAudioEnabled', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.isOriginalAudioEnabled === true;
  } catch (error) {
    console.error('Error checking isOriginalAudioEnabled:', error);
    return false;
  }
}

