import { motion } from "framer-motion";
import { SECTIONS, PRINCIPLES, STEPS, EL, ELEMENT_KEYS } from "../data.js";
import { go } from "../router.js";

const rise = i => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: 0.08 * i, ease: [0.2, 0.7, 0.2, 1] },
});

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <motion.div className="hero-text" {...rise(0)}>
          <div className="eyebrow">מדריך אינטראקטיבי<span>Feng Shui · 風水</span></div>
          <h1 className="display xl">פנג שואי</h1>
          <p className="hero-lede">
            רוח ומים. שפה עתיקה לקריאת מרחב, מתורגמת לכלי עבודה עכשווי:
            איך הבית משפיע על התחושה, על ההתנהגות ועל הקשרים, ואיך לעצב אותו בכוונה.
          </p>
          <div className="hero-cta">
            <button className="btn btn-dark btn-lg" onClick={() => go("yinyang")}>להתחיל את המסלול</button>
            <button className="btn btn-lg" onClick={() => go("diagnosis")}>לאבחן חדר</button>
          </div>
        </motion.div>
        <motion.div className="hero-art" {...rise(1)} aria-hidden="true">
          <HeroDiagram />
        </motion.div>
      </section>

      <section className="vgp">
        {[
          ["החזון", "בית שתומך באדם שגר בו. אור, תנועה, מנוחה ופעולה, כל אחד במקומו. מרחב שקורא את האדם, ולא רק אדם שמסתגל למרחב."],
          ["המטרה", "שכל אחד יוכל לעמוד בחדר, לקרוא אותו, לזהות מה חסר או עודף, ולבצע שינוי אחד קטן ומדויק."],
          ["הדרך", "חמישה שלבים: להבין את האיזון, ללמוד את שפת האלמנטים, למפות את הבית, ליישם חדר אחר חדר, ולאבחן."],
        ].map(([k, t], i) => (
          <motion.article className="card vgp-card" key={k} {...rise(i + 2)}>
            <div className="label">{String(i + 1).padStart(2, "0")}</div>
            <h2 className="h2">{k}</h2>
            <p>{t}</p>
          </motion.article>
        ))}
      </section>

      <section className="block">
        <div className="block-head">
          <div className="label">מפת התוכן</div>
          <h2 className="h1">המסלול</h2>
          <p className="muted">כל שלב בונה על הקודם. אפשר גם לקפוץ ישר לשלב שמעניין.</p>
        </div>
        <ol className="route">
          {SECTIONS.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <button className="route-item" onClick={() => go(s.id)}>
                <span className="route-n">{s.n}</span>
                <span className="route-body">
                  <span className="route-title">{s.title}</span>
                  <span className="route-lead">{s.lead}</span>
                  <span className="route-step">{s.step}</span>
                </span>
                <span className="route-go">כניסה</span>
              </button>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="block two-col">
        <div>
          <div className="label">שתי קריאות</div>
          <h2 className="h1">מסורת ותכנון</h2>
          <p className="muted">
            האתר קורא את הפנג שואי בשתי עדשות במקביל: מה אומרת המסורת, ומה אומר עליו תכנון מבוסס ידע.
            ההפרדה חשובה, כדי לקחת את מה שעובד בלי לקבל הבטחות שאין להן בסיס.
          </p>
        </div>
        <div className="principles">
          {PRINCIPLES.map(p => (
            <div className="principle" key={p.k}>
              <div className="label">{p.k}</div>
              <p>{p.t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div className="label">הדרכה</div>
          <h2 className="h1">איך עובדים עם חדר</h2>
          <p className="muted">חמישה צעדים שחוזרים על עצמם בכל חדר. הסדר חשוב יותר מהחפצים.</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <motion.div
              className="step card"
              key={s.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <div className="step-n">{i + 1}</div>
              <h3 className="h3">{s.t}</h3>
              <p>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div className="label">צבע עם משמעות</div>
          <h2 className="h1">למה רוב האתר אפור</h2>
          <p className="muted">
            הצבע באתר שמור לחמשת האלמנטים בלבד. כשמופיע צבע, הוא אומר משהו: אדום הוא אש, ירוק הוא עץ, כחול הוא מים.
            שחור ולבן הם יין ויאנג.
          </p>
        </div>
        <div className="swatches">
          {ELEMENT_KEYS.map(k => (
            <button key={k} className="swatch" style={{ "--c": EL[k].c }} onClick={() => go("elements", k)}>
              <span className="swatch-hz">{EL[k].hz}</span>
              <span className="swatch-n">{EL[k].n}</span>
              <span className="swatch-q">{EL[k].q}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* דיאגרמת הפתיחה: תוכנית בית מופשטת עם רשת הבאגואה, וחמש נקודות צבע במקומן */
function HeroDiagram() {
  const cells = [0, 1, 2].flatMap(r => [0, 1, 2].map(c => [r, c]));
  const dots = [["water", 0, 1], ["wood", 1, 2], ["fire", 2, 1], ["metal", 1, 0], ["earth", 1, 1]];
  return (
    <svg viewBox="0 0 400 400" className="hero-svg">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4e4e1" />
        </linearGradient>
        <filter id="hs" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000" floodOpacity="0.16" />
        </filter>
      </defs>
      <g transform="translate(200 200) rotate(-8) skewX(6) translate(-200 -200)">
        <rect x="50" y="50" width="300" height="300" rx="6" fill="url(#hg)" filter="url(#hs)" />
        {cells.map(([r, c]) => (
          <rect key={`${r}${c}`} x={50 + c * 100} y={50 + r * 100} width="100" height="100" fill="none" stroke="#c9c9c5" strokeWidth="1" />
        ))}
        <rect x="50" y="50" width="300" height="300" rx="6" fill="none" stroke="#1b1b1d" strokeWidth="2" />
        <rect x="180" y="346" width="40" height="8" fill="#f4f4f2" />
        {dots.map(([k, r, c], i) => (
          <motion.circle
            key={k}
            cx={50 + c * 100 + 50 + (k === "earth" ? 0 : (c - 1) * 12)}
            cy={50 + r * 100 + 50 + (k === "earth" ? 0 : (r - 1) * 12)}
            r={k === "earth" ? 16 : 11}
            fill={EL[k].c}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.92 }}
            transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 180, damping: 14 }}
          />
        ))}
        <motion.circle
          cx="200" cy="200" r="120" fill="none" stroke="#1b1b1d" strokeWidth="1" strokeDasharray="3 7"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: "easeInOut" }}
        />
      </g>
    </svg>
  );
}
