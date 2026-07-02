import { useEffect, useRef, useState } from "react";

// 考试倒计时，移植自 legacy startExamClock。到点回调 onExpire（自动交卷）。
// onExpire 用 ref 固定，effect 只依赖 endsAt —— 否则 onExpire 每次渲染变新函数会导致
// effect 反复重跑、fired 被重置，在截止时间已过时无限触发交卷（Maximum update depth）。
export function useExamClock(endsAt: number | null, onExpire: () => void) {
  const [label, setLabel] = useState("--:--");
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!endsAt) {
      setLabel("--:--");
      return;
    }
    let fired = false;
    const tick = () => {
      const remain = Math.max(0, endsAt - Date.now());
      const minutes = Math.floor(remain / 60000);
      const seconds = Math.floor((remain % 60000) / 1000);
      setLabel(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
      if (!remain && !fired) {
        fired = true;
        onExpireRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return label;
}
