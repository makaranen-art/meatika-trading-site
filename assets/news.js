/* Meatika Trading — shared news/article rendering logic.
   Used by news.html (article list) and article.html (single article).
   Depends on assets/site.js being loaded first (for escapeHtml). */
(function(window){

  const esc = window.MTHSite.escapeHtml;
  const cloudinaryVideoPosterUrl = window.MTHSite.cloudinaryVideoPosterUrl;

  /* Learning Center content tags. Every article/video post carries exactly
     one of these ids. Tags themselves are managed by the admin (created,
     renamed, deleted) and stored in data.json's "newsTags" array — this is
     just a fallback used if that array is ever missing, so the page still
     renders something sensible. Call setTags(data.newsTags) once data has
     loaded, before rendering any tag badges or tab lists. */
  const FALLBACK_CATEGORIES = [
    { id: 'psychology',       en: 'Psychology',      km: 'ចិត្តវិទ្យា' },
    { id: 'strategy',         en: 'Strategy',         km: 'យុទ្ធសាស្ត្រ' },
    { id: 'market-analysis',  en: 'Market Analysis',  km: 'វិភាគទីផ្សារ' },
    { id: 'video',            en: 'Video',            km: 'វីដេអូ' }
  ];

  let CATEGORIES = FALLBACK_CATEGORIES.slice();

  /* Replaces the working tag list with whatever's in data.json (or the
     fallback list, if it's empty/missing). Safe to call more than once. */
  function setTags(tags){
    CATEGORIES = (tags && tags.length) ? tags.slice() : FALLBACK_CATEGORIES.slice();
  }

  function getTags(){
    return CATEGORIES.slice();
  }

  function categoryInfo(id){
    return CATEGORIES.find(c => c.id === id) || null;
  }

  function categoryBadgeHtml(id){
    const c = categoryInfo(id);
    if(!c) return '';
    return `<span class="news-cat-tag" data-en="${esc(c.en)}" data-km="${esc(c.km)}">${esc(c.en)}</span>`;
  }

  /* Filters an already-published list down to one tag. 'all' (or empty)
     returns the list untouched. */
  function newsByCategory(list, categoryId){
    if(!categoryId || categoryId === 'all') return list;
    return (list || []).filter(n => n.category === categoryId);
  }

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

  function formatInfo(article){
    const format = ['article','video','audio','book'].includes(article.format) ? article.format : (article.video && (article.video.url || article.video.file) ? 'video' : 'article');
    return { article:{label:'Article',icon:'▤'}, video:{label:'Video',icon:'▶'}, audio:{label:'Audio',icon:'♫'}, book:{label:'Book',icon:'▧'} }[format];
  }

  function newsCardHtml(article){
    const title = (article.title && article.title.en) || 'Untitled';
    const titleKm = (article.title && article.title.km) || title;
    const excerpt = (article.excerpt && article.excerpt.en) || '';
    const excerptKm = (article.excerpt && article.excerpt.km) || excerpt;
    const videoPoster = article.video && article.video.type === 'file'
      ? cloudinaryVideoPosterUrl(article.video.file) : '';
    const thumbImg = article.cover || videoPoster;
    const cover = thumbImg
      ? `<div class="news-thumb" style="background-image:url('${esc(thumbImg)}')"></div>`
      : `<div class="news-thumb news-thumb-empty"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.6"/><path d="m4 15 4.5-4.5L12 14l3-3 5 5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/></svg></div>`;
    const draftTag = article.published === false
      ? '<span class="news-draft-tag">DRAFT</span>' : '';
    const catTag = categoryBadgeHtml(article.category);
    const format = formatInfo(article);
    return `
      <a class="news-card" href="article.html?id=${encodeURIComponent(article.id)}">
        ${cover}
        <div class="news-card-body">
          <div class="news-meta">${draftTag}${catTag}<span class="news-draft-tag">${format.icon} ${format.label}</span><span class="news-date">${esc(formatDate(article.publishedAt))}</span></div>
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
      const poster = cloudinaryVideoPosterUrl(video.file);
      const posterAttr = poster ? ` poster="${esc(poster)}"` : '';
      return `<div class="news-video"><video controls preload="metadata"${posterAttr} src="${esc(video.file)}"></video></div>`;
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

  function googleDriveFileId(url){
    const value = String(url || '').trim();
    let m = value.match(/drive\.google\.com\/file\/d\/([\w-]+)/i);
    if(m) return m[1];
    m = value.match(/[?&]id=([\w-]+)/i);
    return m ? m[1] : '';
  }
  function liveMediaUrl(url){
    const id = googleDriveFileId(url);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : String(url || '').trim();
  }
  function pdfPreviewUrl(url){
    const id = googleDriveFileId(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : String(url || '').trim();
  }

  function audioPlayerHtml(url){
    if(!url) return '';
    const liveUrl = liveMediaUrl(url);
    return `<div class="news-audio"><div class="media-title">♫ Listen to this lesson</div><audio controls preload="metadata" src="${esc(liveUrl)}">Your browser does not support audio playback.</audio><a href="${esc(liveUrl)}" target="_blank" rel="noopener">Open audio in a new tab</a></div>`;
  }
  function bookReaderHtml(url){
    if(!url) return '';
    const previewUrl = pdfPreviewUrl(url);
    const downloadUrl = liveMediaUrl(url);
    return `<div class="news-book"><div class="media-title">▧ Read this PDF book</div><iframe src="${esc(previewUrl)}" title="PDF book" loading="lazy"></iframe><div class="book-actions"><a href="${esc(previewUrl)}" target="_blank" rel="noopener">Read full screen</a><a href="${esc(downloadUrl)}" download>Download PDF</a></div></div>`;
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
    setTags, getTags, categoryInfo, categoryBadgeHtml, newsByCategory,
    publishedNews, allNews, findNews, formatDate,
    newsCardHtml, newsListHtml, videoEmbedHtml, audioPlayerHtml, bookReaderHtml, formatInfo, googleDriveFileId, liveMediaUrl, pdfPreviewUrl, bodyHtml, shareLinks
  };

})(window);
