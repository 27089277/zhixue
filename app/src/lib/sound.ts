// 轻量音效：答对/答错/交卷/点击。基于 expo-audio，懒加载、静默失败（音效非关键路径）。
// 受 store.soundEnabled 控制，可在「我的」里关闭。
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { useStore } from "../store/useStore";

const sources = {
  correct: require("../../assets/sounds/correct.wav"),
  wrong: require("../../assets/sounds/wrong.wav"),
  submit: require("../../assets/sounds/submit.wav"),
  tap: require("../../assets/sounds/tap.wav"),
} as const;

export type Sfx = keyof typeof sources;

const players: Partial<Record<Sfx, AudioPlayer>> = {};
let audioModeSet = false;

function ensure(k: Sfx): AudioPlayer | undefined {
  if (!players[k]) {
    try {
      players[k] = createAudioPlayer(sources[k]);
    } catch {
      return undefined;
    }
  }
  if (!audioModeSet) {
    audioModeSet = true;
    // 即使手机处于静音档也能听到反馈音（demo 体验更好）
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  return players[k];
}

export function playSfx(k: Sfx) {
  try {
    if (!useStore.getState().soundEnabled) return;
    const p = ensure(k);
    if (!p) return;
    // 回到起点再播，支持连续快速触发
    Promise.resolve(p.seekTo(0)).catch(() => {});
    p.play();
  } catch {
    /* 音效失败不影响主流程 */
  }
}
