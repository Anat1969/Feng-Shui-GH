/* הכתובת היא המצב: #עמוד/פריט. דף הבית הוא # ריק. */
export function readHash() {
  const [page = "", item = ""] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/");
  return { page, item };
}

export function go(page, item) {
  const h = page ? `#${page}${item ? "/" + item : ""}` : "#";
  if (location.hash !== h) history.pushState(null, "", h);
  window.dispatchEvent(new Event("hashchange"));
}
