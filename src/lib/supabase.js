import { createClient } from "@supabase/supabase-js";

/*
  Supabase: פרויקט cultura-GH, טבלאות fs_ בלבד.
  אין כניסה למשתמשים: כל דפדפן מקבל מזהה אקראי (fs_device) שנשלח בכותרת x-fs-device,
  וה-RLS מחזיר לכל מכשיר רק את השורות והקבצים שלו.
*/
const URL = import.meta.env.VITE_SUPABASE_URL || "https://ktqmwpbzcnzkhjskqisy.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cW13cGJ6Y256a2hqc2txaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM4OTgsImV4cCI6MjEwNTc1OTg5OH0.uPKn4hrLk16jhDoajMjPl4OmV5j1b3bMIECVmOdhWGI";

export const BUCKET = "fs-images";

function readDevice() {
  let id = "";
  try { id = localStorage.getItem("fs_device") || ""; } catch {}
  if (id.length < 20) {
    id = "fs-" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2));
    try { localStorage.setItem("fs_device", id); } catch {}
  }
  return id;
}

export const device = readDevice();

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { "x-fs-device": device } },
});

export async function uploadImage(blob, key) {
  const path = `${device}/${key.replace(/[^a-z0-9-]/gi, "-")}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

export async function signedUrl(path) {
  if (!path) return "";
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeImage(path) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

/* מצב התמונות של כל הכרטיסים: { visual_key: { prompt, insight, image_path } } */
export async function loadVisuals() {
  const { data, error } = await supabase.from("fs_room_visuals").select("visual_key,prompt,insight,image_path,updated_at");
  if (error) throw error;
  return Object.fromEntries((data || []).map(r => [r.visual_key, r]));
}

export async function saveVisual(row) {
  const { error } = await supabase.from("fs_room_visuals").upsert(
    { device_id: device, updated_at: new Date().toISOString(), ...row },
    { onConflict: "device_id,visual_key" }
  );
  if (error) throw error;
}

export async function analyzeImage(base64, mediaType, note) {
  const { data, error } = await supabase.functions.invoke("fs-analyze-image", {
    body: { image: base64, media_type: mediaType, note },
    headers: { "x-fs-device": device },
  });
  if (error) {
    let msg = error.message;
    try { msg = (await error.context.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data.result;
}

export async function listAnalyses() {
  const { data, error } = await supabase.from("fs_image_analyses").select("*").order("created_at", { ascending: false }).limit(12);
  if (error) throw error;
  return data || [];
}

export async function insertAnalysis(row) {
  const { data, error } = await supabase.from("fs_image_analyses").insert({ device_id: device, ...row }).select().single();
  if (error) throw error;
  return data;
}

export async function updateAnalysis(id, patch) {
  const { error } = await supabase.from("fs_image_analyses").update(patch).eq("id", id);
  if (error) throw error;
}
