import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EL } from "../data.js";
import { Note } from "./ui.jsx";
import { imageFromClipboard, imageFromDrop, toJpeg, blobToBase64, copyText } from "../lib/images.js";
import { analyzeImage, uploadImage, signedUrl, insertAnalysis, updateAnalysis, listAnalyses } from "../lib/supabase.js";

/* אזור קליטת תמונה: הדבקה, גרירה או קובץ */
function Drop({ url, onFile, label, act }) {
  const fileRef = useRef(null);
  return (
    <div className="drop-wrap">
      <div
        className={`paste-zone big${url ? " has-img" : ""}`}
        tabIndex={0}
        onPaste={e => { const f = imageFromClipboard(e); if (f) { e.preventDefault(); onFile(f); } }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); onFile(imageFromDrop(e)); }}
        data-act={act}
      >
        {url ? <img src={url} alt={label} /> : <span>{label}<br />מדביקים (Ctrl+V), גוררים לכאן או בוחרים קובץ</span>}
      </div>
      <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>בחירת קובץ</button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => onFile(e.target.files?.[0])} data-act={`${act}-file`} />
    </div>
  );
}

export default function ImageAnalysis() {
  const [before, setBefore] = useState(null);
  const [beforeUrl, setBeforeUrl] = useState("");
  const [after, setAfter] = useState(null);
  const [afterUrl, setAfterUrl] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { refreshHistory(); }, []);

  async function refreshHistory() {
    try {
      const rows = await listAnalyses();
      const withUrls = await Promise.all(rows.map(async r => ({
        ...r,
        beforeSrc: await signedUrl(r.before_path).catch(() => ""),
        afterSrc: await signedUrl(r.after_path).catch(() => ""),
      })));
      setHistory(withUrls);
    } catch { setHistory([]); }
  }

  function pickBefore(f) {
    if (!f) return setStatus("זו לא תמונה");
    setBefore(f); setBeforeUrl(URL.createObjectURL(f));
    setResult(null); setRecord(null); setAfter(null); setAfterUrl(""); setStatus("");
  }
  function pickAfter(f) {
    if (!f) return setStatus("זו לא תמונה");
    setAfter(f); setAfterUrl(URL.createObjectURL(f)); setStatus("תמונת ה'אחרי' מוכנה לשמירה");
  }

  async function run() {
    if (!before) return;
    setBusy(true); setStatus("מנתח את החדר. זה לוקח כחצי דקה...");
    try {
      const blob = await toJpeg(before, 1400, 0.85);
      const res = await analyzeImage(await blobToBase64(blob), "image/jpeg", note.trim() || undefined);
      setResult(res);
      setStatus("הניתוח מוכן");
      try {
        const path = await uploadImage(blob, "before");
        const row = await insertAnalysis({ before_path: path, result: res });
        setRecord(row);
        refreshHistory();
      } catch (e) { setStatus("הניתוח מוכן, אבל השמירה נכשלה: " + (e.message || e)); }
    } catch (e) {
      setStatus("הניתוח נכשל: " + (e.message || e));
    } finally { setBusy(false); }
  }

  async function saveAfter() {
    if (!after || !record) return;
    setBusy(true); setStatus("שומר...");
    try {
      const path = await uploadImage(await toJpeg(after), "after");
      await updateAnalysis(record.id, { after_path: path });
      setRecord({ ...record, after_path: path });
      setAfter(null);
      setStatus("נשמר. אפשר להשוות לפני ואחרי");
      refreshHistory();
    } catch (e) { setStatus("השמירה נכשלה: " + (e.message || e)); }
    finally { setBusy(false); }
  }

  function open(h) {
    setResult(h.result); setRecord(h);
    setBefore(null); setBeforeUrl(h.beforeSrc); setAfter(null); setAfterUrl(h.afterSrc);
    setStatus(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setBefore(null); setBeforeUrl(""); setAfter(null); setAfterUrl(""); setResult(null); setRecord(null); setNote(""); setStatus("");
  }

  const chip = k => EL[k] ? <span key={k} className="el-tag" style={{ "--c": EL[k].c }}>{EL[k].n}</span> : null;

  return (
    <div className="page">
      <header className="sec-head">
        <div className="eyebrow">05+<span>ניתוח תמונה בעזרת Claude</span></div>
        <h1 className="display">ניתוח תמונה</h1>
        <p className="lede">מעלים תמונה של חדר אמיתי. הניתוח מזהה אילו אלמנטים נוכחים ואילו חסרים, מציע שלושה תיקונים ופרומפט למרחב המשודרג. אחרי השינוי מדביקים תמונה חדשה ומשווים.</p>
      </header>

      <div className="split">
        <div className="card panel">
          <div className="label">01 · תמונת החדר</div>
          <Drop url={beforeUrl} onFile={pickBefore} label="תמונת ה'לפני'" act="before" />
          <label className="field">
            <span className="label">מה מפריע לכם בחדר? (לא חובה)</span>
            <input value={note} onChange={e => setNote(e.target.value)} maxLength={300} placeholder="למשל: קשה להירדם, החדר מרגיש צפוף" />
          </label>
          <div className="row-btns">
            <button className="btn btn-dark" onClick={run} disabled={!before || busy} data-act="analyze">ניתוח התמונה</button>
            {(beforeUrl || result) && <button className="btn" onClick={reset} disabled={busy}>התחלה מחדש</button>}
          </div>
          <p className="muted small" role="status">{status}</p>
        </div>

        <div className="stage">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key={record?.id || "r"} className="card result analysis" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="label">02 · אבחון קצר</div>
                <h2 className="h2">{result.room_type}</h2>
                <p className="panel-lead">{result.insight}</p>
                <dl className="rows">
                  <div><dt>נוכחים</dt><dd className="tags">{(result.elements_present || []).map(chip)}</dd></div>
                  <div><dt>חסרים</dt><dd className="tags">{(result.elements_missing || []).map(chip)}</dd></div>
                </dl>
                {result.imbalances?.length > 0 && (
                  <ul className="imb">{result.imbalances.map((x, i) => <li key={i}>{x}</li>)}</ul>
                )}
                <div className="label">03 · שלושה תיקונים</div>
                <ol className="fixes">{(result.top3_fixes || []).map((x, i) => <li key={i}><span className="fix-n">{i + 1}</span><span>{x}</span></li>)}</ol>
                <div className="label">04 · פרומפט משודרג</div>
                <p className="prompt-text">{result.upgraded_prompt}</p>
                <button className="btn btn-dark btn-sm" onClick={async () => setStatus((await copyText(result.upgraded_prompt)) ? "הפרומפט הועתק" : "ההעתקה נכשלה")} data-act="copy-upgraded">העתקת פרומפט</button>
              </motion.div>
            ) : (
              <motion.div key="empty" className="card result empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="label">איך זה עובד</div>
                <ol className="howlist">
                  <li>מצלמים את החדר מהכניסה, באור יום, כך שרואים את רוב החדר.</li>
                  <li>מדביקים את התמונה ולוחצים "ניתוח התמונה".</li>
                  <li>מבצעים תיקון אחד או שלושה, ומצלמים שוב מאותה נקודה.</li>
                  <li>מדביקים את התמונה החדשה ומשווים לפני ואחרי.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {result && (
        <section className="block">
          <div className="block-head">
            <div className="label">05 · לפני ואחרי</div>
            <h2 className="h1">השוואה</h2>
            <p className="muted">מצלמים מאותה נקודה ובאותה שעה ביום, כדי שההבדל יהיה בחדר ולא באור.</p>
          </div>
          <div className="compare">
            <figure className="card">
              <div className="label">לפני</div>
              {beforeUrl ? <img src={beforeUrl} alt="לפני" /> : <div className="paste-zone big" />}
            </figure>
            <figure className="card">
              <div className="label">אחרי</div>
              <Drop url={afterUrl} onFile={pickAfter} label="תמונת ה'אחרי'" act="after" />
              <div className="row-btns">
                <button className="btn btn-dark btn-sm" onClick={saveAfter} disabled={!after || !record || busy} data-act="save-after">שמירת תמונת אחרי</button>
              </div>
            </figure>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="block">
          <div className="block-head">
            <div className="label">שמור במכשיר הזה</div>
            <h2 className="h1">ניתוחים קודמים</h2>
          </div>
          <div className="history">
            {history.map(h => (
              <button key={h.id} className="card hist" onClick={() => open(h)} data-hist={h.id}>
                <span className="hist-imgs">
                  {h.beforeSrc ? <img src={h.beforeSrc} alt="לפני" /> : <span />}
                  {h.afterSrc ? <img src={h.afterSrc} alt="אחרי" /> : <span className="hist-none">אין עדיין אחרי</span>}
                </span>
                <span className="h3">{h.result?.room_type}</span>
                <span className="muted small">{h.result?.insight}</span>
                <span className="mono">{new Date(h.created_at).toLocaleDateString("he-IL")}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="notes">
        <Note kind="איך לקרוא">
          "נוכחים" ו"חסרים" מבוססים רק על מה שרואים בתמונה: חומר, צבע, צורה ואור. מה שמחוץ לפריים לא נספר.
        </Note>
        <Note kind="תובנה">
          התיקון הראשון כמעט תמיד הוא פינוי או אור, לא קנייה. כדאי לבצע אותו קודם ולצלם שוב לפני שמוסיפים חפצים.
        </Note>
        <Note kind="פרטיות">
          התמונות נשמרות בתיקייה פרטית ונגישות רק מהמכשיר הזה. הן נשלחות ל-Claude לצורך הניתוח בלבד.
        </Note>
      </div>
    </div>
  );
}
