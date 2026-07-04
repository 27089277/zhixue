// 生成轻量音效 WAV（无需外部素材）：correct/wrong/submit/tap。
// 运行：node scripts/gen-sounds.js  → 写入 assets/sounds/*.wav
const fs = require("fs");
const path = require("path");

const SR = 22050;
const OUT = path.join(__dirname, "..", "assets", "sounds");
fs.mkdirSync(OUT, { recursive: true });

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log("wrote", name, (buf.length / 1024).toFixed(1) + "KB");
}

// 一段音符（带淡入淡出包络，避免爆音）
function note(freq, dur, { vol = 0.5, type = "sine", startAt = 0 } = {}) {
  const len = Math.floor(SR * dur);
  const out = new Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const ph = 2 * Math.PI * freq * t;
    let v = type === "square" ? Math.sign(Math.sin(ph)) : Math.sin(ph);
    // 包络：快速淡入 + 指数衰减
    const attack = Math.min(1, i / (SR * 0.01));
    const decay = Math.exp(-3 * (t / dur));
    out[i] = v * vol * attack * decay;
  }
  return { out, startAt: Math.floor(SR * startAt) };
}

// 把多段（可含起始偏移）混合成一条
function mix(parts) {
  let total = 0;
  parts.forEach((p) => (total = Math.max(total, p.startAt + p.out.length)));
  const buf = new Float32Array(total);
  parts.forEach((p) => {
    for (let i = 0; i < p.out.length; i++) buf[p.startAt + i] += p.out[i];
  });
  // 轻限幅
  for (let i = 0; i < buf.length; i++) buf[i] = Math.max(-1, Math.min(1, buf[i]));
  return buf;
}

// correct：上行两音「叮咚」(E5→A5)
writeWav(
  "correct.wav",
  mix([note(659.25, 0.14, { vol: 0.5 }), note(880, 0.22, { vol: 0.5, startAt: 0.1 })])
);

// wrong：下行低沉两音（方波更“错误感”）
writeWav(
  "wrong.wav",
  mix([
    note(311.13, 0.16, { vol: 0.4, type: "square" }),
    note(233.08, 0.26, { vol: 0.4, type: "square", startAt: 0.12 }),
  ])
);

// submit：三音上行小和弦（C5-E5-G5）交卷完成感
writeWav(
  "submit.wav",
  mix([
    note(523.25, 0.18, { vol: 0.4, startAt: 0 }),
    note(659.25, 0.2, { vol: 0.4, startAt: 0.07 }),
    note(783.99, 0.28, { vol: 0.45, startAt: 0.14 }),
  ])
);

// tap：极短点击
writeWav("tap.wav", mix([note(1200, 0.04, { vol: 0.35 })]));

console.log("done -> assets/sounds/");
