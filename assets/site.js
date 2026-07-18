/* Meatika Trading — shared site rendering logic.
   Used by index.html (home) and page.html (admin-created subpages) so both
   render sections/cards identically. A card can link either to an external
   URL or to an internal page created in admin.html. */
(function(window){

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* Where a card should point: internal page (page.html?id=...) or external URL. */
  function isInternal(card){
    return card.linkType === 'page' && !!card.pageId;
  }
  function cardHref(card){
    if(isInternal(card)) return 'page.html?id=' + encodeURIComponent(card.pageId);
    return card.link || '#';
  }

  function cardHtml(card){
    const iconSvg = window.mthIconSvg(card.icon, card.iconColor);
    const wideClass = card.wide ? ' wide' : '';
    const href = escapeHtml(cardHref(card));
    const internal = isInternal(card);
    const targetAttrs = internal ? '' : ' target="_blank" rel="noopener"';
    const desc = card.desc || {};
    return `
      <div class="card${wideClass}">
        <div class="avatar" style="background:${escapeHtml(card.color || '#24262b')};">
          <svg viewBox="0 0 24 24" fill="none">${iconSvg}</svg>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(card.title)}</h3>
          <p data-en="${escapeHtml(desc.en)}" data-km="${escapeHtml(desc.km || desc.en)}">${escapeHtml(desc.en)}</p>
        </div>
        <div class="card-actions">
          <a href="${href}"${targetAttrs} title="${internal ? 'Open page' : 'Open link'}">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>`;
  }

  function sectionHtml(section){
    if(!section.cards || !section.cards.length) return '';
    const label = section.label || {};
    const cards = section.cards.map(cardHtml).join('');
    return `
      <div class="section">
        <div class="section-label" data-en="${escapeHtml(label.en)}" data-km="${escapeHtml(label.km || label.en)}">${escapeHtml(label.en)}</div>
        <div class="cards">${cards}</div>
      </div>`;
  }

  function sectionsHtml(sections){
    return (sections || []).map(sectionHtml).join('');
  }

  function renderTicker(el, items){
    const one = (items || []).map(t => `<span><b>${escapeHtml(t.label)}</b> · ${escapeHtml(t.text)}${t.up ? ' <span class="up">▲</span>' : ''}</span>`).join('');
    el.innerHTML = one + one; // duplicate for seamless loop
  }

  async function loadData(){
    const res = await fetch('data.json?_=' + Date.now());
    if(!res.ok) throw new Error('Content failed to load.');
    return res.json();
  }

  function findPage(data, id){
    return ((data && data.pages) || []).find(p => p.id === id) || null;
  }

  window.MTHSite = { escapeHtml, cardHref, isInternal, cardHtml, sectionHtml, sectionsHtml, renderTicker, loadData, findPage };

})(window);
