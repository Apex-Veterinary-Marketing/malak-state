// "Cuyahoga County, Medina County, Summit County" -> "Cuyahoga, Medina and Summit counties"
// for running copy (footer, booking section). Dependency-free (unit-tested).
export function countiesSentence(areas: string | undefined) {
  const list = (areas || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length <= 1) return list[0] || "";
  const short = list.map((a) => a.replace(/\s+County$/i, ""));
  return `${short.slice(0, -1).join(", ")} and ${short.at(-1)} counties`;
}
