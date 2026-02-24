// src/utils/resolveImageSrc.js
import { getImageUrl } from "../api/client";

export default function resolveImageSrc(input) {
  const s = String(input ?? "").trim();
  if (!s) return "";

  // data/blob => on ne touche pas
  if (/^(data:|blob:)/i.test(s)) return s;

  // URL absolue
  if (/^https?:\/\//i.test(s)) return s;

  // Base64 brut (rare)
  if (looksLikeBase64Image(s)) {
    const mime = guessMimeFromBase64(s);
    return `data:${mime};base64,${s}`;
  }

  // Tout le reste (y compris "/uploads/xxx" ou "uploads/xxx" ou "file.jpg")
  // => on délègue à getImageUrl() pour fabriquer l’URL backend correcte.
  return getImageUrl(s) || "";
}

function looksLikeBase64Image(s) {
  if (s.includes(" ") || s.includes(".") || s.includes("://")) return false;
  // évite de prendre un path
  if (s.includes("/") && !s.startsWith("/9j/") && !s.startsWith("iVBOR")) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(s) && s.length > 80;
}

function guessMimeFromBase64(s) {
  if (s.startsWith("/9j/")) return "image/jpeg";
  if (s.startsWith("iVBOR")) return "image/png";
  if (s.startsWith("R0lGOD")) return "image/gif";
  if (s.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}