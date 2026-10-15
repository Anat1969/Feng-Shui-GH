/* קריאת תמונה מהדבקה, גרירה או קובץ, והקטנה ל-JPEG לפני העלאה */
export function imageFromClipboard(e) {
  const items = e.clipboardData?.items || [];
  for (const it of items) if (it.kind === "file" && it.type.startsWith("image/")) return it.getAsFile();
  return null;
}

export function imageFromDrop(e) {
  const f = e.dataTransfer?.files?.[0];
  return f && f.type.startsWith("image/") ? f : null;
}

export async function toJpeg(file, max = 1600, quality = 0.86) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", quality));
    return blob;
  } finally { URL.revokeObjectURL(url); }
}

export function blobToBase64(blob) {
  return new Promise((ok, bad) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1]);
    r.onerror = bad;
    r.readAsDataURL(blob);
  });
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = document.createElement("textarea");
    t.value = text; document.body.appendChild(t); t.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch {}
    t.remove(); return ok;
  }
}
