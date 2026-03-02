import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.12 } } },
  item: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
  }
};

const features = [
  { emoji: "⚡", label: "Saves as you type", desc: "Ghost-creation means nothing is ever lost mid-thought." },
  { emoji: "🗂️", label: "Folders & search", desc: "Organize deeply or stay flat — your call." },
  { emoji: "🔒", label: "Private by default", desc: "Your notes, your account. No ads, ever." },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .landing-root {
    min-height: 100vh;
    background: #0c0c0c;
    color: #fff;
    font-family: 'DM Sans', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    position: relative;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(130px);
  }

  .nav {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 48px;
  }
  @media (max-width: 600px) { .nav { padding: 18px 20px; } }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.01em;
    text-decoration: none;
  }
  .logo-icon {
    width: 34px; height: 34px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  .nav-link {
    font-size: 13px;
    color: #666;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav-link:hover { color: #fff; }

  .hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px 80px;
    position: relative;
    z-index: 10;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 44px;
  }
  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f59e0b;
  }

  .headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(46px, 8vw, 88px);
    font-weight: 800;
    line-height: 1.06;
    letter-spacing: -0.03em;
    margin-bottom: 28px;
    max-width: 820px;
  }
  .headline-accent { color: #f59e0b; position: relative; display: inline-block; }
  .headline-muted { color: #3a3a3a; }

  .subtext {
    font-size: 17px;
    color: #666;
    margin-bottom: 48px;
    line-height: 1.75;
    max-width: 460px;
  }

  .cta-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 88px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 15px 32px;
    background: #fff;
    color: #000;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border-radius: 14px;
    text-decoration: none;
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
    box-shadow: 0 0 40px rgba(255,255,255,0.1), 0 2px 16px rgba(0,0,0,0.5);
  }
  .btn-primary:hover {
    background: #f5f0e8;
    box-shadow: 0 0 60px rgba(245,158,11,0.2), 0 4px 20px rgba(0,0,0,0.6);
    transform: translateY(-1px);
    color: #000;
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 15px 32px;
    background: transparent;
    color: #777;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border-radius: 14px;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.13);
    transition: color 0.2s, background 0.2s;
  }
  .btn-secondary:hover { color: #fff; background: rgba(255,255,255,0.06); }

  .features-grid {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 780px;
    width: 100%;
  }

  .feature-card {
    flex: 1;
    min-width: 200px;
    max-width: 240px;
    padding: 28px 22px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    text-align: center;
    transition: background 0.25s, border-color 0.25s, transform 0.2s;
    cursor: default;
  }
  .feature-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.16);
    transform: translateY(-3px);
  }
  .feature-emoji { font-size: 30px; margin-bottom: 14px; }
  .feature-label {
    font-size: 14px;
    font-weight: 600;
    color: #ddd;
    margin-bottom: 8px;
  }
  .feature-desc { font-size: 13px; color: #555; line-height: 1.6; }

  .footer {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 24px;
    font-size: 12px;
    color: #2a2a2a;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

export default function Landing() {
  return (
    <>
      <style>{css}</style>
      <div className="landing-root">

        {/* Glow orbs */}
        <div className="glow" style={{
          width: 700, height: 700,
          background: "rgba(180,120,30,0.13)",
          top: "-20%", left: "5%",
        }} />
        <div className="glow" style={{
          width: 500, height: 500,
          background: "rgba(50,90,200,0.09)",
          bottom: "-15%", right: "0%",
        }} />

        {/* Nav */}
        <motion.nav
          className="nav"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo">
            <div className="logo-icon">🪶</div>
            QuillSpace
          </div>
          <Link to="/login" className="nav-link">Sign in →</Link>
        </motion.nav>

        {/* Hero */}
        <motion.div
          className="hero"
          variants={stagger.container}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={stagger.item}>
            <div className="badge">
              <span className="badge-dot" />
              Personal note-taking, done right
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 className="headline" variants={stagger.item}>
            Capture your{" "}
            <span className="headline-accent">
              thoughts
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "rgba(245,158,11,0.35)",
                  display: "block",
                  transformOrigin: "left center",
                  borderRadius: 2,
                }}
              />
            </span>
            <br />
            <span className="headline-muted">before they slip away.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p className="subtext" variants={stagger.item}>
            A distraction-free writing space with folders, attachments, and search.
            Everything you need. Nothing you don't.
          </motion.p>

          {/* CTAs */}
          <motion.div className="cta-group" variants={stagger.item}>
            <Link to="/register" className="btn-primary">
              Start writing free <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-secondary">
              I have an account
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div className="features-grid" variants={stagger.item}>
            {features.map(({ emoji, label, desc }) => (
              <div className="feature-card" key={label}>
                <div className="feature-emoji">{emoji}</div>
                <div className="feature-label">{label}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Made with care · Your notes stay on your account
        </motion.footer>
      </div>
    </>
  );
}