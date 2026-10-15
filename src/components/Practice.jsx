import { motion } from "framer-motion";
import { ROOMS, EL, ELEMENT_KEYS } from "../data.js";
import { go } from "../router.js";
import { SectionHead, Note, ElTag } from "./ui.jsx";
import VisualCard from "./VisualCard.jsx";
import BedGame from "./BedGame.jsx";



export default function Practice() {
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
          <div className="label">המחשה</div>
          <h2 className="h1">איך החדר יכול להיראות</h2>
          <p className="muted">לכל חדר פרומפט שנבנה מהיסוד, החומרים, האור ואזור הבאגואה שלו. הופכים את הכרטיס, מעתיקים את הפרומפט למחולל תמונות, ומדביקים את התמונה בחזרה. התמונה נשמרת במכשיר הזה.</p>
        </div>
        <div className="visuals">
          {ROOMS.map(r => (
            <VisualCard
              key={r.id}
              vkey={`room:${r.id}`}
              title={r.title}
              tone={EL[r.els[0]].c}
              data={{ room: r.title, element: r.els[0], bagua: r.bagua, light: r.light, chi: r.chi }}
            />
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <div className="label">כלי</div>
          <h2 className="h1">עמדת השליטה</h2>
          <p className="muted">העיקרון החשוב ביותר בפנג שואי, למיטה, לשולחן ולכיריים. משחק חם / קר: גוררים את המיטה בתוכנית, והצבע מראה כמה המיקום מתאים, מאדום (גרוע) לירוק (עמדת שליטה).</p>
        </div>
        <BedGame />
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
