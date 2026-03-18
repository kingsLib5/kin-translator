import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// MyMemory uses ISO 639-1 language codes
const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "es", label: "Spanish",    flag: "🇪🇸" },
  { code: "fr", label: "French",     flag: "🇫🇷" },
  { code: "de", label: "German",     flag: "🇩🇪" },
  { code: "zh", label: "Chinese",    flag: "🇨🇳" },
  { code: "ja", label: "Japanese",   flag: "🇯🇵" },
  { code: "ru", label: "Russian",    flag: "🇷🇺" },
  { code: "ar", label: "Arabic",     flag: "🇸🇦" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "it", label: "Italian",    flag: "🇮🇹" },
  { code: "ko", label: "Korean",     flag: "🇰🇷" },
  { code: "hi", label: "Hindi",      flag: "🇮🇳" },
  { code: "yo", label: "Yoruba",     flag: "🇳🇬" },
  { code: "ig", label: "Igbo",       flag: "🇳🇬" },
  { code: "ha", label: "Hausa",      flag: "🇳🇬" },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const panelVariant = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const statusVariant = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.2 } },
};

const debugVariant = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: 10, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.25 } },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .kt-root {
    min-height: 100vh;
    background: #0e0e0e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .kt-bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .kt-bg-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(46,111,64,0.25) 0%, transparent 70%);
    top: -100px; left: -150px;
  }
  .kt-bg-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(207,255,220,0.08) 0%, transparent 70%);
    bottom: -80px; right: -100px;
  }

  .kt-card {
    background: #161616;
    border: 1px solid rgba(46,111,64,0.3);
    border-radius: 24px;
    padding: 40px;
    max-width: 900px;
    width: 100%;
    position: relative;
    z-index: 1;
    box-shadow: 0 0 60px rgba(46,111,64,0.08), 0 40px 80px rgba(0,0,0,0.5);
  }

  .kt-header { margin-bottom: 36px; }
  .kt-eyebrow {
    font-size: 0.7rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #2E6F40;
    font-weight: 500;
    margin-bottom: 6px;
  }
  .kt-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    color: #f0f0f0;
    line-height: 1;
    letter-spacing: -1px;
  }
  .kt-title span { color: #2E6F40; }

  .kt-lang-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .kt-lang-group { flex: 1; min-width: 160px; }
  .kt-lang-label {
    font-size: 0.72rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
    font-weight: 500;
    margin-bottom: 8px;
  }
  .kt-select-wrapper { position: relative; }
  .kt-select {
    width: 100%;
    padding: 12px 40px 12px 16px;
    background: #1e1e1e;
    color: #e0e0e0;
    border: 1px solid rgba(46,111,64,0.4);
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .kt-select:hover, .kt-select:focus {
    border-color: #2E6F40;
    box-shadow: 0 0 0 3px rgba(46,111,64,0.15);
  }
  .kt-select-arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #2E6F40;
    pointer-events: none;
    font-size: 0.8rem;
  }

  .kt-swap-btn {
    background: #1e1e1e;
    border: 1px solid rgba(46,111,64,0.4);
    color: #2E6F40;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 22px;
  }

  .kt-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  @media (max-width: 600px) {
    .kt-panels { grid-template-columns: 1fr; }
    .kt-card { padding: 24px 18px; }
  }

  .kt-panel {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .kt-panel:focus-within { border-color: rgba(46,111,64,0.5); }
  .kt-panel-head {
    padding: 12px 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #222;
  }
  .kt-panel-lang {
    font-size: 0.75rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #444;
    font-weight: 500;
  }
  .kt-panel-lang.active { color: #2E6F40; }
  .kt-clear-btn {
    background: none;
    border: none;
    color: #3a3a3a;
    cursor: pointer;
    font-size: 0.85rem;
    padding: 2px 6px;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
  }

  .kt-textarea {
    flex: 1;
    padding: 16px;
    background: transparent;
    color: #e8e8e8;
    border: none;
    outline: none;
    font-size: 1.05rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    line-height: 1.7;
    resize: none;
    min-height: 160px;
  }
  .kt-textarea::placeholder { color: #333; }
  .kt-textarea[readonly] { color: #aaa; cursor: default; }

  .kt-panel-foot {
    padding: 8px 16px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .kt-char-count { font-size: 0.75rem; color: #333; }
  .kt-copy-btn {
    background: none;
    border: 1px solid #2a2a2a;
    color: #444;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, color 0.2s;
  }
  .kt-copy-btn:hover { border-color: #2E6F40; color: #2E6F40; }
  .kt-copy-btn.copied { border-color: #2E6F40; color: #2E6F40; }

  .kt-actions {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .kt-status-block { flex: 1; min-width: 0; }
  .kt-status {
    font-size: 0.82rem;
    color: #444;
    font-style: italic;
    min-height: 20px;
    display: block;
  }
  .kt-status.loading { color: #2E6F40; }
  .kt-status.error { color: #c0392b; font-style: normal; }
  .kt-status.success { color: #2E6F40; font-style: normal; }

  .kt-debug-box {
    background: #1a0a0a;
    border: 1px solid #3a1a1a;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.75rem;
    color: #e07070;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 160px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .kt-debug-label {
    font-size: 0.65rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #7a3a3a;
    margin-bottom: 4px;
  }

  .kt-translate-btn {
    background: #2E6F40;
    color: #CFFFDC;
    border: none;
    padding: 14px 36px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(46,111,64,0.3);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .kt-translate-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .kt-btn-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
    transform: translateX(-100%);
  }
  .kt-translate-btn:not(:disabled):hover .kt-btn-shimmer {
    animation: shimmer 0.45s forwards;
  }
  @keyframes shimmer {
    to { transform: translateX(100%); }
  }
`;

// ─── Animated Orb ─────────────────────────────────────────────────────────────

function AnimatedOrb({ className, delay = 0 }) {
  return (
    <motion.div
      className={`kt-bg-orb ${className}`}
      animate={{
        scale: [1, 1.18, 1],
        opacity: [0.7, 1, 0.7],
        x: [0, 25, 0],
        y: [0, -18, 0],
      }}
      transition={{
        duration: 9,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    />
  );
}

// ─── Swap Button ──────────────────────────────────────────────────────────────

function SwapButton({ onClick }) {
  const [swapCount, setSwapCount] = useState(0);

  const handleClick = () => {
    setSwapCount((c) => c + 1);
    onClick();
  };

  return (
    <motion.button
      className="kt-swap-btn"
      onClick={handleClick}
      whileHover={{
        scale: 1.12,
        backgroundColor: "rgba(46,111,64,0.18)",
        borderColor: "#2E6F40",
      }}
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: swapCount * 180 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      title="Swap languages"
    >
      ⇄
    </motion.button>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.button
      className={`kt-copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, borderColor: "#2E6F40", color: "#2E6F40" }}
      whileTap={{ scale: 0.94 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.16 }}
          style={{ display: "block" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Bouncing Dots ────────────────────────────────────────────────────────────

function BouncingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, marginLeft: 6, verticalAlign: "middle" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            display: "inline-block",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#2E6F40",
          }}
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(26,26,26,0.65)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        zIndex: 2,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ width: 10, height: 10, borderRadius: "50%", background: "#2E6F40" }}
              animate={{ y: [0, -12, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
        <motion.span
          style={{ fontSize: "0.72rem", letterSpacing: 2, textTransform: "uppercase", color: "#2E6F40" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Translating
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KinTranslator() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("yo");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [debugInfo, setDebugInfo] = useState(null);
  const abortRef = useRef(null);

  const sourceMeta = LANGUAGES.find((l) => l.code === sourceLang);
  const targetMeta = LANGUAGES.find((l) => l.code === targetLang);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
    setStatus({ type: "", msg: "" });
    setDebugInfo(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus({ type: "loading", msg: "Translating" });
    setOutputText("");
    setDebugInfo(null);

    try {
      const response = await fetch("https://kintranslate-backend.onrender.com/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ text: inputText, sourceLang, targetLang }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", msg: data.error || `Error ${response.status}` });
        setDebugInfo(`HTTP ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
        return;
      }

      setOutputText(data.translated);
      setStatus({ type: "success", msg: `Translated to ${targetMeta?.label}` });
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus({ type: "error", msg: `Network error: ${err.message}` });
      setDebugInfo(`${err.name}: ${err.message}\n\nIs the proxy running?\n  node index.js`);
    }
  };

  useEffect(() => {
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  const isLoading = status.type === "loading";
  const isDisabled = !inputText.trim() || isLoading;

  return (
    <>
      <style>{styles}</style>
      <div className="kt-root">
        <AnimatedOrb className="kt-bg-orb-1" delay={0} />
        <AnimatedOrb className="kt-bg-orb-2" delay={3} />

        {/* ── Card entrance ── */}
        <motion.div
          className="kt-card"
          initial={{ opacity: 0, y: 44, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* ── Header ── */}
          <motion.div
            className="kt-header"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="kt-eyebrow" variants={staggerItem}>
              Language Bridge
            </motion.div>
            <motion.h1 className="kt-title" variants={staggerItem}>
              Kin <span>Translate</span>
            </motion.h1>
          </motion.div>

          {/* ── Language bar ── */}
          <motion.div
            className="kt-lang-bar"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="kt-lang-group" variants={staggerItem}>
              <div className="kt-lang-label">Translate from</div>
              <div className="kt-select-wrapper">
                <select
                  className="kt-select"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                  ))}
                </select>
                <span className="kt-select-arrow">▾</span>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <SwapButton onClick={handleSwap} />
            </motion.div>

            <motion.div className="kt-lang-group" variants={staggerItem}>
              <div className="kt-lang-label">Translate to</div>
              <div className="kt-select-wrapper">
                <select
                  className="kt-select"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                  ))}
                </select>
                <span className="kt-select-arrow">▾</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Translation Panels ── */}
          <div className="kt-panels">

            {/* Input panel */}
            <motion.div
              className="kt-panel"
              custom={0}
              variants={panelVariant}
              initial="hidden"
              animate="visible"
              whileHover={{ borderColor: "rgba(46,111,64,0.4)" }}
              transition={{ borderColor: { duration: 0.2 } }}
            >
              <div className="kt-panel-head">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={sourceLang}
                    className="kt-panel-lang active"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {sourceMeta?.flag} {sourceMeta?.label}
                  </motion.span>
                </AnimatePresence>

                <AnimatePresence>
                  {inputText && (
                    <motion.button
                      className="kt-clear-btn"
                      onClick={() => {
                        setInputText("");
                        setOutputText("");
                        setStatus({ type: "", msg: "" });
                        setDebugInfo(null);
                      }}
                      initial={{ opacity: 0, scale: 0.75, x: 8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.75, x: 8 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ color: "#888", backgroundColor: "#222" }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Clear
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <textarea
                className="kt-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste text here…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleTranslate();
                }}
              />

              <div className="kt-panel-foot">
                <motion.span
                  className="kt-char-count"
                  animate={{ opacity: inputText.length > 0 ? 1 : 0.35 }}
                  transition={{ duration: 0.25 }}
                >
                  {inputText.length} chars
                </motion.span>
              </div>
            </motion.div>

            {/* Output panel */}
            <motion.div
              className="kt-panel"
              custom={0.13}
              variants={panelVariant}
              initial="hidden"
              animate="visible"
              whileHover={{ borderColor: "rgba(46,111,64,0.4)" }}
              transition={{ borderColor: { duration: 0.2 } }}
            >
              <div className="kt-panel-head">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={targetLang}
                    className={`kt-panel-lang ${outputText ? "active" : ""}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {targetMeta?.flag} {targetMeta?.label}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Textarea + loading overlay */}
              <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={outputText || "empty"}
                    style={{ flex: 1, display: "flex", flexDirection: "column" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <textarea
                      className="kt-textarea"
                      value={outputText}
                      readOnly
                      placeholder="Translation appears here…"
                    />
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                  {isLoading && <LoadingOverlay />}
                </AnimatePresence>
              </div>

              <div className="kt-panel-foot">
                <motion.span
                  className="kt-char-count"
                  animate={{ opacity: outputText.length > 0 ? 1 : 0.35 }}
                  transition={{ duration: 0.25 }}
                >
                  {outputText.length > 0 ? `${outputText.length} chars` : ""}
                </motion.span>
                <AnimatePresence>
                  {outputText && <CopyButton key="copy-btn" text={outputText} />}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── Actions row ── */}
          <motion.div
            className="kt-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
          >
            <div className="kt-status-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={status.msg + status.type}
                  className={`kt-status ${status.type}`}
                  variants={statusVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {isLoading ? (
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      Translating <BouncingDots />
                    </span>
                  ) : (
                    status.msg || "Press Ctrl+Enter or click Translate"
                  )}
                </motion.span>
              </AnimatePresence>

              <AnimatePresence>
                {debugInfo && (
                  <motion.div
                    className="kt-debug-box"
                    variants={debugVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="kt-debug-label">Debug Info</div>
                    {debugInfo}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Translate button */}
            <motion.button
              className="kt-translate-btn"
              onClick={handleTranslate}
              disabled={isDisabled}
              whileHover={isDisabled ? {} : {
                scale: 1.04,
                y: -2,
                boxShadow: "0 8px 32px rgba(46,111,64,0.5)",
              }}
              whileTap={isDisabled ? {} : { scale: 0.97, y: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 20 }}
            >
              <span className="kt-btn-shimmer" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLoading ? "loading" : "idle"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{ position: "relative", zIndex: 1 }}
                >
                  {isLoading ? "Translating…" : "Translate →"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}