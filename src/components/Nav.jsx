import { useEffect, useRef, useState } from "react";
import { SECTIONS, LINKS } from "../data.js";
import { go } from "../router.js";

export default function Nav({ current }) {
  const [copied, setCopied] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const tabsRef = useRef(null);

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
          <span className="brand-name">פנג שואי</span>
          <span className="brand-sub">קריאת מרחב</span>
        </a>
        <div className="side">
        <div className="actions">
          <button className="btn" onClick={copyLink} data-testid="copy">{copied ? "הקישור הועתק" : "העתקת קישור"}</button>
          <a className="btn" href={LINKS.dev} target="_blank" rel="noopener">שיחת הפיתוח</a>
          <a className="btn" href={LINKS.research} target="_blank" rel="noopener">פרויקט המחקר</a>
          {installEvt && <button className="btn btn-dark" onClick={install}>התקנת האפליקציה</button>}
        </div>
        <img className="brand-logo" src="/logo.png" alt="אד׳ ענת שטיבלמן" width="442" height="155" />
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
          ניתוח תמונה
        </button>
      </div>
    </nav>
  );
}
