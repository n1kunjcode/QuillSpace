import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  .auth-root {
    min-height: 100vh; background: #0c0c0c; color: #fff;
    font-family: 'DM Sans', system-ui, sans-serif;
    display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; overflow: hidden;
  }
  .auth-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(130px); }
  .auth-card { width: 100%; max-width: 400px; position: relative; z-index: 10; }
  .back-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; color: #555; text-decoration: none;
    margin-bottom: 40px; font-weight: 500; transition: color 0.2s;
  }
  .back-link:hover { color: #aaa; }
  .auth-icon {
    width: 44px; height: 44px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 24px;
  }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 8px; }
  .auth-subtitle { font-size: 14px; color: #555; margin-bottom: 24px; }
  .perks {
    display: flex; flex-direction: column; gap: 8px;
    margin-bottom: 28px; padding: 16px 18px;
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12); border-radius: 14px;
  }
  .perk-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #666; }
  .perk-check {
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(245,158,11,0.12);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .google-btn {
    width: 100%; padding: 13px 16px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
    color: #ddd; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.2s, border-color 0.2s; margin-bottom: 20px;
  }
  .google-btn:hover:not(:disabled) { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.2); }
  .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .divider-text { font-size: 11px; color: #333; text-transform: uppercase; letter-spacing: 0.1em; }
  .field-label { display: block; font-size: 11px; font-weight: 500; color: #555; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .field-wrap { position: relative; margin-bottom: 18px; }
  .field-input {
    width: 100%; padding: 14px 16px;
    background: rgba(255,255,255,0.05); color: #fff;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .field-input::placeholder { color: #333; }
  .field-input:focus { border-color: rgba(245,158,11,0.5); background: rgba(255,255,255,0.07); box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
  .field-input.has-icon { padding-right: 44px; }
  .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #444; cursor: pointer; display: flex; align-items: center; transition: color 0.2s; padding: 4px; }
  .eye-btn:hover { color: #aaa; }
  .error-box { padding: 12px 16px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; color: #f87171; font-size: 13px; margin-bottom: 22px; }
  .submit-btn {
    width: 100%; padding: 15px; background: #fff; color: #000;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    border-radius: 14px; border: none; cursor: pointer; margin-top: 8px;
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
    box-shadow: 0 0 40px rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .submit-btn:hover:not(:disabled) { background: #f5f0e8; box-shadow: 0 0 50px rgba(245,158,11,0.15); transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-footer { text-align: center; font-size: 12px; color: #444; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); }
  .auth-footer a { color: #bbb; text-decoration: none; transition: color 0.2s; }
  .auth-footer a:hover { color: #fff; text-decoration: underline; }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const perks = ["Saves as you type — nothing lost", "Folders, attachments, full search", "Private by default, free forever"];

function Field({ label, type, value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="field-wrap">
        <input type={isPass ? (show ? "text" : "password") : type} value={value} onChange={onChange}
          placeholder={placeholder} required={required} className={`field-input${isPass ? " has-icon" : ""}`} />
        {isPass && <button type="button" className="eye-btn" onClick={() => setShow(s => !s)} tabIndex={-1}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
      </div>
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const onLoad = () => renderGoogleButton();
    if (existing) {
      if (window.google) renderGoogleButton();
      else existing.addEventListener("load", onLoad);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = onLoad;
    document.head.appendChild(script);
  }, []);

  const renderGoogleButton = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        setGoogleLoading(true); setError("");
        try {
          const res = await api.post("/auth/google", { credential });
          login(res.data.token, res.data.user);
          navigate("/app");
        } catch (err) {
          setError(err.response?.data?.message || "Google sign-in failed.");
        } finally { setGoogleLoading(false); }
      },
    });
    const container = document.getElementById("google-register-btn-container");
    if (container) {
      window.google.accounts.id.renderButton(container, {
        theme: "filled_black",
        size: "large",
        width: 368,
        text: "signup_with",
        shape: "rectangular",
      });
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token, res.data.user);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };


  return (
    <>
      <style>{css}</style>
      <div className="auth-root">
        <div className="auth-glow" style={{ width: 600, height: 600, background: "rgba(180,120,30,0.1)", top: "-20%", right: "-10%" }} />
        <div className="auth-glow" style={{ width: 400, height: 400, background: "rgba(50,90,200,0.07)", bottom: "-15%", left: "-5%" }} />

        <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <Link to="/" className="back-link"><ArrowLeft size={13} /> QuillSpace</Link>
          <div className="auth-icon">🪶</div>
          <h1 className="auth-title">Create your space</h1>
          <p className="auth-subtitle">Free forever. No credit card needed.</p>

          <div className="perks">
            {perks.map(p => (
              <div className="perk-row" key={p}>
                <div className="perk-check"><Check size={10} color="#f59e0b" /></div>
                {p}
              </div>
            ))}
          </div>

          {GOOGLE_CLIENT_ID && (
            <>
              {googleLoading && (
                <div className="google-btn" style={{ pointerEvents: "none" }}>
                  <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.2)" }} />
                  Connecting…
                </div>
              )}
              <div
                id="google-register-btn-container"
                style={{
                  display: googleLoading ? "none" : "block",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 20,
                  minHeight: 44,
                }}
              />
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>
            </>
          )}


          {error && <motion.div className="error-box" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}

          <form onSubmit={handleRegister}>
            <Field label="Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : "Create account"}
            </button>
          </form>

          <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
        </motion.div>
      </div>
    </>
  );
}