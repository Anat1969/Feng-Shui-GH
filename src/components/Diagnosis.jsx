import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SYMPTOMS, EL, ELEMENT_KEYS } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note } from "./ui.jsx";
import VisualCard, { visualPath } from "./VisualCard.jsx";
import { buildVisualPrompt } from "../lib/visualPrompt.js";
import { listDiagnoses, insertDiagnosis, signedUrl } from "../lib/supabase.js";

const EL_BAGUA = { fire: "south", earth: "center", metal: "west", water: "north", wood: "east" };
const EL_LIGHT = {
  fire: "אור יום חם ונוכח, ועוד שכבת תאורה חמה בגובה העיניים",
  earth: "אור רך ומפוזר, בלי פינות חשוכות",
  metal: "אור אחיד ובהיר, משטחים פנויים שמחזירים אותו",
  water: "אור עמום ורך, השתקפויות על משטח כהה",
  wood: "אור בוקר טבעי שנכנס עמוק לחדר ונופל על צמחים",
};

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

  /* ספריית האבחונים: כל אבחון שנשמר, עם תמונה, הסבר ותובנה */
  const [library, setLibrary] = useState([]);
  const [libStatus, setLibStatus] = useState("");
  const [savedFor, setSavedFor] = useState(new Set());
  const key = [...picked].sort().join(".");

  useEffect(() => { refreshLibrary(); }, []);
  useEffect(() => { setLibStatus(""); }, [key]);

  async function refreshLibrary() {
    try {
      const rows = await listDiagnoses();
      setLibrary(await Promise.all(rows.map(async r => ({ ...r, src: await signedUrl(r.image_path).catch(() => "") }))));
    } catch { setLibrary([]); }
  }

  const k0 = top[0];
  const vdata = k0 && { room: "חדר מגורים אחרי התיקון", element: k0, bagua: EL_BAGUA[k0], light: EL_LIGHT[k0], chi: "flow" };
  const entry = k0 && (() => {
    const e = EL[k0];
    const felt = SYMPTOMS.filter(x => picked.has(x.id)).map(x => x.t);
    const { insight, prompt } = buildVisualPrompt(vdata);
    return {
      symptoms: [...picked].sort(),
      element: k0,
      title: `חסר ${e.n}`,
      explanation: `מה הורגש: ${felt.join("; ")}. ${e.space} השינוי הראשון: ${e.m.split(",")[0].trim()}, בצורה ${e.sh.split(",")[0].trim()}, בצבע ${e.co.split(",")[0].trim()}.`,
      insight,
      prompt,
    };
  })();

  async function saveToLibrary(imagePath) {
    if (!entry) return;
    const image_path = imagePath ?? visualPath(`diagnosis:${k0}`);
    if (!image_path) { setLibStatus("לאבחון בספרייה צריך תמונה: הופכים את הכרטיס, מעתיקים את הפרומפט, מדביקים את התמונה ושומרים. האבחון נכנס לספרייה יחד איתה."); return; }
    setLibStatus("שומר לספרייה...");
    try {
      await insertDiagnosis({ ...entry, image_path });
      setSavedFor(prev => new Set(prev).add(key));
      setLibStatus("האבחון נשמר בספרייה");
      refreshLibrary();
    } catch (err) { setLibStatus("השמירה לספרייה נכשלה: " + (err.message || err)); }
  }

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
                <div className="label">המרחב המתוקן</div>
                <VisualCard
                  vkey={`diagnosis:${k0}`}
                  title={`החדר עם ${EL[k0].n}`}
                  tone={EL[k0].c}
                  data={vdata}
                  onSaved={row => saveToLibrary(row.image_path)}
                />
                <div className="row-btns lib-save">
                  <button className="btn btn-dark" onClick={() => saveToLibrary()} disabled={savedFor.has(key)} data-act="save-diagnosis">
                    {savedFor.has(key) ? "האבחון בספרייה" : "שמירת האבחון לספרייה"}
                  </button>
                  <span className="muted small" role="status">{libStatus || "שמירת תמונה בכרטיס שומרת גם את האבחון בספרייה"}</span>
                </div>
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

      <section className="block" id="library">
        <div className="block-head">
          <div className="label">ספרייה · {library.length}</div>
          <h2 className="h1">ספריית האבחונים</h2>
          <p className="muted">כל אבחון שנשמר: התמונה של המרחב המתוקן, מה הורגש בחדר, והתובנה. הספרייה משותפת לכל המכשירים. לחיצה על "פתיחת האבחון" מחזירה את הסימונים שלו.</p>
        </div>
        {library.length ? (
          <div className="library">
            {library.map(d => {
              const e = EL[d.element] || EL.earth;
              return (
                <article key={d.id} className="card lib-card" style={{ "--c": e.c }} data-diag={d.id}>
                  <div className="lib-media">{d.src ? <img src={d.src} alt={d.title} loading="lazy" /> : <span className="label">אין תמונה</span>}</div>
                  <div className="lib-body">
                    <div className="lib-meta"><span className="el-tag" style={{ "--c": e.c }}>{e.n}</span><span className="mono">{new Date(d.created_at).toLocaleDateString("he-IL")}</span></div>
                    <h3 className="h3">{d.title}</h3>
                    <p className="lib-insight">{d.insight}</p>
                    <p className="lib-expl">{d.explanation}</p>
                    <button className="btn btn-sm" onClick={() => { go("diagnosis", (d.symptoms || []).join(".")); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-act="open-diagnosis">פתיחת האבחון</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card empty"><p className="muted">הספרייה עדיין ריקה. מסמנים תחושות, ושומרים את האבחון או את התמונה של המרחב המתוקן.</p></div>
        )}
      </section>

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
