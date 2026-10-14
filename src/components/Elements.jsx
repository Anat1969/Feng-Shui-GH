import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { EL, ELEMENT_KEYS, CYCLES } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note } from "./ui.jsx";

const C = 250, R = 165, NR = 50;
const ANG = { fire: -90, earth: -18, metal: 54, water: 126, wood: 198 };
const pos = (k, r = R) => {
  const a = (ANG[k] * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
const ptAt = deg => { const a = (deg * Math.PI) / 180; return [C + R * Math.cos(a), C + R * Math.sin(a)]; };

/* מעגל היצירה: קשת על המעגל מאלמנט לבא אחריו */
function shengPath(from) {
  const gap = ((NR + 8) / R) * (180 / Math.PI);
  const a1 = ANG[from] + gap, a2 = ANG[from] + 72 - gap;
  const [x1, y1] = ptAt(a1), [x2, y2] = ptAt(a2);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}
/* מעגל הריסון: קו ישר אל האלמנט שאחרי הבא */
function kePath(from, to) {
  const [x1, y1] = pos(from), [x2, y2] = pos(to);
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), s = (NR + 8) / L;
  return `M${(x1 + dx * s).toFixed(1)},${(y1 + dy * s).toFixed(1)} L${(x2 - dx * s).toFixed(1)},${(y2 - dy * s).toFixed(1)}`;
}

export default function Elements({ item }) {
  const [cycle, setCycle] = useState("sheng");
  const selected = EL[item] ? item : null;
  const select = k => go("elements", k);

  return (
    <div className="page">
      <SectionHead
        id="elements"
        title="חמשת האלמנטים"
        sub="אש, אדמה, מתכת, מים ועץ. לא חומרים אלא איכויות של תנועה, וכל אחת מהן נראית בחדר דרך צורה, חומר וצבע."
      />

      <div className="seg" role="tablist">
        {Object.entries(CYCLES).map(([id, c]) => (
          <button key={id} className={`seg-btn${cycle === id ? " on" : ""}`} onClick={() => setCycle(id)}>
            {c.label}<span className="seg-sub">{c.sub}</span>
          </button>
        ))}
      </div>

      <div className="split">
        <div className="stage">
          <WuXing cycle={cycle} selected={selected} onSelect={select} />
          <motion.div key={cycle} className="card cycle-note" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="label">{CYCLES[cycle].label} · {CYCLES[cycle].sub}</div>
            <p>{CYCLES[cycle].text}</p>
            <p className="muted">{CYCLES[cycle].use}</p>
          </motion.div>
        </div>
        <div className="card panel">
          <AnimatePresence mode="wait">
            {selected
              ? <ElementPanel key={selected} k={selected} onSelect={select} />
              : <motion.div key="empty" className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="label">איך משתמשים</div>
                  <p>בוחרים אלמנט בדיאגרמה כדי לראות את התכונות שלו, איך הוא נראה בחדר, ואיך מחזקים או מרסנים אותו.</p>
                  <div className="chips">
                    {ELEMENT_KEYS.map(k => <button key={k} className="chip" style={{ "--c": EL[k].c }} onClick={() => select(k)}>{EL[k].n}</button>)}
                  </div>
                </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      <div className="notes">
        <Note kind="איך לקרוא">
          החצים הרציפים על המעגל הם מעגל היצירה: כל אלמנט מזין את הבא. הקווים המקווקווים שחוצים את המעגל הם מעגל הריסון. כשבוחרים אלמנט, נשארים מודגשים רק הקשרים שלו.
        </Note>
        <Note kind="תובנה">
          הדרך העדינה לרסן אלמנט שהשתלט היא לא להילחם בו, אלא להוסיף את האלמנט שהוא מזין. כך האנרגיה שלו מתנקזת הלאה במקום להיחסם.
        </Note>
        <Note kind="קריאה אדריכלית">
          חמשת האלמנטים הם בפועל מערכת של חומר, צורה וצבע. מעצבים משתמשים באותם כלים: חומר טבעי מחמם, קו אנכי מגביה, עיגול מרכך, משטח מבריק מרחיב.
        </Note>
      </div>
    </div>
  );
}

function WuXing({ cycle, selected, onSelect }) {
  const showS = cycle !== "ke", showK = cycle !== "sheng";
  const touches = (a, b) => !selected || selected === a || selected === b;
  return (
    <svg viewBox="0 0 500 500" className="wx-svg" role="group" aria-label="מעגל חמשת האלמנטים">
      <defs>
        <marker id="ms" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#1b1b1d" /></marker>
        <marker id="mk" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#8a8a86" /></marker>
        <filter id="ns" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.16" /></filter>
        <radialGradient id="nf" cx="40%" cy="30%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#ececea" /></radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R + 62} fill="none" stroke="#dcdcd8" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="#e6e6e2" strokeDasharray="2 6" />

      {showS && ELEMENT_KEYS.map(k => (
        <path key={"s" + k} d={shengPath(k)} className="arr-s" fill="none" stroke="#1b1b1d" strokeWidth="2.2"
          markerEnd="url(#ms)" opacity={touches(k, EL[k].gen) ? 0.9 : 0.12} />
      ))}
      {showK && ELEMENT_KEYS.map(k => (
        <path key={"k" + k} d={kePath(k, EL[k].ctrl)} className="arr-k" fill="none" stroke="#8a8a86" strokeWidth="1.8"
          strokeDasharray="6 6" markerEnd="url(#mk)" opacity={touches(k, EL[k].ctrl) ? 0.95 : 0.1} />
      ))}

      {ELEMENT_KEYS.map((k, i) => {
        const [x, y] = pos(k), e = EL[k], on = selected === k;
        return (
          <motion.g
            key={k}
            className="wx-node"
            role="button"
            tabIndex={0}
            aria-label={e.n}
            data-el={k}
            onClick={() => onSelect(k)}
            onKeyDown={ev => (ev.key === "Enter" || ev.key === " ") && onSelect(k)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: selected && !on ? 0.55 : 1, scale: on ? 1.08 : 1 }}
            whileHover={{ scale: on ? 1.08 : 1.05 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: i * 0.05 }}
            style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" }}
          >
            <circle cx={x} cy={y} r={NR} fill="url(#nf)" filter="url(#ns)" />
            <circle cx={x} cy={y} r={NR} fill="none" stroke={e.c} strokeWidth={on ? 5 : 3} />
            <circle cx={x} cy={y} r={NR - 8} fill={e.c} opacity={on ? 0.14 : 0.06} />
            <text x={x} y={y + 4} textAnchor="middle" className="wx-hz" fill={e.c}>{e.hz}</text>
            <text x={x} y={y + 30} textAnchor="middle" className="wx-n">{e.n}</text>
          </motion.g>
        );
      })}
      <text x={C} y={C - 6} textAnchor="middle" className="wx-center">{cycle === "ke" ? "ריסון" : cycle === "sheng" ? "יצירה" : "איזון"}</text>
      <text x={C} y={C + 14} textAnchor="middle" className="wx-center-sub">{CYCLES[cycle].sub}</text>
    </svg>
  );
}

