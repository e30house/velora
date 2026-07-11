import type { VoiceProfile } from "../types";

export function pickSystemVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  const synth = window.speechSynthesis;
  const available = synth?.getVoices?.() ?? [];
  if (!available.length) return null;

  const preferred = (profile.preferredNames || []).map((name) => name.toLowerCase());
  const avoid = (profile.avoidNames || []).map((name) => name.toLowerCase());
  const targetLang = profile.lang.toLowerCase();
  const targetFamily = targetLang.slice(0, 2);

  const scoreVoice = (voice: SpeechSynthesisVoice): number => {
    const name = voice.name.toLowerCase();
    const lang = (voice.lang || "").toLowerCase();

    if (avoid.some((bad) => name.includes(bad))) return -1000;

    let score = 0;

    preferred.forEach((wanted, index) => {
      if (name.includes(wanted)) score += 120 - index * 4;
    });

    if (lang === targetLang) score += 35;
    if (lang.startsWith(targetFamily)) score += 18;

    // Make the personas more separated when the browser has a good voice library.
    if (profile.id === "astra" && /zira|aria|jenny|samantha|victoria|ava|allison/.test(name)) score += 45;
    if (profile.id === "celine" && /aria|jenny|zira|samantha|ava|allison|susan/.test(name)) score += 35;
    if (profile.id === "atlas" && /daniel|oliver|arthur|thomas|ryan|uk|australian/.test(name)) score += 35;
    if (profile.id === "ranger" && /david|alex|guy|daniel|oliver|thomas|arthur|us|uk/.test(name)) score += 45;
    if (profile.id === "marcus" && /fred|ralph|bruce|zarvox|trinoids|cellos/.test(name)) score += 80;

    if (voice.localService) score += 5;
    return score;
  };

  const ranked = [...available].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const best = ranked[0];

  if (best && scoreVoice(best) > -500) return best;

  const sameLocale = available.filter((voice) => voice.lang?.toLowerCase() === targetLang);
  if (sameLocale.length) return sameLocale[profile.fallbackIndex % sameLocale.length] ?? null;

  const sameLanguage = available.filter((voice) => voice.lang?.toLowerCase().startsWith(targetFamily));
  if (sameLanguage.length) return sameLanguage[profile.fallbackIndex % sameLanguage.length] ?? null;

  return available[profile.fallbackIndex % available.length] ?? available[0] ?? null;
}

export function speak(text: string, voice: VoiceProfile): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const spokenText = voice.id === "marcus" ? text.replaceAll(". ", ". . ").replaceAll(", ", ". ") : text;

    const u = new SpeechSynthesisUtterance(spokenText);
    const systemVoice = pickSystemVoice(voice);

    if (systemVoice) {
      u.voice = systemVoice;
      u.lang = systemVoice.lang;
    } else {
      u.lang = voice.lang;
    }

    u.pitch = voice.pitch;
    u.rate = voice.rate;
    synth.speak(u);
  } catch {
    // Speech synthesis unavailable in some webviews — selection still works.
  }
}

export function speakVoiceSample(voice: VoiceProfile): void {
  speak(voice.sample, voice);
}
