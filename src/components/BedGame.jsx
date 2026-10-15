import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/*
  משחק "חם / קר" למיקום המיטה.
  גוררים את המיטה (או מזיזים בחיצי המקלדת). היא נצמדת לקיר הקרוב, ראש המיטה אל הקיר.
  הציון מחושב מחמישה עקרונות: קו מבט אל הדלת, לא בקו הדלת, לא מתחת לחלון, לא בתנועת הדלת, ומרחק מהכניסה.
  הצבע עובר ברצף מאדום (גרוע) לירוק (עמדת שליטה).
*/

const R = { x0: 30, y0: 30, x1: 370, y1: 330 };          // פנים החדר
const DOOR = { x0: 60, x1: 140, y: R.y0 };                  // פתח בקיר העליון, ציר ב-x0
const WIN = { y0: 120, y1: 220, x: R.x1 };                  // חלון בקיר הימני
const BW = 70, BL = 96;                                      // רוחב ואורך המיטה
const D = { x: (DOOR.x0 + DOOR.x1) / 2, y: DOOR.y };
const MAXD = Math.hypot(R.x1 - R.x0, R.y1 - R.y0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

/* ממרכז חופשי לקיר, מלבן ונקודת כרית */
export function placeBed(cx, cy) {
  const d = { top: cy - R.y0, bottom: R.y1 - cy, left: cx - R.x0, right: R.x1 - cx };
  const wall = Object.entries(d).sort((a, b) => a[1] - b[1])[0][0];
  let rect, pillow, face;
  if (wall === "top" || wall === "bottom") {
    const x = clamp(cx, R.x0 + BW / 2, R.x1 - BW / 2);
    const y0 = wall === "top" ? R.y0 : R.y1 - BL;
    rect = { x: x - BW / 2, y: y0, w: BW, h: BL };
    pillow = { x, y: wall === "top" ? R.y0 + 14 : R.y1 - 14 };
    face = { x: 0, y: wall === "top" ? 1 : -1 };
  } else {
    const y = clamp(cy, R.y0 + BW / 2, R.y1 - BW / 2);
    const x0 = wall === "left" ? R.x0 : R.x1 - BL;
    rect = { x: x0, y: y - BW / 2, w: BL, h: BW };
    pillow = { x: wall === "left" ? R.x0 + 14 : R.x1 - 14, y };
    face = { x: wall === "left" ? 1 : -1, y: 0 };
  }
  return { wall, rect, pillow, face };
}

export function scoreBed(b) {
  const vx = D.x - b.pillow.x, vy = D.y - b.pillow.y, len = Math.hypot(vx, vy) || 1;
  const dot = (vx * b.face.x + vy * b.face.y) / len;
  const see = b.wall === "top" ? 0 : clamp((dot + 0.2) / 1.2, 0, 1);
  const inLine = (b.wall === "bottom" || b.wall === "top") ? overlap(b.rect.x, b.rect.x + b.rect.w, DOOR.x0, DOOR.x1) / BW : 0;
  const underWin = b.wall === "right" ? overlap(b.rect.y, b.rect.y + b.rect.h, WIN.y0, WIN.y1) / BW : 0;
  const nx = clamp(DOOR.x0, b.rect.x, b.rect.x + b.rect.w), ny = clamp(DOOR.y, b.rect.y, b.rect.y + b.rect.h);
  const inSwing = Math.hypot(nx - DOOR.x0, ny - DOOR.y) < DOOR.x1 - DOOR.x0 + 6 ? 1 : 0;
  const dist = len / MAXD;
  const raw = 0.5 * see + 0.5 * dist - 0.7 * Math.min(1, inLine * 1.4) - 0.6 * Math.min(1, underWin * 1.4) - 0.8 * inSwing;
  const score = clamp(raw / 0.85, 0, 1);
  return {
    score,
    checks: [
      { ok: see > 0.6, t: see > 0.6 ? "רואה את הדלת מהמיטה" : b.wall === "top" ? "הדלת מאחורי הראש" : "הדלת מחוץ לשדה הראייה" },
      { ok: inLine < 0.15, t: inLine < 0.15 ? "לא בקו ישר מול הדלת" : "בקו ישר מול הדלת" },
      { ok: underWin < 0.15, t: underWin < 0.15 ? "הראש צמוד לקיר מלא" : "הראש מתחת לחלון" },
      { ok: !inSwing, t: inSwing ? "חוסם את תנועת הדלת" : "לא חוסם את תנועת הדלת" },
      { ok: dist > 0.6, t: dist > 0.6 ? "רחוק מהכניסה, באלכסון" : "קרוב מדי לכניסה" },
    ],
  };
}

export const heat = s => `hsl(${Math.round(s * 130)}, 62%, ${44 - s * 6}%)`;
const heatSoft = s => `hsl(${Math.round(s * 130)}, 70%, 92%)`;

function verdict(s) {
  if (s >= 0.8) return ["רותח", "עמדת שליטה: מבט על הדלת, גב מוגן, רחוק מהתנועה."];
  if (s >= 0.6) return ["חם", "כמעט שם. עוד הזזה קטנה אל האלכסון מהדלת."];
  if (s >= 0.4) return ["פושר", "מיקום סביר, אבל משהו חסר: מבט, מרחק או קיר מלא."];
  if (s >= 0.2) return ["קר", "המיקום מפריע למנוחה. חפשו את הפינה הרחוקה מהדלת."];
  return ["קפוא", "המיקום הקשה ביותר: בקו הדלת או בלי מבט אליה."];
}

const PRESETS = [
  { n: "עמדת שליטה", x: 300, y: 300 },
  { n: "בקו הדלת", x: 100, y: 300 },
  { n: "על קיר הדלת", x: 260, y: 60 },
  { n: "מתחת לחלון", x: 345, y: 170 },
];

export default function BedGame() {
  const svg = useRef(null);
  const [pos, setPos] = useState({ x: 100, y: 300 });
  const [drag, setDrag] = useState(false);
  const [showHeat, setShowHeat] = useState(false);
  const bed = placeBed(pos.x, pos.y);
  const { score, checks } = scoreBed(bed);
  const [word, tip] = verdict(score);
  const col = heat(score);

  const grid = useMemo(() => {
    const cells = [];
    for (let x = R.x0 + 10; x < R.x1; x += 20) for (let y = R.y0 + 10; y < R.y1; y += 20) {
      cells.push({ x, y, s: scoreBed(placeBed(x, y)).score });
    }
    return cells;
  }, []);

  function toSvg(e) {
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.current.getScreenCTM().inverse());
    return { x: clamp(p.x, R.x0, R.x1), y: clamp(p.y, R.y0, R.y1) };
  }
  const down = e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); };
  const move = e => { if (drag) setPos(toSvg(e)); };
  const up = () => setDrag(false);
  const key = e => {
    const step = e.shiftKey ? 30 : 12;
    const m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (m) { e.preventDefault(); setPos(p => ({ x: clamp(p.x + m[0], R.x0, R.x1), y: clamp(p.y + m[1], R.y0, R.y1) })); }
  };

  const r = bed.rect;
  const horiz = bed.wall === "top" || bed.wall === "bottom";
  const pillowRect = horiz
    ? { x: r.x + 8, y: bed.wall === "top" ? r.y + 6 : r.y + r.h - 22, w: r.w - 16, h: 16 }
    : { x: bed.wall === "left" ? r.x + 6 : r.x + r.w - 22, y: r.y + 8, w: 16, h: r.h - 16 };

  return (
    <div className="bedgame">
      <div className="card plan-card bed-board" style={{ "--heat": col }}>
        <svg
          ref={svg}
          viewBox="0 0 400 360"
          className={`plan bed-plan${drag ? " dragging" : ""}`}
          onPointerDown={e => { down(e); setPos(toSvg(e)); }}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          role="application"
          aria-label="תוכנית חדר שינה. גררו את המיטה או הזיזו אותה בחיצים."
        >
          <defs>
            <pattern id="bhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#1b1b1d" strokeWidth="1.4" />
            </pattern>
            <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbfbf9" /><stop offset="1" stopColor="#eeeeea" />
            </linearGradient>
            <filter id="bedsh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity=".25" /></filter>
            <radialGradient id="glow"><stop offset="0" stopColor={col} stopOpacity=".35" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
          </defs>

          <rect x={R.x0} y={R.y0} width={R.x1 - R.x0} height={R.y1 - R.y0} fill="url(#floor)" />
          {showHeat && grid.map((c, i) => <rect key={i} x={c.x - 10} y={c.y - 10} width="20" height="20" fill={heat(c.s)} opacity=".22" />)}

          {/* קירות */}
          <path d={`M${R.x0},${R.y0} H${DOOR.x0} M${DOOR.x1},${R.y0} H${R.x1} V${WIN.y0} M${R.x1},${WIN.y1} V${R.y1} H${R.x0} V${R.y0}`} fill="none" stroke="url(#bhatch)" strokeWidth="12" />
          <path d={`M${R.x0 - 6},${R.y0 - 6} H${DOOR.x0} M${DOOR.x1},${R.y0 - 6} H${R.x1 + 6} V${WIN.y0} M${R.x1 + 6},${WIN.y1} V${R.y1 + 6} H${R.x0 - 6} V${R.y0 - 6}`} fill="none" stroke="#1b1b1d" strokeWidth="1" />
          {/* דלת */}
          <path d={`M${DOOR.x1},${R.y0} A${DOOR.x1 - DOOR.x0},${DOOR.x1 - DOOR.x0} 0 0,1 ${DOOR.x0},${R.y0 + DOOR.x1 - DOOR.x0}`} fill="none" stroke="#9a9a96" strokeDasharray="3 4" />
          <line x1={DOOR.x0} y1={R.y0} x2={DOOR.x0} y2={R.y0 + DOOR.x1 - DOOR.x0} stroke="#1b1b1d" strokeWidth="2.5" />
          <text x={D.x} y={R.y0 - 12} textAnchor="middle" className="plan-t">דלת</text>
          {/* חלון */}
          <line x1={R.x1 - 3} y1={WIN.y0} x2={R.x1 - 3} y2={WIN.y1} stroke="#1b1b1d" strokeWidth="1" />
          <line x1={R.x1 + 3} y1={WIN.y0} x2={R.x1 + 3} y2={WIN.y1} stroke="#1b1b1d" strokeWidth="1" />
          <line x1={R.x1} y1={WIN.y0} x2={R.x1} y2={WIN.y1} stroke="#bcd" strokeWidth="2" />
          <text x={R.x1 + 18} y={(WIN.y0 + WIN.y1) / 2} textAnchor="middle" className="plan-t" transform={`rotate(90 ${R.x1 + 18} ${(WIN.y0 + WIN.y1) / 2})`}>חלון</text>

          {/* קו המבט מהכרית אל הדלת */}
          <line x1={bed.pillow.x} y1={bed.pillow.y} x2={D.x} y2={D.y + 4} stroke={col} strokeWidth="1.6" strokeDasharray="5 5" />
          <circle cx={bed.pillow.x} cy={bed.pillow.y} r="46" fill="url(#glow)" />

          {/* המיטה */}
          <g
            className="bed"
            tabIndex={0}
            role="slider"
            aria-label={`מיטה. התאמה ${Math.round(score * 100)} מתוך 100, ${word}`}
            aria-valuenow={Math.round(score * 100)} aria-valuemin={0} aria-valuemax={100}
            onKeyDown={key}
            data-act="bed"
          >
            <rect className="bed-body" filter="url(#bedsh)" rx="6" stroke={col} strokeWidth="2.5" fill={heatSoft(score)} x={r.x} y={r.y} width={r.w} height={r.h} />
            <rect className="bed-body" rx="4" fill="#fff" stroke={col} strokeWidth="1.2" x={pillowRect.x} y={pillowRect.y} width={pillowRect.w} height={pillowRect.h} />
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 5} textAnchor="middle" className="bed-score" fill={col}>{Math.round(score * 100)}</text>
          </g>
        </svg>
        <div className="heat-bar" aria-hidden="true"><span style={{ left: `${score * 100}%` }} /></div>
        <div className="heat-ends mono"><span>קר</span><span>חם</span></div>
      </div>

      <div className="card panel bed-panel" style={{ "--heat": col }}>
        <div className="label">חם / קר</div>
        <div className="bed-verdict">
          <motion.span key={word} className="bed-word" style={{ color: col }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{word}</motion.span>
          <span className="bed-num mono">{Math.round(score * 100)}/100</span>
        </div>
        <p>{tip}</p>
        <ul className="bed-checks">
          {checks.map(c => <li key={c.t} className={c.ok ? "ok" : "no"}><span className="dot" />{c.t}</li>)}
        </ul>
        <div className="chips">
          {PRESETS.map(p => <button key={p.n} className="chip" onClick={() => setPos({ x: p.x, y: p.y })}>{p.n}</button>)}
        </div>
        <div className="row-btns">
          <button className={`btn btn-sm${showHeat ? " btn-dark" : ""}`} onClick={() => setShowHeat(h => !h)} data-act="heat">{showHeat ? "הסתרת מפת החום" : "הצגת מפת החום"}</button>
        </div>
        <p className="muted small">גוררים את המיטה בתוכנית, או לוחצים עליה ומזיזים בחיצים. אם אי אפשר להזיז את המיטה, מראה קטנה שמשקפת את הדלת מחזירה את קו המבט.</p>
      </div>
    </div>
  );
}
