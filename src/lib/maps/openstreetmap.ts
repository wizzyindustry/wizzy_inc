/*
 * OpenStreetMap links for an office (owner's choice: no API key and no tracking cookies,
 * so the map can show without cookie consent).
 */

const SPAN = 0.006; // about 650 m around the office

/** Address of the embeddable map with a marker on the office. */
export function osmEmbedUrl(latitude: number, longitude: number): string {
  const box = [longitude - SPAN, latitude - SPAN, longitude + SPAN, latitude + SPAN]
    .map((n) => n.toFixed(5))
    .join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

/** The full map (new tab) — with directions. */
export function osmPageUrl(latitude: number, longitude: number): string {
  const lat = latitude.toFixed(5);
  const lon = longitude.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}
