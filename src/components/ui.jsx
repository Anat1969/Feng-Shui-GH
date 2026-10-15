import { motion } from "framer-motion";
import { SECTIONS, EL } from "../data.js";
import { go } from "../router.js";

export function SectionHead({ id, title, sub, children }) {
  const s = SECTIONS.find(x => x.id === id);
  return (
    <header className="sec-head">
      <div className="eyebrow">{s ? `${s.n} / ${SECTIONS.length.toString().padStart(2, "0")}` : ""}<span>{s?.lead}</span></div>
      <h1 className="display">{title}</h1>
      <p className="lede">{sub}</p>
      {children}
    </header>
  );
}

/* תיבת הסבר: kind = "איך לקרוא" / "תובנה" / "קריאה אדריכלית" / "עובדה" */
export function Note({ kind, children, tone }) {
  return (
    <motion.aside
      className={`note${tone ? " note-" + tone : ""}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
    >
      <div className="label">{kind}</div>
      <div className="note-body">{children}</div>
    </motion.aside>
  );
}

export function ElTag({ k }) {
  const e = EL[k];
  return <span className="el-tag" style={{ "--c": e.c }}>{e.n}</span>;
}

export function Trigram({ lines, color = "currentColor", w = 34 }) {
  if (!lines) return null;
  const top = [...lines].reverse();
  return (
    <svg className="trigram" width={w} height={w * 0.8} viewBox="0 0 40 32" aria-hidden="true">
      {top.map((l, i) =>
        l ? <rect key={i} x="0" y={i * 12} width="40" height="7" rx="1" fill={color} />
          : <g key={i}><rect x="0" y={i * 12} width="17" height="7" rx="1" fill={color} /><rect x="23" y={i * 12} width="17" height="7" rx="1" fill={color} /></g>
      )}
    </svg>
  );
}

export function PageFoot({ current }) {
  const tool = current === "image-analysis";
  const i = tool ? SECTIONS.length : SECTIONS.findIndex(s => s.id === current);
  const prev = i > 0 ? SECTIONS[i - 1] : null;
  const next = current === "diagnosis" ? { id: "image-analysis", title: "ניתוח תמונה" }
    : !tool && i < SECTIONS.length - 1 ? SECTIONS[i + 1] : null;
  return (
    <footer className="page-foot">
      {current !== "home" && (
        <div className="pager">
          {prev ? (
            <button className="pager-btn" onClick={() => go(prev.id)}>
              <span className="label">הקודם</span><span>{prev.title}</span>
            </button>
          ) : (
            <button className="pager-btn" onClick={() => go("")}>
              <span className="label">חזרה</span><span>דף הבית</span>
            </button>
          )}
          {next ? (
            <button className="pager-btn pager-next" onClick={() => go(next.id)}>
              <span className="label">הבא</span><span>{next.title}</span>
            </button>
          ) : (
            <button className="pager-btn pager-next" onClick={() => go("")}>
              <span className="label">סיום המסלול</span><span>חזרה לדף הבית</span>
            </button>
          )}
        </div>
      )}
      <div className="colophon">
        <span>פנג שואי: קריאת מרחב</span>
        <span>מדריך עיון. המסורת אינה תחליף לייעוץ מקצועי בתכנון או בבריאות.</span>
      </div>
    </footer>
  );
}
