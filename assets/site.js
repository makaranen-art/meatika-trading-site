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

  /* Cloudinary auto-generates a JPG thumbnail for any video it hosts just by
     swapping the file extension — no separate thumbnail upload/storage
     needed. so_1 grabs the frame at the 1s mark (skips the black first
     frame many videos start on); c_fill/w/h keeps it a clean 16:9 crop.
     Returns '' for anything that isn't a Cloudinary-hosted video (e.g. an
     old GitHub-hosted path from before the Cloudinary switch). */
  function cloudinaryVideoPosterUrl(videoUrl){
    const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/.exec(videoUrl || '');
    if(!m) return '';
    const rest = m[2].replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
    return `${m[1]}so_1,c_fill,w_800,h_450,q_auto/${rest}`;
  }

  /* Turns a stored video reference into an inline embed. Supports an
     uploaded video file, a pasted YouTube/Vimeo/Facebook link (converted
     to an embeddable iframe), or any other URL (shown as a plain link). */
  function videoEmbedHtml(video){
    if(!video) return '';
    if(video.type === 'file' && video.file){
      const poster = cloudinaryVideoPosterUrl(video.file);
      const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : '';
      return `<div class="block-video"><video controls preload="metadata"${posterAttr} src="${escapeHtml(video.file)}"></video></div>`;
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

  /* Optional heading shown above a block's content (works for any block
     type — text, photo, video). Set per-block in admin.html; falls back
     to the English heading when no Khmer translation was entered. */
  function headingHtml(heading){
    const h = heading || {};
    if(!h.en && !h.km) return '';
    const en = escapeHtml(h.en || '');
    const km = escapeHtml(h.km || h.en || '');
    return `<h3 class="block-heading i18n-en">${en}</h3><h3 class="block-heading i18n-km">${km}</h3>`;
  }

  function blockHtml(block){
    if(!block || !block.type) return '';
    const heading = headingHtml(block.heading);

    if(block.type === 'text'){
      const text = block.text || {};
      const en = textBlockParagraphs(text.en);
      const km = textBlockParagraphs(text.km || text.en);
      if(!en && !km) return '';
      return `<div class="block block-text">${heading}<div class="i18n-en">${en}</div><div class="i18n-km">${km}</div></div>`;
    }

    if(block.type === 'photo'){
      if(!block.image) return '';
      return `<figure class="block block-photo">${heading}<img src="${escapeHtml(block.image)}" alt="" loading="lazy">${captionHtml(block.caption, 'figcaption')}</figure>`;
    }

    if(block.type === 'video'){
      const embed = videoEmbedHtml(block.video);
      if(!embed) return '';
      return `<div class="block block-video-wrap">${heading}${embed}${captionHtml(block.caption, 'p')}</div>`;
    }

    if(block.type === 'form'){
      return formBlockHtml(block, heading);
    }

    return '';
  }

  function blocksHtml(blocks){
    return (blocks || []).map(blockHtml).join('');
  }

  /* ---- Registration / lead-capture form block ----
     A page block that lets a visitor register (e.g. for exclusive
     educational content). Since this is a static site with no backend,
     submissions are POSTed directly from the browser to an admin-configured
     form endpoint (e.g. a free Formspree/Web3Forms form — services built to
     be embedded in public HTML, so it's fine that the endpoint ends up
     visible in data.json). If no endpoint is configured yet, the form still
     renders but tells the visitor registration isn't open yet instead of
     failing silently. */
  /* Optional "register with our broker first" referral block, shown above
     the registration form. Lets the visitor open the admin-configured
     affiliate/referral link and see which broker it's for, before filling
     in the form below. Renders nothing if the admin hasn't set a link or
     broker name yet. */
  function referralHtml(referral){
    const r = referral || {};
    const link = (r.link || '').trim();
    const broker = (r.brokerName || '').trim();
    if(!link && !broker) return '';
    const linkAttr = escapeHtml(link);
    const brokerRow = broker
      ? `<div class="referral-row">
           <span class="referral-tag" data-en="Broker" data-km="ឈ្មោះ Broker">Broker</span>
           <span class="referral-broker">${escapeHtml(broker)}</span>
         </div>`
      : '';
    const linkRow = link
      ? `<div class="referral-link-row">
           <a class="referral-register-btn" href="${linkAttr}" target="_blank" rel="noopener noreferrer" data-en="Register" data-km="បើកគណនី">Register</a>
         </div>`
      : '';
    return `
      <div class="block-referral">
        ${brokerRow}
        ${linkRow}
        <p class="referral-hint i18n-en">Register with this broker first using the button above, then fill in the form below to unlock exclusive content.</p>
        <p class="referral-hint i18n-km">ចុះឈ្មោះជាមួយ broker នេះជាមុនសិន ដោយប្រើប៊ូតុងខាងលើ រួចបំពេញទម្រង់ខាងក្រោមដើម្បីទទួលបានខ្លឹមសារផ្តាច់មុខ។</p>
      </div>`;
  }

  function formBlockHtml(block, heading){
    const text = block.text || {};
    const textEn = textBlockParagraphs(text.en);
    const textKm = textBlockParagraphs(text.km || text.en);
    const textHtml = (textEn || textKm) ? `<div class="block-text"><div class="i18n-en">${textEn}</div><div class="i18n-km">${textKm}</div></div>` : '';

    const success = block.success || {};
    const successEn = escapeHtml(success.en || 'Thank you! Our team will get back to you soon.');
    const successKm = escapeHtml(success.km || success.en || 'Thank you! Our team will get back to you soon.');

    const privacy = block.privacy || {};
    const privacyEn = privacy.en || 'We respect your privacy. We never spam or sell your information.';
    const privacyKm = privacy.km || privacyEn;

    const endpoint = escapeHtml(block.endpoint || '');
    const accessKey = escapeHtml(block.accessKey || '');
    const subjectSource = (block.heading && block.heading.en) || 'Meatika Trading';
    const hiddenFields = accessKey
      ? `<input type="hidden" name="access_key" value="${accessKey}"><input type="hidden" name="subject" value="New registration — ${escapeHtml(subjectSource)}">`
      : '';
    const mailto = escapeHtml(block.notifyEmail || '');
    const referral = block.referral || {};
    const referralLink = String(referral.link || '').trim();
    const referralCode = String(referral.code || '').trim();
    const brokerName = escapeHtml(referral.brokerName || 'our partner');
    const telegramLink = String(block.telegramSupport || '').trim();
    const stepOne = (referralLink || referralCode) ? `
      <section class="registration-step">
        <div class="step-heading"><span class="step-number">1</span><div><h3 data-en="Register Via Referral" data-km="ចុះឈ្មោះក្រោម Referral">Register via referral</h3><p data-en="Use the referral link or copy our referral code before you register with ${brokerName}." data-km="សូមប្រើតំណយោង ឬចម្លងលេខកូដយោងរបស់យើង មុនពេលអ្នកចុះឈ្មោះជាមួយ ${brokerName}។">Use the referral link or copy our referral code before you register with ${brokerName}.</p></div></div>
        <div class="step-actions">
          ${referralLink ? `<a class="step-button primary" href="${escapeHtml(referralLink)}" target="_blank" rel="noopener" data-en="Open referral link" data-km="ទៅកាន់ Referral Link">Open referral link</a>` : ''}
          ${referralCode ? `<button class="step-button secondary copy-referral" type="button" data-referral-code="${escapeHtml(referralCode)}" data-en="Copy referral code: ${escapeHtml(referralCode)}" data-km="ចម្លងលេខកូដយោង៖ ${escapeHtml(referralCode)}">Copy referral code: ${escapeHtml(referralCode)}</button>` : ''}
        </div>
      </section>` : '';
    const stepThree = telegramLink ? `
      <section class="registration-step">
        <div class="step-heading"><span class="step-number">3</span><div><h3 data-en="Send your registration screenshot" data-km="ផ្ញើរូបថតអេក្រង់នៃការចុះឈ្មោះរបស់អ្នក">Send your registration screenshot</h3><p data-en="Take a screenshot of your completed registration, then send it to Telegram Support for verification. Once verified, we will provide your textbook and video." data-km="សូមថតរូបអេក្រង់នៃការចុះឈ្មោះដែលបានបញ្ចប់រួច ហើយផ្ញើទៅ Telegram Support ដើម្បីផ្ទៀងផ្ទាត់។ បន្ទាប់ពីបានផ្ទៀងផ្ទាត់ យើងនឹងផ្តល់សៀវភៅ និងវីដេអូជូនអ្នក។">Take a screenshot of your completed registration, then send it to Telegram Support for verification. Once verified, we will provide your textbook and video.</p></div></div>
        <a class="step-button telegram-button" href="${escapeHtml(telegramLink)}" target="_blank" rel="noopener" data-en="Send screenshot to Telegram Support" data-km="ផ្ញើរូបថតអេក្រង់ទៅ Telegram Support">Send screenshot to Telegram Support</a>
      </section>` : '';

    return `
      <div class="block block-form">
        ${heading}
        ${textHtml}
        ${stepOne}
        <section class="registration-step">
          <div class="step-heading"><span class="step-number">2</span><div><h3 data-en="Fill in and submit the form" data-km="បំពេញ និងដាក់ស្នើទម្រង់">Fill in and submit the form</h3><p data-en="Enter your registration details so our team can match your account." data-km="សូមបញ្ចូលព័ត៌មានចុះឈ្មោះរបស់អ្នក ដើម្បីឱ្យក្រុមការងារយើងអាចផ្គូផ្គងគណនីរបស់អ្នកបាន។">Enter your registration details so our team can match your account.</p></div></div>
        <form class="reg-form" data-endpoint="${endpoint}" data-mailto="${mailto}" data-subject="${escapeHtml(subjectSource)}" data-success-en="${successEn}" data-success-km="${successKm}">
          ${hiddenFields}          <div class="field">
            <label data-en="Full Name" data-km="ឈ្មោះពេញ">Full Name</label>
            <input type="text" name="name" required>
          </div>
          <div class="field">
            <label data-en="Email" data-km="អ៊ីមែល">Email</label>
            <input type="email" name="email" required>
          </div>
          <div class="field">
            <label data-en="Phone Number" data-km="លេខទូរស័ព្ទ">Phone Number</label>
            <input type="tel" name="phone" required>
          </div>
          <div class="field">
            <label data-en="Registration Screenshot" data-km="រូបថតអេក្រង់នៃការចុះឈ្មោះ">Registration Screenshot</label>
            <p class="field-hint i18n-en">Attach a screenshot showing you've registered with the broker above.</p>
            <p class="field-hint i18n-km">ភ្ជាប់រូបថតអេក្រង់បង្ហាញថាអ្នកបានចុះឈ្មោះជាមួយ broker ខាងលើរួចហើយ។</p>
          </div>
          <button type="submit" class="reg-submit" data-en="Submit" data-km="ដាក់ស្នើ">Submit</button>
          <p class="form-status" hidden></p>
        </form>
        </section>
        ${stepThree}
        <p class="block-caption form-privacy i18n-en">${escapeHtml(privacyEn)}</p>
        <p class="block-caption form-privacy i18n-km">${escapeHtml(privacyKm)}</p>
      </div>`;
  }

  /* Google Apps Script Web App URLs (used to pipe form submissions into a
     Google Sheet — see /google-sheets-setup.md) don't send back a readable
     CORS response, so a normal fetch().then(res => res.ok) would always
     look like a failure even when the row was written successfully. For
     these, submit with mode:'no-cors' and treat "the request didn't throw"
     as success instead of checking the (unreadable) response. */
  function isGoogleAppsScriptUrl(url){
    return /^https:\/\/script\.google(usercontent)?\.com\//i.test(url);
  }

  /* Attaches submit handlers to every rendered .reg-form on the page. Call
     this once after inserting blocksHtml() into the DOM. Safe to call even
     when there are no forms present. */
  function wireForms(root){
    const scope = root || document;
    scope.querySelectorAll('.copy-referral').forEach(button => {
      if(button.dataset.wired) return;
      button.dataset.wired = '1';
      button.addEventListener('click', async () => {
        const code = button.dataset.referralCode || '';
        const original = button.innerHTML;
        try{
          await navigator.clipboard.writeText(code);
          button.textContent = document.body.classList.contains('km') ? 'បានចម្លងលេខកូដយោងរួចហើយ' : 'Referral code copied';
        }catch(err){
          button.textContent = document.body.classList.contains('km') ? 'ចម្លងលេខកូដនេះ៖ ' + code : 'Copy this code: ' + code;
        }
        setTimeout(() => { button.innerHTML = original; }, 1800);
      });
    });
    scope.querySelectorAll('form.reg-form').forEach(form => {
      if(form.dataset.wired) return;
      form.dataset.wired = '1';
      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('.reg-submit');
      const isKm = () => document.body.classList.contains('km');
      function setStatus(text, cls){
        statusEl.hidden = false;
        statusEl.className = 'form-status ' + cls;
        statusEl.textContent = text;
      }
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const mailto = (form.dataset.mailto || '').trim();
        const endpoint = (form.dataset.endpoint || '').trim();

        if(mailto){
          // No third-party account needed: build a pre-filled email and let
          // the visitor's own email app send it. The trade-off is the
          // visitor has to press Send themselves — the site can't confirm
          // that actually happens, so the status message says so honestly
          // instead of claiming delivery.
          const fd = new FormData(form);
          const get = k => String(fd.get(k) || '').trim();
          const screenshotFile = fd.get('screenshot');
          const hasScreenshot = !!(screenshotFile && screenshotFile.name);
          const subject = 'New registration — ' + (form.dataset.subject || 'Meatika Trading');
          const body = [
            'Full Name: ' + get('name'),
            'Email: ' + get('email'),
            'Phone Number: ' + get('phone'),
            'Message: ' + (get('message') || '-'),
            'Screenshot: ' + (hasScreenshot ? '(please attach "' + screenshotFile.name + '" to this email before sending — mailto links can\u2019t attach files automatically)' : '-')
          ].join('\n');
          window.location.href = 'mailto:' + encodeURIComponent(mailto) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          setStatus(isKm()
            ? (hasScreenshot
              ? 'ស្ទើររួចរាល់ហើយ — យើងបានបើកកម្មវិធីអ៊ីមែលរបស់អ្នក។ សូមកុំភ្លេចភ្ជាប់រូបថតអេក្រង់ដោយដៃ រួចចុច "ផ្ញើ" (Send)។'
              : 'ស្ទើររួចរាល់ហើយ — យើងបានបើកកម្មវិធីអ៊ីមែលរបស់អ្នក ដោយបំពេញអ៊ីមែលរួចជាស្រេច។ សូមចុច "ផ្ញើ" (Send) ដើម្បីបញ្ចប់ការចុះឈ្មោះ។')
            : (hasScreenshot
              ? 'Almost done — we\u2019ve opened your email app. Don\u2019t forget to attach your screenshot manually, then press Send.'
              : 'Almost done — we\u2019ve opened your email app with the message ready to go. Please press Send there to finish registering.'), 'ok');
          return;
        }

        if(!endpoint){
          setStatus(isKm() ? 'ការចុះឈ្មោះមិនទាន់អាចប្រើបានទេឥឡូវនេះ។ សូមទាក់ទងយើងខ្ញុំតាម Telegram ជំនួសវិញ។' : 'Registration isn\u2019t open yet — please reach us on Telegram instead.', 'bad');
          return;
        }
        submitBtn.disabled = true;
        const originalLabel = submitBtn.textContent;
        submitBtn.textContent = isKm() ? 'កំពុងផ្ញើ...' : 'Sending...';
        const toSheet = isGoogleAppsScriptUrl(endpoint);
        try{
          if(toSheet){
            // Opaque response by design — can't check .ok, so a resolved
            // (non-throwing) fetch is the closest thing to a success signal.
            await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new FormData(form) });
          } else {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Accept': 'application/json' },
              body: new FormData(form)
            });
            if(!res.ok) throw new Error('bad status');
          }
          form.hidden = true;
          setStatus(isKm() ? (form.dataset.successKm || form.dataset.successEn) : form.dataset.successEn, 'ok');
          // status paragraph is inside the now-hidden form, so move it after
          form.insertAdjacentElement('afterend', statusEl);
        }catch(err){
          setStatus(isKm() ? 'ការដាក់ស្នើមិនជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។' : 'Something went wrong sending that — please try again.', 'bad');
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
    });
  }

  /* ---- Load-in float animation ----
     Gives cards, sections, blocks and news items a subtle fade/float-in
     as soon as they're rendered — no scrolling required. A light stagger
     keeps groups of items from all popping in at once. Purely additive:
     it just toggles a class, the actual motion lives in each page's CSS
     (.reveal / .is-visible) so it can respect prefers-reduced-motion there.
     Call initReveal() (optionally with a container element) right after
     injecting any dynamic HTML — sections, cards, blocks, news list —
     so newly-added elements get picked up. Safe to call repeatedly;
     elements already wired are skipped. */
  const REVEAL_SELECTOR = '.card, .section, .block, .news-card, .art-cover, .art-header';
  function initReveal(root){
    const scope = root || document;
    const items = scope.querySelectorAll ? scope.querySelectorAll(REVEAL_SELECTOR) : [];
    items.forEach((el, i) => {
      if(el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i, 9) * 55) + 'ms';
      // Two rAFs so the browser paints the initial (hidden) state first,
      // then transitions into view — a simple load-time float-in.
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));
    });
  }

  window.MTHSite = {
    escapeHtml, cardHref, isInternal, cardHtml, sectionHtml, sectionsHtml,
    renderTicker, loadData, findPage, videoEmbedHtml, blockHtml, blocksHtml,
    cloudinaryVideoPosterUrl, formBlockHtml, wireForms, initReveal
  };

})(window);
