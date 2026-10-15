/*
  רקע שקוף לכל משבצת בבאגואה: הדימוי של הטריגרם, כדי לזכור את הקשר בין הכיוון לנושא.
  קווים בלבד, בצבע האלמנט ובשקיפות נמוכה, מתחת לטקסט.
*/
const ART = {
  // צפון, קאן, מים זורמים: קריירה כזרם
  north: (
    <g>
      {[30, 44, 58, 72].map((y, i) => (
        <path key={y} d={`M-5,${y} C15,${y - 9} 30,${y + 9} 50,${y} S85,${y - 9} 105,${y}`} strokeWidth={i % 2 ? 1.2 : 2} />
      ))}
    </g>
  ),
  // צפון־מזרח, גן, הר: ידע ועצירה
  ne: (
    <g>
      <path d="M-5,88 L30,38 L48,60 L66,30 L105,88" strokeWidth="2" />
      <path d="M10,88 L30,60 L42,74" strokeWidth="1.2" />
      <path d="M58,52 L66,42 L74,52" strokeWidth="1.2" />
      <line x1="-5" y1="88" x2="105" y2="88" strokeWidth="1" />
    </g>
  ),
  // מזרח, ג׳ן, רעם: צמיחה פתאומית, משפחה כעץ
  east: (
    <g>
      <path d="M50,95 L50,30" strokeWidth="2.2" />
      <path d="M50,62 C38,56 30,48 26,36 M50,52 C62,46 70,38 74,26 M50,40 C44,34 42,28 42,20" strokeWidth="1.5" />
      <path d="M78,8 L68,24 L76,26 L66,42" strokeWidth="1.2" />
    </g>
  ),
  // דרום־מזרח, שוּן, רוח: שפע שנע ומתפזר
  se: (
    <g>
      <path d="M-5,40 C25,30 50,48 75,38 C88,33 92,24 84,20 C76,16 70,26 78,30" strokeWidth="1.8" />
      <path d="M-5,60 C30,52 55,68 105,56" strokeWidth="1.2" />
      <path d="M10,78 C35,72 60,84 95,74" strokeWidth="1" />
      <ellipse cx="30" cy="24" rx="6" ry="3" transform="rotate(-30 30 24)" strokeWidth="1.2" />
      <ellipse cx="62" cy="70" rx="6" ry="3" transform="rotate(20 62 70)" strokeWidth="1.2" />
    </g>
  ),
  // דרום, לי, אש: אור שמקרין, מוניטין
  south: (
    <g>
      <circle cx="50" cy="56" r="14" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6, r1 = 22, r2 = i % 2 ? 32 : 40;
        return <line key={i} x1={50 + r1 * Math.cos(a)} y1={56 + r1 * Math.sin(a)} x2={50 + r2 * Math.cos(a)} y2={56 + r2 * Math.sin(a)} strokeWidth="1.4" />;
      })}
    </g>
  ),
  // דרום־מערב, קוּן, אדמה קולטת: זוגיות, שניים על קרקע משותפת
  sw: (
    <g>
      <circle cx="40" cy="48" r="17" strokeWidth="1.8" />
      <circle cx="60" cy="48" r="17" strokeWidth="1.8" />
      {[76, 84, 92].map(y => <line key={y} x1="-5" y1={y} x2="105" y2={y} strokeWidth="1" />)}
    </g>
  ),
  // מערב, דוּאִי, אגם: יצירה, מעגלים שמתפשטים
  west: (
    <g>
      {[8, 18, 28, 38].map((r, i) => <ellipse key={r} cx="50" cy="56" rx={r * 1.2} ry={r * 0.55} strokeWidth={i ? 1.2 : 2} />)}
      <circle cx="74" cy="26" r="4" strokeWidth="1.2" />
      <circle cx="26" cy="30" r="2.5" strokeWidth="1.2" />
    </g>
  ),
  // צפון־מערב, צ׳יֵין, שמיים: אנשים תומכים ומסעות
  nw: (
    <g>
      <path d="M-5,70 A60,60 0 0,1 105,70" strokeWidth="1.8" />
      <path d="M10,70 A45,45 0 0,1 90,70" strokeWidth="1.2" />
      <path d="M22,36 C22,28 34,28 36,34 C38,26 52,26 52,36 C58,36 58,44 52,44 L26,44 C18,44 18,36 22,36 Z" strokeWidth="1.2" />
      <path d="M50,96 C54,86 60,82 70,80" strokeWidth="1" strokeDasharray="3 3" />
    </g>
  ),
  // מרכז, טאי צ׳י: הציר שהכול נשען עליו
  center: (
    <g>
      {[14, 26, 38].map(r => <rect key={r} x={50 - r} y={50 - r} width={r * 2} height={r * 2} strokeWidth="1.3" />)}
      <circle cx="50" cy="50" r="5" strokeWidth="1.8" />
    </g>
  ),
};

export default function BaguaArt({ k, color }) {
  return (
    <svg className="cell-art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">{ART[k]}</g>
    </svg>
  );
}
