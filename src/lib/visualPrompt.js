import { EL, BG } from "../data.js";

/*
  buildVisualPrompt(data): פרומפט המחשה אחד לכל מרחב.
  data = {
    room:      שם המרחב ("חדר שינה")
    element:   מפתח האלמנט המוביל (fire | earth | metal | water | wood)
    colors:    צבעים (ברירת מחדל: הצבעים של האלמנט)
    materials: חומרים (ברירת מחדל: החומרים של האלמנט)
    bagua:     מפתח אזור הבאגואה (north | ne | ... | center)
    light:     תיאור האור
    chi:       gather | flow | open (איך הצ׳י נע במרחב)
    feeling:   התחושה שהמרחב צריך לתת (אופציונלי)
  }
  מחזיר { insight, prompt }: תובנה של עד 15 מילים, ופרומפט בעברית עם סיומת קבועה.
*/

export const PROMPT_SUFFIX = "Documentary realism, Professional architecture photography, 1:1 --ar 1:1 --no text, words, writing, frame divisions";

const DO = {
  fire: "מאיר את הנוכחות",
  earth: "מקרקע את הגוף",
  metal: "ממקד את המחשבה",
  water: "מרכך את הקצב",
  wood: "מעורר צמיחה",
};

const CONTRAST = {
  fire: "אור חם ומרוכז מול צל עמוק ושקט",
  earth: "חומר כבד ונמוך מול אוויר פתוח וגבוה",
  metal: "משטח חלק ומדויק מול טקסטורה גולמית",
  water: "השתקפות מבריקה וכהה מול חומר מט ובהיר",
  wood: "קו אנכי וחי מול רצפה שקטה ואופקית",
};

const FEEL = {
  fire: "חיות, חום ונראות",
  earth: "יציבות, מחסה ושקט",
  metal: "בהירות, סדר ונשימה",
  water: "רוך, עומק וזרימה",
  wood: "התחדשות, צמיחה ותנועה קדימה",
};

const CHI = {
  gather: { short: "ומאפשר לעצור", text: "הצ׳י מתכנס ונח: פינה מוגנת, גב לקיר מלא ומבט פתוח אל הכניסה" },
  flow: { short: "ומניע את הבית", text: "הצ׳י נע בעקומה רכה: מעבר פנוי, בלי קו ישר מהדלת אל החלון" },
  open: { short: "ופותח את המבט", text: "הצ׳י נכנס ומתפשט: סף מואר, מרכז פנוי וקו מבט ארוך" },
};

const words = s => s.trim().split(/\s+/).filter(Boolean);

export function buildVisualPrompt(data) {
  const e = EL[data.element] || EL.earth;
  const b = BG[data.bagua] || BG.center;
  const chi = CHI[data.chi] || CHI.flow;
  const room = data.room || "חדר";
  const colors = data.colors || e.co;
  const materials = data.materials || e.m;
  const light = data.light || "אור יום רך שנכנס מהצד";
  const feeling = data.feeling || FEEL[data.element] || FEEL.earth;

  let insight = `${room} ש${DO[data.element] || DO.earth} ${chi.short}.`;
  const w = words(insight);
  if (w.length > 15) insight = w.slice(0, 15).join(" ").replace(/[.,]?$/, ".");

  const prompt = [
    `${room} בבית עכשווי, אדריכלות שקטה ומדויקת, מבט בגובה העין, בלי אנשים.`,
    `חומרים: ${materials}, במרקם אמיתי ונגיש למגע.`,
    `אור: ${light}.`,
    `צבע ויסוד: יסוד ה${e.n} (${e.q}), בפלטה של ${colors}, על רקע ניטרלי של לבן ואפור.`,
    `אזור ה${b.n} במפת הבאגואה, אזור ${b.la}: ${b.act}.`,
    `${chi.text}.`,
    `ניגוד: ${CONTRAST[data.element] || CONTRAST.earth}.`,
    `תחושה: ${feeling}. קומפוזיציה בחוק השלישים, עומק שדה רדוד ופרט אחד בחדות מלאה.`,
    PROMPT_SUFFIX,
  ].join(" ");

  return { insight, prompt };
}
