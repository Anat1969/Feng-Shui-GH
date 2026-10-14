import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SYMPTOMS, EL, ELEMENT_KEYS } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note } from "./ui.jsx";

/* הבחירות נשמרות בכתובת (#diagnosis/s1.s4), כך שהעתקת קישור משתפת גם את האבחון */
export default function Diagnosis({ item }) {
  const picked = useMemo(() => new Set((item || "").split(".").filter(id => SYMPTOMS.some(s => s.id === id))), [item]);

  function save(next) {
    history.replaceState(null, "", `#diagnosis${next.size ? "/" + [...next].join(".") : ""}`);
    window.dispatchEvent(new Event("hashchange"));
  }
  function toggle(id) {
    const next = new Set(picked);
    next.has(id) ? next.delete(id) : next.add(id);
    save(next);
  }
  const reset = () => save(new Set());

  const score = useMemo(() => {
    const s = Object.fromEntries(ELEMENT_KEYS.map(k => [k, 0]));
    SYMPTOMS.forEach(x => picked.has(x.id) && s[x.el]++);
    return s;
  }, [picked]);
  const max = Math.max(...Object.values(score));
  const top = max ? ELEMENT_KEYS.filter(k => score[k] === max) : [];

  return (
    <div className="page">
      <SectionHead
        id="diagnosis"
        title="אבחון מרחב"
        sub="בוחרים חדר אחד, עומדים בו, ומסמנים מה מרגישים. האבחון מצביע על האלמנט החסר ומציע שינוי אחד ראשון."
      />

      <div className="split">
        <div className="card panel">
          <div className="label">מה מרגישים בחדר</div>
          <ul className="checks">
            {SYMPTOMS.map(s => {
              const on = picked.has(s.id);
              return (
                <li key={s.id}>
                  <button className={`check${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggle(s.id)} data-sym={s.id}>
                    <span className="box" />
                    <span>{s.t}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="row-btns">
            <button className="btn" onClick={reset} disabled={!picked.size}>איפוס</button>
            <span className="muted small">{picked.size ? `סומנו ${picked.size} מתוך ${SYMPTOMS.length}` : "עוד לא סומן דבר"}</span>
          </div>
        </div>

        <div className="stage">
          <div className="card meter">
            <div className="label">התמונה של החדר</div>
            {ELEMENT_KEYS.map(k => (
              <div className="meter-row" key={k} style={{ "--c": EL[k].c }}>
                <span className="meter-n">{EL[k].n}</span>
                <span className="meter-track">
                  <motion.span className="meter-fill" animate={{ width: `${(score[k] / 2) * 100}%` }} transition={{ type: "spring", stiffness: 140, damping: 20 }} />
                </span>
                <span className="mono meter-v">{score[k]}/2</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {top.length ? (
              <motion.div key={top.join()} className="card result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="label">ההמלצה</div>
                {top.length > 1 && <p className="muted">כמה אלמנטים חסרים באותה מידה. כדאי להתחיל באחד מהם.</p>}
                {top.map(k => {
                  const e = EL[k], feeder = EL[e.genBy];
                  return (
                    <div className="result-el" key={k} style={{ "--c": e.c }}>
                      <h3 className="h2" style={{ color: e.c }}>חסר {e.n}</h3>
                      <p>{e.space}</p>
                      <dl className="rows">
                        <div><dt>חומר</dt><dd>{e.m}</dd></div>
                        <div><dt>צורה</dt><dd>{e.sh}</dd></div>
                        <div><dt>צבע</dt><dd>{e.co}</dd></div>
                        <div><dt>חיזוק עקיף</dt><dd>{feeder.n}, שמזין את ה{e.n}: {feeder.m.split(",").slice(0, 2).join(",")}</dd></div>
                      </dl>
                      <button className="btn" onClick={() => go("elements", k)}>עוד על {e.n}</button>
                    </div>
                  );
                })}
                <p className="muted small">שינוי אחד בכל פעם. חיים איתו שבוע, וחוזרים לאבחון.</p>
              </motion.div>
            ) : (
              <motion.div key="none" className="card result empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="label">ההמלצה</div>
                <p>ההמלצה תופיע כאן אחרי שמסמנים לפחות תחושה אחת.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="notes">
        <Note kind="איך לקרוא">
          כל תחושה מקושרת לאלמנט אחד. כשכמה תחושות מצביעות על אותו אלמנט, סביר שהוא החסר. זה כלי התבוננות, לא מבחן.
        </Note>
        <Note kind="תובנה">
          לפעמים התחושה נובעת מעודף ולא מחוסר. חדר עמוס ומלא חפצים כבדים יכול להרגיש תקוע מעודף אדמה, ולא מחוסר מים. אם השינוי לא עזר, נסו לרסן במקום להוסיף.
        </Note>
      </div>
    </div>
  );
}
