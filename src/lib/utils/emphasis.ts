// Headings may italicize a word the V2 way: "handled with *care.*" renders
// "handled with <em>care.</em>". Everything else is HTML-escaped, so it's safe
// to pass the result to set:html. Dependency-free (unit-tested).
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const renderEmphasis = (text: string) => escape(text).replace(/\*([^*\s][^*]*?)\*/g, "<em>$1</em>");
export const stripEmphasis = (text: string) => text.replace(/\*([^*\s][^*]*?)\*/g, "$1");
