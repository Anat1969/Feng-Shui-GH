import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS, LINKS, PROJECT } from "../data.js";
import { go } from "../router.js";
import KeyMark from "./KeyMark.jsx";

export default function Nav({ current }) {
  const [copied, setCopied] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const [open, setOpen] = useState(false);
  const tabsRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const el = tabsRef.current?.querySelector(".tab.on");
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [current]);

  useEffect(() => {
    const on = e => { e.preventDefault(); setInstallEvt(e); };
    const done = () => setInstallEvt(null);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", done); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = e => { if (!menuRef.current?.contains(e.target)) setOpen(false); };
    const esc = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  async function copyLink() {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const t = document.createElement("textarea");
      t.value = url; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch {}
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function install() {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice.catch(() => {});
    setInstallEvt(null);
  }

  return (
    <nav className="topbar" aria-label="ניווט ראשי">
      <div className="topbar-row">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); go(""); }}>
          <img className="app-mark" src="/icons/icon.svg" alt="" width="40" height="40" />
          <span className="brand-name">פנג שואי</span>
          <span className="brand-sub">קריאת מרחב</span>
        </a>
        <div className="settings" ref={menuRef}>
          <button className={`logo-btn${open ? " on" : ""}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="dialog" aria-label="הגדרות" data-act="settings">
            <img className="brand-logo" src="/logo.png" alt="אד׳ ענת שטיבלמן" width="442" height="155" />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                className="settings-card"
                role="dialog"
                aria-label="הגדרות"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="label">הגדרות</div>
                <div className="settings-list">
                  <button className="btn" onClick={copyLink} data-testid="copy">{copied ? "הקישור הועתק" : "העתקת קישור"}</button>
                  <a className="btn" href={LINKS.dev} target="_blank" rel="noopener">שיחת הפיתוח</a>
                  <a className="btn" href={LINKS.research} target="_blank" rel="noopener">פרויקט המחקר</a>
                  {installEvt
                    ? <button className="btn btn-dark" onClick={install}>התקנת האפליקציה</button>
                    : <span className="muted small settings-note">התקנת האפליקציה: נפתחת כשהדפדפן Chrome מציע אותה, או מתפריט Chrome, "התקנה".</span>}
                </div>
                <div className="settings-sep" />
                <div className="label">פרטי הפרויקט</div>
                <dl className="proj">
                  {PROJECT.map(p => (
                    <div key={p.k}>
                      <dt>{p.k}</dt>
                      <dd>
                        {p.href ? <a href={p.href} target="_blank" rel="noopener" dir="ltr">{p.v}</a> : <span dir="ltr">{p.v}</span>}
                        {p.sub && <small>{p.sub}</small>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="tabs" role="tablist" ref={tabsRef}>
        <button className={`tab${current === "home" ? " on" : ""}`} onClick={() => go("")}>
          <span className="tab-n">00</span>מבוא
        </button>
        {SECTIONS.map(s => (
          <button key={s.id} className={`tab${current === s.id ? " on" : ""}`} onClick={() => go(s.id)}>
            <span className="tab-n">{s.n}</span>{s.title}
          </button>
        ))}
        <button className={`tab tab-tool${current === "image-analysis" ? " on" : ""}`} onClick={() => go("image-analysis")}>
          ניתוח תמונה<KeyMark />
        </button>
      </div>
    </nav>
  );
}
