import { useEffect, useState } from "react";
import { useAdmin, googleEnabled, signInGoogle, signInPassword, signOut } from "../lib/supabase.js";

/*
  כניסת מנהלת. כש-Google מופעל בפרויקט: כפתור Google בלבד.
  כל עוד הוא כבוי: כניסה עם חשבון ה-cultura-GH הקיים (מייל וסיסמה), כי זו הדרך היחידה שעובדת היום בלי לשנות את הגדרות הפרויקט המשותף.
*/
export default function AdminLogin({ compact }) {
  const { ready, session, isAdmin } = useAdmin();
  const [google, setGoogle] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { googleEnabled().then(setGoogle); }, []);

  if (!ready) return <p className="muted small">בודק חיבור...</p>;

  if (session) {
    return (
      <div className="login">
        <p className="small">{isAdmin ? "מחוברת כמנהלת" : "מחובר/ת, אבל לא כמנהלת"} · <span className="mono">{session.user.email}</span></p>
        <button className="btn btn-sm" onClick={() => signOut()} data-act="logout">יציאה</button>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    try { await signInPassword(email.trim(), password); setPassword(""); }
    catch (err) { setMsg(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="login">
      {!compact && <p className="muted small">הוספת תמונות וניתוח תמונה פתוחים למנהלת בלבד, כי הם מפעילים את מפתח Claude.</p>}
      {google ? (
        <button className="btn btn-dark btn-sm" onClick={() => signInGoogle()} data-act="google">כניסה עם Google</button>
      ) : (
        <form className="login-form" onSubmit={submit}>
          <input type="email" required autoComplete="username" placeholder="מייל" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
          <input type="password" required autoComplete="current-password" placeholder="סיסמת החשבון ב-cultura-GH" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" />
          <button className="btn btn-dark btn-sm" disabled={busy} data-act="login">כניסת מנהלת</button>
          {google === false && <p className="muted small">כניסה עם Google עדיין לא מופעלת בפרויקט. בינתיים: החשבון הקיים שלך ב-cultura-GH.</p>}
        </form>
      )}
      {msg && <p className="small err" role="alert">{msg}</p>}
    </div>
  );
}
