import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { loginAccounts, SMS_CODE } from "../data/seed";
import { saveLoginSession } from "../lib/session";
import { useNotify } from "../hooks/useNotify";
import type { LoginMethod, Role } from "../types";

// 登录页，移植自 legacy login-screen 与登录状态机。
export default function Login() {
  const login = useStore((s) => s.login);
  const roleProfiles = useStore((s) => s.roleProfiles);
  const notify = useNotify();

  const [mode, setMode] = useState<"sms" | "password">("sms");
  const [phone, setPhone] = useState("13800000000");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("123456");
  const [remember, setRemember] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const account = useMemo(() => loginAccounts[phone], [phone]);

  function doLogin(role: Role, method: LoginMethod, loginPhone = phone) {
    login(role, method, loginPhone);
    if (remember || method === "sso") {
      saveLoginSession(role, method, roleProfiles[role], loginPhone);
    }
    notify("success", `${roleProfiles[role].name} 已登录`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^1\d{10}$/.test(phone)) {
      notify("error", "请输入正确的手机号");
      return;
    }
    if (mode === "sms" && code !== SMS_CODE) {
      notify("error", `验证码错误，演示验证码为 ${SMS_CODE}`);
      return;
    }
    if (!account) {
      notify("error", "未识别的账号，请使用演示账号");
      return;
    }
    doLogin(account.roles[0], mode);
  }

  function sendCode() {
    if (countdown > 0) return;
    setCountdown(60);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    notify("info", `演示验证码：${SMS_CODE}`);
  }

  return (
    <section className="login-screen" id="loginScreen">
      <div className="login-art">
        <div className="brand login-brand">
          <div className="brand-mark">Z</div>
          <div>
            <strong>智学云教</strong>
            <span>ZHIXUE CAMPUS</span>
          </div>
        </div>
        <div className="login-copy">
          <span className="live-pill">
            <i></i> 题练讲评一体化
          </span>
          <h1>
            让每一次落笔，
            <br />
            都有回应。
          </h1>
          <p>从整卷作答、手写批注到个性化学情，老师和学生在同一个学习空间里高效协作。</p>
        </div>
        <div className="login-metrics">
          <span>
            <strong>18,642</strong>精选真题
          </span>
          <span>
            <strong>92%</strong>本周完成率
          </span>
          <span>
            <strong>216</strong>讲题视频
          </span>
        </div>
        <div className="login-social-proof">
          <div className="mini-avatars">
            <b>张</b>
            <b>王</b>
            <b>李</b>
          </div>
          <span>正在服务 28 位教师与 682 名学生</span>
        </div>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-head">
          <span className="login-kicker">SECURE ACCESS</span>
          <h2>登录智学云教</h2>
          <p>{account ? `已识别：${account.name} · ${account.scope}` : "完成身份验证后，系统将匹配你的账号与权限"}</p>
        </div>

        <div className="login-tabs credential-control" role="tablist">
          <button
            type="button"
            className={mode === "sms" ? "active" : ""}
            onClick={() => setMode("sms")}
          >
            验证码
          </button>
          <button
            type="button"
            className={mode === "password" ? "active" : ""}
            onClick={() => setMode("password")}
          >
            密码
          </button>
        </div>

        <label className="field credential-control">
          <span>手机号码</span>
          <div className="phone-row">
            <b>+86</b>
            <input
              inputMode="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.trim())}
              placeholder="请输入手机号"
            />
          </div>
        </label>

        {mode === "sms" ? (
          <div className="field credential-control">
            <span>验证码</span>
            <div className="code-row">
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                placeholder="请输入 6 位验证码"
              />
              <button type="button" className="ghost" onClick={sendCode}>
                {countdown ? `${countdown}s` : "获取验证码"}
              </button>
            </div>
          </div>
        ) : (
          <label className="field credential-control">
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </label>
        )}

        <div className="security-line credential-control">
          <label>
            <input type="checkbox" defaultChecked /> 已阅读并同意协议
          </label>
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />{" "}
            保持登录
          </label>
          <button
            type="button"
            className="link-btn"
            onClick={() => setCode(SMS_CODE)}
          >
            使用演示账号
          </button>
        </div>

        <div className="sso-login credential-control">
          <button type="button" onClick={() => doLogin("teacher", "sso", "13800000000")}>
            <span>SSO</span>
            <strong>使用学校统一身份认证登录</strong>
          </button>
          <small>支持 OAuth2 / CAS / LDAP 对接，演示环境将模拟光明中学 SSO。</small>
        </div>

        <button className="primary login-submit" type="submit">
          <span className="login-button-label">安全登录</span>
          <span className="login-button-arrow">→</span>
        </button>
        <p className="login-tip credential-control">
          演示账号：管理员 13700000000 · 教师 13800000000 · 学生 13900000000；验证码{" "}
          <strong>{SMS_CODE}</strong>
        </p>
      </form>
    </section>
  );
}
