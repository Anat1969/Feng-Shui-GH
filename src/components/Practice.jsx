import { useState } from "react";
import { motion } from "framer-motion";
import { ROOMS, EL, ELEMENT_KEYS } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note, ElTag } from "./ui.jsx";

const SPOTS = [
  { id: "good", n: "עמדת שליטה", x: 200, y: 222, ok: true, t: "הראש צמוד לקיר מלא, והדלת נראית באלכסון. זה המיקום המומלץ." },
  { id: "door", n: "בקו הדלת", x: 75, y: 170, ok: false, t: "בקו ישר מול הדלת. במסורת זו תנוחה שנמנעים ממנה, ובפועל כל תנועה במסדרון מפריעה למנוחה." },
  { id: "back", n: "על קיר הדלת", x: 190, y: 52, ok: false, t: "הראש צמוד לקיר של הדלת. מי שנכנס נמצא מחוץ לשדה הראייה, והגוף לא נרגע." },
  { id: "window", n: "מתחת לחלון", x: 242, y: 135, ok: false, t: "ראש המיטה מתחת לחלון: בלי קיר שמגן מאחור, עם רוח, רעש ואור ישירים." },
];

export default function Practice() {
  const [spot, setSpot] = useState(SPOTS[0]);
  return (
    <div className="page">
      <SectionHead
        id="practice"
        title="יישום בבית"
        sub="איך מתרגמים את העקרונות להחלטות: איפה המיטה, איך מסדרים את הסלון, מה עושים עם פינה חשוכה."
      />

      <div className="rooms">
        {ROOMS.map((r, i) => (
          <motion.article
            key={r.title}
            className="card room"
            style={{ "--c": EL[r.els[0]].c }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
          >
            <div className="room-head">
              <h2 className="h3">{r.title}</h2>
              <div className="tags">{r.els.map(k => <ElTag key={k} k={k} />)}</div>
            </div>
            <p className="room-principle">{r.principle}</p>
            <div className="label">מה עושים</div>
            <p>{r.act}</p>
            <div className="room-arch">
              <div className="label">קריאה אדריכלית</div>
              <p>{r.arch}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <section className="block">
        <div className="block-head">
          <div className="label">כלי</div>
          <h2 className="h1">עמדת השליטה</h2>
          <p className="muted">העיקרון החשוב ביותר בפנג שואי, למיטה, לשולחן ולכיריים. בוחרים מיקום בתוכנית ורואים למה הוא עובד או לא.</p>
        </div>
        <div className="split split-tight">
          <div className="card plan-card">
            <svg viewBox="0 0 300 280" className="plan">
              <defs>
                <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#1b1b1d" strokeWidth="1.4" />
                </pattern>
              </defs>
              <rect x="20" y="20" width="260" height="240" fill="#fafaf8" />
              <path d="M20,20 H40 M110,20 H280 V260 H20 V20" fill="none" stroke="url(#hatch)" strokeWidth="10" />
              <path d="M20,20 H40 M110,20 H280 V260 H20 V20" fill="none" stroke="#1b1b1d" strokeWidth="1" />
              <path d="M40,20 A70,70 0 0,0 110,90" fill="none" stroke="#9a9a96" strokeDasharray="3 4" />
              <line x1="40" y1="20" x2="40" y2="90" stroke="#1b1b1d" strokeWidth="2" />
              <line x1="280" y1="100" x2="280" y2="170" stroke="#fafaf8" strokeWidth="11" />
              <line x1="276" y1="100" x2="276" y2="170" stroke="#1b1b1d" strokeWidth="1" />
              <line x1="284" y1="100" x2="284" y2="170" stroke="#1b1b1d" strokeWidth="1" />
              <text x="75" y="14" textAnchor="middle" className="plan-t">דלת</text>
              <text x="294" y="135" textAnchor="middle" className="plan-t" transform="rotate(90 294 135)">חלון</text>
              {spot.ok && <line x1={spot.x} y1={spot.y} x2="75" y2="24" stroke="#1b1b1d" strokeDasharray="4 4" strokeWidth="1.2" />}
              {SPOTS.map(s => (
                <g key={s.id} className="spot" onClick={() => setSpot(s)} role="button" tabIndex={0}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSpot(s)} data-spot={s.id}>
                  <rect x={s.x - 34} y={s.y - 24} width="68" height="48" rx="4"
                    fill={spot.id === s.id ? "#1b1b1d" : "#ffffff"} stroke="#1b1b1d" strokeWidth="1.2" />
                  <text x={s.x} y={s.y + 4} textAnchor="middle" className="plan-s" fill={spot.id === s.id ? "#fff" : "#1b1b1d"}>מיטה</text>
                </g>
              ))}
            </svg>
          </div>
          <motion.div key={spot.id} className="card panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="label">{spot.ok ? "מומלץ" : "לא מומלץ"}</div>
            <h3 className="h2">{spot.n}</h3>
            <p>{spot.t}</p>
            <div className="chips">
              {SPOTS.map(s => <button key={s.id} className={`chip${spot.id === s.id ? " on" : ""}`} onClick={() => setSpot(s)}>{s.n}</button>)}
            </div>
            <p className="muted small">אם אי אפשר להזיז את המיטה, מראה קטנה שמשקפת את הדלת מחזירה את קו המבט.</p>
          </motion.div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div className="label">סיכום</div>
          <h2 className="h1">חמשת האלמנטים בבית</h2>
          <p className="muted">מה מכניסים לחדר כדי להוסיף כל אלמנט, ומתי.</p>
        </div>
        <div className="el-sum">
          {ELEMENT_KEYS.map(k => {
            const e = EL[k];
            return (
              <button key={k} className="card el-card" style={{ "--c": e.c }} onClick={() => go("elements", k)}>
                <span className="el-card-hz">{e.hz}</span>
                <span className="h3" style={{ color: e.c }}>{e.n}</span>
                <span className="el-card-row"><b>חומרים</b>{e.m}</span>
                <span className="el-card-row"><b>צורות</b>{e.sh}</span>
                <span className="el-card-row"><b>צבעים</b>{e.co}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="notes">
        <Note kind="תובנה">
          הכלל שקודם לכולם הוא פינוי. חפץ שלא משתמשים בו ולא אוהבים אותו תופס מקום, אור ותשומת לב. לפני שמוסיפים אלמנט, מוציאים משהו.
        </Note>
        <Note kind="קריאה אדריכלית">
          עמדת השליטה היא הגרסה הסינית של תיאוריית מבט ומחסה של ג׳יי אפלטון (Jay Appleton, 1975): אנשים מעדיפים מקום שבו הגב מוגן ויש להם שדה ראייה פתוח.
        </Note>
      </div>
    </div>
  );
}
