// src/utils/resolveImageSrc.js
export const resolveImageSrc = (image, apiUrl) => {
  if (!image) return "";

  const s = String(image);

  //  Déjà un Data URL → pas de requête réseau
  if (s.startsWith("data:image/")) return s;

  //  URL absolue déjà OK
  if (/^https?:\/\//i.test(s)) return s;

  //  Chemin relatif déjà /uploads/...
  if (s.startsWith("/uploads/")) {
    const origin = String(apiUrl || "").replace(/\/api\/?$/, "");
    return `${origin}${s}`;
  }

  //  Sinon: on suppose que c’est un filename dans uploads
  const origin = String(apiUrl || "").replace(/\/api\/?$/, "");
  return `${origin}/uploads/${encodeURIComponent(s)}`;
};