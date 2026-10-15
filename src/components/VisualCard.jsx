import { useEffect, useRef, useState } from "react";
import { buildVisualPrompt } from "../lib/visualPrompt.js";
import { imageFromClipboard, imageFromDrop, toJpeg, copyText } from "../lib/images.js";
import { loadVisuals, saveVisual, uploadImage, signedUrl } from "../lib/supabase.js";

/* מאגר משותף לכל הכרטיסים: נטען פעם אחת מ-fs_room_visuals. התמונות משותפות לכל המבקרים. */
let cache = null;
let pending = null;
function useVisuals() {
  const [rows, setRows] = useState(cache);
  const [error, setError] = useState("");
  useEffect(() => {
    if (cache) return;
    pending = pending || loadVisuals();
    pending.then(r => { cache = r; setRows(r); }).catch(e => { pending = null; setError(e.message || "טעינה נכשלה"); setRows({}); });
  }, []);
  const put = (key, row) => { cache = { ...(cache || {}), [key]: row }; setRows(cache); };
  return { rows, put, error };
}

/* הנתיב של התמונה השמורה למפתח, אם נטענה */
export const visualPath = key => cache?.[key]?.image_path || null;

/*
  כרטיס המחשה: בחזית שם, תובנה ותמונה. לחיצה הופכת.
  מאחור: הפרומפט, העתקה, הדבקת תמונה (Ctrl+V, גרירה או קובץ) ושמירה.
*/
export default function VisualCard({ vkey, title, data, tone, onSaved }) {
  const { insight, prompt } = buildVisualPrompt(data);
  const { rows, put, error: loadError } = useVisuals();
  const saved = rows?.[vkey];
  const [flipped, setFlipped] = useState(false);
  const [img, setImg] = useState("");
  const [draft, setDraft] = useState(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const zone = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let live = true;
    if (saved?.image_path) signedUrl(saved.image_path).then(u => live && setImg(u)).catch(() => {});
    else setImg("");
    return () => { live = false; };
  }, [saved?.image_path]);

  useEffect(() => { if (flipped) setTimeout(() => zone.current?.focus({ preventScroll: true }), 350); }, [flipped]);
  useEffect(() => () => draftUrl && URL.revokeObjectURL(draftUrl), [draftUrl]);

  function take(file) {
    if (!file) { setStatus("זו לא תמונה. אפשר להדביק, לגרור או לבחור קובץ תמונה."); return; }
    if (draftUrl) URL.revokeObjectURL(draftUrl);
    setDraft(file); setDraftUrl(URL.createObjectURL(file)); setStatus("התמונה מוכנה לשמירה");
  }

  async function copy() {
    setStatus((await copyText(prompt)) ? "הפרומפט הועתק" : "ההעתקה נכשלה");
  }

  async function save() {
    if (!draft) return;
    setBusy(true); setStatus("שומר...");
    try {
      const blob = await toJpeg(draft);
      const path = await uploadImage(blob, "visuals", vkey);
      const row = { visual_key: vkey, prompt, insight, image_path: path };
      await saveVisual(row);
      /* התמונה הקודמת לא נמחקת: ספריית האבחונים עשויה להצביע עליה */
      put(vkey, row);
      setDraft(null); setDraftUrl("");
      setStatus("נשמר");
      if (onSaved) await onSaved(row);
      setFlipped(false);
    } catch (e) {
      setStatus("השמירה נכשלה: " + (e.message || e));
    } finally { setBusy(false); }
  }

  return (
    <div className={`flip${flipped ? " is-flipped" : ""}`} style={tone ? { "--c": tone } : undefined} data-vkey={vkey}>
      <div className="flip-inner">
        <button className="flip-face flip-front" onClick={() => setFlipped(true)} aria-label={`${title}: הפיכת הכרטיס`} tabIndex={flipped ? -1 : 0}>
          <span className="flip-media">
            {img ? <img src={img} alt={title} /> : <span className="flip-empty"><span className="label">עדיין אין תמונה</span><span>הופכים את הכרטיס, מעתיקים את הפרומפט, ומדביקים מאחור את התמונה שנוצרה</span></span>}
          </span>
          <span className="flip-text">
            <span className="h3">{title}</span>
            <span className="flip-insight">{insight}</span>
            <span className="label flip-hint">לחיצה הופכת את הכרטיס</span>
          </span>
        </button>

        <div className="flip-face flip-back" aria-hidden={!flipped}>
          <div className="flip-back-head">
            <span className="label">פרומפט להמחשה · {title}</span>
            <button className="btn btn-sm" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1}>חזרה לחזית</button>
          </div>
          <p className="prompt-text" dir="rtl">{prompt}</p>
          <div className="row-btns">
            <button className="btn btn-dark btn-sm" onClick={copy} tabIndex={flipped ? 0 : -1} data-act="copy-prompt">העתקת פרומפט</button>
            <button className="btn btn-sm" onClick={() => fileRef.current?.click()} tabIndex={flipped ? 0 : -1}>בחירת קובץ</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => take(e.target.files?.[0])} data-act="file" />
          </div>
          <div
            ref={zone}
            className={`paste-zone${draftUrl ? " has-img" : ""}`}
            tabIndex={flipped ? 0 : -1}
            onPaste={e => { const f = imageFromClipboard(e); if (f) { e.preventDefault(); take(f); } }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); take(imageFromDrop(e)); }}
            data-act="paste"
          >
            {draftUrl ? <img src={draftUrl} alt="תצוגה מקדימה" /> : <span>מדביקים כאן תמונה (Ctrl+V) או גוררים אותה לכאן</span>}
          </div>
          <div className="row-btns">
            <button className="btn btn-dark btn-sm" onClick={save} disabled={!draft || busy} tabIndex={flipped ? 0 : -1} data-act="save">שמירה</button>
            <span className="muted small" role="status">{status || loadError}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
