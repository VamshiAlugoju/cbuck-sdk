export const translateText = async (text: string, targetLang: string) => {
  // return `🤦‍♂️ ${text}`;
  try {
    const payload = {
      text: text,
      tgt_lang: targetLang,
      src_lang: "eng",
    };
    const res = await fetch(`http://10.10.0.203:8000/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.translation;
  } catch (error) {
    return `translated: ${text}`;
  }

};