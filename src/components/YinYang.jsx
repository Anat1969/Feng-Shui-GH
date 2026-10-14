import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHead, Note } from "./ui.jsx";

const YIN = ["לילה, שקט, קרירות", "פנימיות, קליטה", "ירח, מים, אדמה", "כיווץ, מנוחה", "חורף, צפון", "צל, רכות, נמוך"];
const YANG = ["יום, תנועה, חום", "חיצוניות, נתינה", "שמש, אש, שמיים", "התרחבות, פעולה", "קיץ, דרום", "אור, קשיחות, גבוה"];

const ROOMS = [
  { id: "bed", n: "חדר שינה", yang: 25, t: "רוב יין: תאורה עמומה וחמה, גוונים שקטים, טקסטיל רך, מעט מסכים. מעט יאנג נשאר דרך אור בוקר שנכנס." },
  { id: "living", n: "סלון", yang: 55, t: "איזון כמעט שווה: אור יום ותנועה במשך היום, תאורה נמוכה ומקומית בערב. הסלון משנה את האיזון לאורך היממה." },
  { id: "kitchen", n: "מטבח", yang: 65, t: "יאנג בשעות הפעילות: אור חזק על משטחי העבודה, משטחים נקיים. בלילה מכבים ומחזירים את המטבח למנוחה." },
  { id: "work", n: "חדר עבודה", yang: 75, t: "רוב יאנג: אור טבעי, שדה ראייה פתוח, צבעים בהירים. פינה אחת של יין (כורסה, צמח) מאפשרת עצירה." },
];

export default function YinYang() {
  const [room, setRoom] = useState(ROOMS[0]);

  return (
    <div className="page">
      <SectionHead
        id="yinyang"
        title="יין ויאנג"
        sub="שני כוחות שמחזיקים את המציאות. הם לא ניגודים אלא שני פנים של שלם אחד, וכל אחד נושא בתוכו את זרע האחר."
      />

      <div className="split">
        <div className="stage stage-yy">
          <YinYangSvg />
        </div>
        <div className="card panel">
          <h2 className="h2">האיזון שמניע את הכול</h2>
          <p>יין ויאנג נמצאים בתנועה מתמדת: כשאחד מגיע לשיא, הוא מתחיל להפוך לשני. לכן הנקודה הלבנה בתוך השחור, והשחורה בתוך הלבן.</p>
          <p>בפנג שואי המטרה אינה לבטל אחד לטובת השני, אלא לשמור על מתח פורה ביניהם. חדר שכולו יאנג מתיש, חדר שכולו יין מרדים.</p>
          <div className="duo">
            <div className="duo-col yin">
              <h3 className="h3">יין <span className="hz">陰</span></h3>
              <ul>{YIN.map(x => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className="duo-col yang">
              <h3 className="h3">יאנג <span className="hz">陽</span></h3>
              <ul>{YANG.map(x => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>

      <section className="block">
        <div className="block-head">
          <div className="label">כלי</div>
          <h2 className="h1">האיזון הנכון לכל חדר</h2>
          <p className="muted">בוחרים חדר ורואים לאיזה צד הוא צריך לנטות. אין חדר שהוא רק יין או רק יאנג.</p>
        </div>
        <div className="seg" role="tablist">
          {ROOMS.map(r => (
            <button key={r.id} className={`seg-btn${room.id === r.id ? " on" : ""}`} onClick={() => setRoom(r)}>{r.n}</button>
          ))}
        </div>
        <div className="card balance">
          <div className="balance-ends"><span>יין</span><span>יאנג</span></div>
          <div className="balance-bar">
            <motion.div className="balance-mark" animate={{ insetInlineStart: `${room.yang}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          </div>
          <div className="balance-num">
            <span>{100 - room.yang}% יין</span>
            <span>{room.yang}% יאנג</span>
          </div>
          <motion.p key={room.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="balance-text">{room.t}</motion.p>
        </div>
      </section>

      <div className="notes">
        <Note kind="איך לקרוא">
          עומדים בכניסה לחדר ושואלים: מה הוא אמור לאפשר, מנוחה או פעולה? אחר כך בודקים אור, צבע, חומר וצליל. כל אחד מהם נוטה לצד אחד.
        </Note>
        <Note kind="תובנה">
          האיזון משתנה לאורך היום. אותו סלון צריך יאנג בבוקר ויין בערב. תאורה בכמה שכבות (תקרה, מנורה, נר) היא הכלי הפשוט ביותר לשנות אותו.
        </Note>
        <Note kind="קריאה אדריכלית">
          זו אותה שפה של אור וצל, פתוח וסגור, גבוה ונמוך, שבה משתמשים אדריכלים כדי ליצור רצף של מרחבים. מעבר ממרחב נמוך וחשוך למרחב גבוה ומואר מורגש חזק יותר מכל אחד מהם לבד.
        </Note>
      </div>
    </div>
  );
}

function YinYangSvg() {
  return (
    <svg viewBox="0 0 300 300" className="yy-svg" aria-label="סמל יין ויאנג">
      <defs>
        <radialGradient id="yang" cx="38%" cy="35%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e2e2de" /></radialGradient>
        <radialGradient id="yin" cx="38%" cy="35%"><stop offset="0" stopColor="#3a3a3e" /><stop offset="1" stopColor="#111113" /></radialGradient>
        <filter id="yys" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="20" stdDeviation="16" floodOpacity="0.22" /></filter>
      </defs>
      <g filter="url(#yys)">
        <g className="spin">
          <circle cx="150" cy="150" r="130" fill="url(#yang)" />
          <path d="M150,20 A130,130 0 0,0 150,280 A65,65 0 0,0 150,150 A65,65 0 0,1 150,20Z" fill="url(#yin)" />
          <circle cx="150" cy="85" r="20" fill="url(#yin)" />
          <circle cx="150" cy="215" r="20" fill="url(#yang)" />
          <circle cx="150" cy="150" r="130" fill="none" stroke="#1b1b1d" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}
