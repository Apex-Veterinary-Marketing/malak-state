// IDX (live MLS listings) embed slots — same pattern as src/data/forms.ts.
// Paste the IDX provider's embed snippet (iframe or script widget) per slot;
// IdxEmbed.astro renders it and re-runs any <script> tags (a script that
// arrives via set:html never executes on its own). Nothing renders while
// idxEnabled is false or a slot is empty, so this never blocks a build.
//
// Slots in use:
//   search — /listings, above the hand-entered listings grid
//
// The provider is not chosen yet (intake answer: "Not sure").
export const idxEnabled = false;
export const idxEmbeds: Record<string, string> = {
  // search: `<iframe src="https://provider.example/search?..." title="Search homes" loading="lazy"></iframe>`,
};
