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

  /* ---- Page content blocks (photo / video / text) ----
     A page can carry a free-form "blocks" list in addition to its
     sections/cards — this is what lets a page work either as a simple
     content page (just photos/video/text, no cards) or a hybrid of both.
     Each block renders both languages inline (.i18n-en / .i18n-km) and
     CSS (driven by body.km, already toggled by applyLang) shows the
     right one — no extra JS wiring needed when the language switches. */

  function textBlockParagraphs(text){
    const t = String(text == null ? '' : text).trim();
    if(!t) return '';
    return t.split(/\n{2,}/).map(p => `<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');
  }

  /* Turns a stored video reference into an inline embed. Supports an
     uploaded video file, a pasted YouTube/Vimeo/Facebook link (converted
     to an embeddable iframe), or any other URL (shown as a plain link). */
  function videoEmbedHtml(video){
    if(!video) return '';
    if(video.type === 'file' && video.file){
      return `<div class="block-video"><video controls preload="metadata" src="${escapeHtml(video.file)}"></video></div>`;
    }
    const url = (video.url || '').trim();
    if(!url) return '';

    let m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
    if(m){
      return `<div class="block-video"><iframe src="https://www.youtube.com/embed/${m[1]}" title="Video" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    m = url.match(/vimeo\.com\/(\d+)/i);
    if(m){
      return `<div class="block-video"><iframe src="https://player.vimeo.com/video/${m[1]}" title="Video" loading="lazy" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    if(/facebook\.com|fb\.watch/i.test(url)){
      return `<div class="block-video"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0" title="Video" loading="lazy" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    return `<p class="block-video-link"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">▶ Watch video</a></p>`;
  }

  function captionHtml(caption, tag){
    const cap = caption || {};
    if(!cap.en && !cap.km) return '';
    const en = escapeHtml(cap.en || '');
    const km = escapeHtml(cap.km || cap.en || '');
    return `<${tag} class="block-caption i18n-en">${en}</${tag}><${tag} class="block-caption i18n-km">${km}</${tag}>`;
  }

  function blockHtml(block){
    if(!block || !block.type) return '';

    if(block.type === 'text'){
      const text = block.text || {};
      const en = textBlockParagraphs(text.en);
      const km = textBlockParagraphs(text.km || text.en);
      if(!en && !km) return '';
      return `<div class="block block-text"><div class="i18n-en">${en}</div><div class="i18n-km">${km}</div></div>`;
    }

    if(block.type === 'photo'){
      if(!block.image) return '';
      return `<figure class="block block-photo"><img src="${escapeHtml(block.image)}" alt="" loading="lazy">${captionHtml(block.caption, 'figcaption')}</figure>`;
    }

    if(block.type === 'video'){
      const embed = videoEmbedHtml(block.video);
      if(!embed) return '';
      return `<div class="block block-video-wrap">${embed}${captionHtml(block.caption, 'p')}</div>`;
    }

    return '';
  }

  function blocksHtml(blocks){
    return (blocks || []).map(blockHtml).join('');
  }

  window.MTHSite = {
    escapeHtml, cardHref, isInternal, cardHtml, sectionHtml, sectionsHtml,
    renderTicker, loadData, findPage, videoEmbedHtml, blockHtml, blocksHtml
  };

})(window);
