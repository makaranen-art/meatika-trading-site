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
  ,document: '<path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" fill="none" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2.5V7h4" fill="none" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 12h8M8 15.5h8M8 19h5" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/>'
  ,play:     '<circle cx="12" cy="12" r="9.3" fill="none" stroke="{c}" stroke-width="1.6"/><path d="M10 8.3v7.4l6-3.7Z" fill="{c}"/>'
  ,book:     '<path d="M12 5.2C10.3 3.9 7.6 3.3 4.6 3.3A1 1 0 0 0 3.6 4.3v14a1 1 0 0 0 1.1 1c2.7-.1 5.3.4 6.9 1.7 1.6-1.3 4.2-1.8 6.9-1.7a1 1 0 0 0 1.1-1v-14a1 1 0 0 0-1-1c-3 0-5.7.6-7.4 1.9Z" fill="none" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5.2V21" stroke="{c}" stroke-width="1.6"/>'
  ,telegram: '<path d="m21.4 4.6-3 14.2c-.23 1-.82 1.25-1.66.78l-4.58-3.38-2.2 2.12c-.24.24-.45.45-.92.45l.33-4.66 8.49-7.67c.37-.33-.08-.52-.57-.19L6.3 12.87l-4.52-1.41c-.98-.31-1-.98.2-1.45l17.67-6.8c.82-.3 1.54.2 1.75 1.39Z" fill="{c}"/>'
  ,facebook: '<path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.25-1.5 1.54-1.5H16.9V3.63c-.3-.04-1.35-.13-2.57-.13-2.55 0-4.3 1.56-4.3 4.42V9.9H7.14V13h2.89v8h3.67Z" fill="{c}"/>'
  ,youtube: '<path d="M21.58 7.19a2.99 2.99 0 0 0-2.1-2.12C17.63 4.57 12 4.57 12 4.57s-5.63 0-7.48.5A3 3 0 0 0 2.42 7.2C1.92 9.06 1.92 12 1.92 12s0 2.94.5 4.81a3 3 0 0 0 2.1 2.12c1.85.5 7.48.5 7.48.5s5.63 0 7.48-.5a3 3 0 0 0 2.1-2.12c.5-1.87.5-4.81.5-4.81s0-2.94-.5-4.81ZM10.16 14.98V9.02L15.4 12l-5.24 2.98Z" fill="{c}"/>'
  ,instagram: '<path d="M7.25 2h9.5A5.25 5.25 0 0 1 22 7.25v9.5A5.25 5.25 0 0 1 16.75 22h-9.5A5.25 5.25 0 0 1 2 16.75v-9.5A5.25 5.25 0 0 1 7.25 2Zm-.17 2A3.08 3.08 0 0 0 4 7.08v9.84A3.08 3.08 0 0 0 7.08 20h9.84A3.08 3.08 0 0 0 20 16.92V7.08A3.08 3.08 0 0 0 16.92 4H7.08Zm10.96 1.5a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56ZM12 6.9A5.1 5.1 0 1 1 12 17.1 5.1 5.1 0 0 1 12 6.9Zm0 2A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9Z" fill="{c}"/>'
  ,tiktok: '<path d="M15.55 2c.28 2.1 1.46 3.35 3.53 3.49v3.12a7.16 7.16 0 0 1-3.45-1V14.1a5.9 5.9 0 1 1-5.1-5.84v3.17a2.82 2.82 0 1 0 2.02 2.7V2h3Z" fill="{c}"/>'
  ,x: '<path d="M18.9 2.75h3.68l-8.04 9.2L24 21.25h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 2.75h7.58l5.24 6.92 6.08-6.92Zm-1.3 16.9h2.04L6.47 4.26H4.28L17.6 19.65Z" fill="{c}"/>'
  ,whatsapp: '<path d="M12 2a9.83 9.83 0 0 0-8.45 14.87L2 22l5.29-1.48A9.98 9.98 0 1 0 12 2Zm0 17.98a8 8 0 0 1-4.08-1.12l-.3-.18-3.14.88.9-3.04-.2-.32A7.98 7.98 0 1 1 12 19.98Zm4.38-5.96c-.24-.12-1.42-.7-1.64-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06a6.54 6.54 0 0 1-1.92-1.18 7.16 7.16 0 0 1-1.32-1.64c-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.1.15 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" fill="{c}"/>'
  ,linkedin: '<path d="M5.2 7.3A2.15 2.15 0 1 0 5.2 3a2.15 2.15 0 0 0 0 4.3ZM3.35 8.95h3.7V21h-3.7V8.95Zm6.03 0h3.55v1.65h.05c.5-.94 1.7-1.94 3.5-1.94 3.74 0 4.43 2.46 4.43 5.66V21h-3.7v-5.97c0-1.43-.03-3.26-1.98-3.26-1.99 0-2.3 1.55-2.3 3.16V21h-3.7V8.95Z" fill="{c}"/>'
};

/* Returns the inner SVG markup for `key`, with `color` substituted in. */
window.mthIconSvg = function(key, color){
  var tpl = window.MTH_ICONS[key] || window.MTH_ICONS.star;
  return tpl.split('{c}').join(color || '#efe3e6');
};
