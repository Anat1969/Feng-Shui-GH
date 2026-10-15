import { motion, AnimatePresence } from "framer-motion";
import { BG, BAGUA_ORDER, EL } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note, Trigram, ElTag } from "./ui.jsx";
import BaguaArt from "./BaguaArt.jsx";

/* תובנה לכל טריגרם: איך הדימוי מוביל לנושא */
const TG_INSIGHT = {
  north: "מים זורמים מוצאים דרך, כמו מסלול חיים",
  ne: "ההר עומד ושותק: מקום ללמידה והתבוננות",
  east: "הרעם מעיר את האביב: צמיחה של משפחה ובריאות",
  se: "הרוח מפזרת זרעים: שפע שנע ומתרבה",
  south: "האש מאירה ונראית מרחוק: מוניטין והכרה",
  sw: "האדמה מקבלת ומחזיקה: זוגיות ויחסים",
  west: "האגם שמח ומשקף: יצירה וילדים",
  nw: "השמיים פרושים מעל: אנשים תומכים ומסעות",
  center: "הציר שהכול נשען עליו: בריאות ואיזון",
};

export default function Bagua({ item }) {
  const selected = BG[item] ? item : null;
  const select = k => go("bagua", k);

  return (
    <div className="page">
      <SectionHead
        id="bagua"
        title="מפת הבאגואה"
        sub="רשת של תשעה ריבועים שמונחת על תוכנית הבית. כל ריבוע הוא כיוון, אלמנט ואזור חיים, והמרכז הוא הלב שמחזיק את כולם."
      />

      <div className="split">
        <div className="stage">
          <div className="compass">
            <span className="mono">צפון</span>
          </div>
          <div className="bagua-wrap">
            <div className="bagua" role="grid" aria-label="מפת הבאגואה">
              {BAGUA_ORDER.map((k, i) => {
                const b = BG[k], e = EL[b.el], on = selected === k;
                return (
                  <motion.button
                    key={k}
                    data-bg={k}
                    className={`cell${on ? " on" : ""}${selected && !on ? " dim" : ""}${k === "center" ? " center" : ""}`}
                    style={{ "--c": e.c }}
                    onClick={() => select(k)}
                    aria-label={`${b.n}: ${b.la}. ${TG_INSIGHT[k]}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <span className="cell-inner">
                      <span className="cell-face cell-front">
                        <BaguaArt k={k} color={e.c} />
                        <span className="cell-dir mono">{b.n}</span>
                        {b.trigram ? <Trigram lines={b.trigram} color={on ? e.c : "#1b1b1d"} w={30} /> : <span className="cell-hz">中</span>}
                        <span className="cell-la">{b.la}</span>
                        <span className="cell-bar" />
                      </span>
                      <span className="cell-face cell-back" aria-hidden="true">
                        <BaguaArt k={k} color={e.c} />
                        <span className="cell-tg" style={{ color: e.c }}>{b.tg}</span>
                        <span className="cell-img mono">{b.img}</span>
                        <span className="cell-insight">{TG_INSIGHT[k]}</span>
                        <span className="cell-bar" />
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="door"><span className="mono">דרום</span></div>
          </div>
        </div>

        <div className="card panel">
          <AnimatePresence mode="wait">
            {selected ? <BaguaPanel key={selected} k={selected} /> : (
              <motion.div key="empty" className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="label">איך משתמשים</div>
                <p>בוחרים ריבוע במפה. לכל אזור: הטריגרם שלו מספר התמורות, האלמנט, מה מחזק אותו ומה כדאי להרחיק ממנו.</p>
                <ol className="howlist">
                  <li>מציירים את תוכנית הבית או החדר כמלבן.</li>
                  <li>מחלקים אותו לשלוש על שלוש.</li>
                  <li>מסמנים את הצפון לפי מצפן, ומניחים את המפה.</li>
                  <li>בודקים מה נמצא בכל ריבוע היום, ומה היה כדאי שיהיה בו.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      <div className="notes">
        <Note kind="עובדה">
          יש שתי שיטות להנחת המפה. בשיטה הקלאסית (בית ספר המצפן) המפה מכוונת לפי הצפון האמיתי. בשיטה המערבית החדשה (BTB) מיישרים את הצלע התחתונה לקיר הכניסה, בלי מצפן. כאן מוצגת השיטה הקלאסית.
        </Note>
        <Note kind="איך לזכור">
          ריחוף מעל משבצת הופך אותה, ומאחור מופיעים הטריגרם, הדימוי שלו והתובנה שמחברת אותו לנושא. כך ההסבר נשאר צמוד למקום שלו במפה. בטריגרם קו שלם הוא יאנג וקו שבור הוא יין, וקוראים מלמטה למעלה.
        </Note>
        <Note kind="תובנה">
          במפות סיניות מסורתיות הדרום מצויר למעלה, כי השליט ישב מול הדרום. כאן הצפון למעלה, כמו בתוכנית אדריכלית, כדי שיהיה קל להניח את המפה על תוכנית אמיתית.
        </Note>
        <Note kind="קריאה אדריכלית">
          לפני אזורי החיים, המפה היא כלי להתמצאות: היא מבקשת לבדוק איפה האור נכנס בכל שעה. הדרום הוא הכיוון המואר והחם, הצפון הוא הקריר והאחיד, ובישראל זה בדיוק ההיגיון של תכנון אקלימי.
        </Note>
      </div>
    </div>
  );
}

function BaguaPanel({ k }) {
  const b = BG[k], e = EL[b.el];
  const rows = [["צבעים", b.col], ["להוסיף", b.act], ["להרחיק", b.av]];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}>
      <div className="panel-head" style={{ "--c": e.c }}>
        {b.trigram ? <span className="panel-tg"><Trigram lines={b.trigram} color={e.c} w={42} /></span> : <span className="panel-hz">中</span>}
        <div>
          <h2 className="h2">{b.n}</h2>
          <div className="mono">{b.tg} · {b.py} · {b.img}</div>
        </div>
      </div>
      <div className="panel-art"><BaguaArt k={k} color={e.c} /><div className="panel-area" style={{ color: e.c }}>{b.la}</div><div className="panel-insight">{TG_INSIGHT[k]}</div></div>
      <dl className="rows">
        <div><dt>אלמנט</dt><dd><button className="linklike" onClick={() => go("elements", b.el)}><ElTag k={b.el} /></button></dd></div>
        {rows.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="tip" style={{ "--c": e.c }}>
        <div className="label">הדרכה מעשית</div>
        <p>{b.tip}</p>
      </div>
    </motion.div>
  );
}