function ElementPanel({ k, onSelect }) {
  const e = EL[k];
  const rows = [
    ["עונה", e.s], ["כיוון", e.d], ["אברים", e.o], ["רגשות", e.e],
    ["תכונות", e.q], ["אזור חיים", e.la], ["צורות", e.sh], ["חומרים", e.m], ["צבעים", e.co],
  ];
  const Rel = ({ label, to, verb }) => (
    <button className="rel" onClick={() => onSelect(to)} style={{ "--c": EL[to].c }}>
      <span className="label">{label}</span>
      <span className="rel-n">{EL[to].n}</span>
      {verb && <span className="rel-v">{verb}</span>}
    </button>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}>
      <div className="panel-head" style={{ "--c": e.c }}>
        <span className="panel-hz">{e.hz}</span>
        <div>
          <h2 className="h2" style={{ color: e.c }}>{e.n}</h2>
          <div className="mono">{e.en} · {e.py}</div>
        </div>
      </div>
      <p className="panel-lead">{e.space}</p>
      <dl className="rows">
        {rows.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="label rel-title">קשרים במעגלים</div>
      <div className="rels">
        <Rel label="מזין את" to={e.gen} verb={e.genVerb} />
        <Rel label="ניזון מ" to={e.genBy} />
        <Rel label="מרסן את" to={e.ctrl} verb={e.ctrlVerb} />
        <Rel label="מרוסן על ידי" to={e.ctrlBy} />
      </div>
      <div className="howto">
        <div>
          <div className="label">כדי לחזק</div>
          <p>להוסיף {e.n} ישירות ({e.m.split(",")[0]}), או את {EL[e.genBy].n} שמזין אותו.</p>
        </div>
        <div>
          <div className="label">כדי לרסן</div>
          <p>להוסיף {EL[e.gen].n}, שמנקז אותו בעדינות. במצב קיצוני, {EL[e.ctrlBy].n}, שמרסן אותו ישירות.</p>
        </div>
      </div>
    </motion.div>
  );
}
