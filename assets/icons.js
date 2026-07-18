/* Meatika Trading — shared icon set.
   Each entry is the inner SVG markup for a 24x24 viewBox icon.
   Used by index.html (to render cards) and admin.html (icon picker). */
window.MTH_ICONS = {
  check:     '<path d="m3 21 6-6 4 4 8-9" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  star:      '<path d="M12 2 14.5 8.5 21 9l-5 4.5L17.5 20 12 16.5 6.5 20 8 13.5 3 9l6.5-.5Z" fill="{c}"/>',
  squares:   '<rect x="3" y="3" width="7" height="7" rx="1.5" fill="{c}"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="{c}"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="{c}"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="{c}"/>',
  diamonds:  '<path d="M12 3 15 6 12 9 9 6Z" fill="{c}"/><path d="M5 10 8 13 5 16 2 13Z" fill="{c}"/><path d="M19 10 22 13 19 16 16 13Z" fill="{c}"/><path d="M12 15 15 18 12 21 9 18Z" fill="{c}"/>',
  paperplane:'<path d="m2 12 19-8-7 19-3-8-9-3Z" fill="{c}"/>',
  bubble:    '<path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c.9.2 1.8.4 2.7.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2Z" fill="{c}"/>',
  chart:     '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:    '<path d="M12 2 20 5.5v6c0 5-3.4 8.5-8 10.5-4.6-2-8-5.5-8-10.5v-6Z" fill="none" stroke="{c}" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="{c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  bolt:      '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="{c}"/>',
  globe:     '<circle cx="12" cy="12" r="9" fill="none" stroke="{c}" stroke-width="1.8"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" fill="none" stroke="{c}" stroke-width="1.8"/>',
  headset:   '<path d="M4 13v-1a8 8 0 0 1 16 0v1" fill="none" stroke="{c}" stroke-width="1.8" stroke-linecap="round"/><rect x="2.5" y="13" width="4" height="6" rx="1.5" fill="{c}"/><rect x="17.5" y="13" width="4" height="6" rx="1.5" fill="{c}"/>',
  wallet:    '<rect x="2.5" y="6" width="19" height="13" rx="2.5" fill="none" stroke="{c}" stroke-width="1.8"/><path d="M2.5 10h19" stroke="{c}" stroke-width="1.8"/><circle cx="17" cy="14.5" r="1.4" fill="{c}"/>'
};

/* Returns the inner SVG markup for `key`, with `color` substituted in. */
window.mthIconSvg = function(key, color){
  var tpl = window.MTH_ICONS[key] || window.MTH_ICONS.star;
  return tpl.split('{c}').join(color || '#dee2ea');
};
