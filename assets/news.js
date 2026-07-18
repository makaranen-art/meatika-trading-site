/* Meatika Trading — shared news/article rendering logic.
   Used by news.html (article list) and article.html (single article).
   Depends on assets/site.js being loaded first (for escapeHtml). */
(function(window){

  const esc = window.MTHSite.escapeHtml;

  /* Published articles, newest first. Admin-created drafts (published:false)
     are excluded from public listings but still reachable directly if linked,
     so a "Preview" link from the admin panel keeps working before publishing. */
  function publishedNews(data){
    return ((data && data.news) || [])
      .filter(n => n.published !== false)
      .slice()
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  }

  function allNews(data){
    return ((data && data.news) || []).slice();
  }

  function findNews(data, id){
    return ((data && data.news) || []).find(n => n.id === id) || null;
  }

  function formatDate(iso){
    if(!iso) return '';
    const d = new Date(iso);
    if(isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  }

  function newsCardHtml(article){
    const title = (article.title && article.title.en) || 'Untitled';
    const titleKm = (article.title && article.title.km) || title;
    const excerpt = (article.excerpt && article.excerpt.en) || '';
    const excerptKm = (article.excerpt && article.excerpt.km) || excerpt;
    const cover = article.cover
      ? `<div class="news-thumb" style="background-image:url('${esc(article.cover)}')"></div>`
      : `<div class="news-thumb news-thumb-empty"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.6"/><path d="m4 15 4.5-4.5L12 14l3-3 5 5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/></svg></div>`;
    const draftTag = article.published === false
      ? '<span class="news-draft-tag">DRAFT</span>' : '';
    return `
      <a class="news-card" href="article.html?id=${encodeURIComponent(article.id)}">
        ${cover}
        <div class="news-card-body">
          <div class="news-meta">${draftTag}<span class="news-date">${esc(formatDate(article.publishedAt))}</span></div>
          <h3 data-en="${esc(title)}" data-km="${esc(titleKm)}">${esc(title)}</h3>
          <p data-en="${esc(excerpt)}" data-km="${esc(excerptKm)}">${esc(excerpt)}</p>
        </div>
      </a>`;
  }

  function newsListHtml(list){
    if(!list.length){
      return '<p class="not-found" data-en="No news yet — check back soon." data-km="មិនទាន់មានព័ត៌មាន សូមពិនិត្យមើលម្តងទៀត។">No news yet — check back soon.</p>';
    }
    return `<div class="news-grid">${list.map(newsCardHtml).join('')}</div>`;
  }

  /* Turns a stored video reference into an inline embed. Supports:
     - an uploaded video file (served straight from the repo)
     - a pasted YouTube / Vimeo / Facebook link (converted to an embeddable iframe)
     - any other URL (shown as a plain "watch" link, since it can't be embedded reliably) */
  function videoEmbedHtml(video){
    if(!video) return '';
    if(video.type === 'file' && video.file){
      return `<div class="news-video"><video controls preload="metadata" src="${esc(video.file)}"></video></div>`;
    }
    const url = (video.url || '').trim();
    if(!url) return '';

    let m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
    if(m){
      return `<div class="news-video"><iframe src="https://www.youtube.com/embed/${m[1]}" title="Video" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    m = url.match(/vimeo\.com\/(\d+)/i);
    if(m){
      return `<div class="news-video"><iframe src="https://player.vimeo.com/video/${m[1]}" title="Video" loading="lazy" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    if(/facebook\.com|fb\.watch/i.test(url)){
      return `<div class="news-video"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0" title="Video" loading="lazy" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    return `<p class="news-video-link"><a href="${esc(url)}" target="_blank" rel="noopener">▶ Watch video</a></p>`;
  }

  /* Plain-text body -> paragraphs. Blank lines separate paragraphs; single
     newlines become line breaks. Kept as plain text (not HTML) in storage so
     the admin textarea stays simple and safe (no injected markup). */
  function bodyHtml(body){
    const text = String(body || '').trim();
    if(!text) return '';
    return text.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
  }

  function shareLinks(url, title){
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      whatsapp: `https://wa.me/?text=${t}%20${u}`
    };
  }

  window.MTHNews = {
    publishedNews, allNews, findNews, formatDate,
    newsCardHtml, newsListHtml, videoEmbedHtml, bodyHtml, shareLinks
  };

})(window);
