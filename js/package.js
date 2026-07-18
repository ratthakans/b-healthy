// ============================================================
// B-Healthy — render a single package detail + booking form
// Reads ?id= from the URL and pulls from window.PACKAGES (+ PACKAGES_EN)
// ============================================================
(function () {
  const root = document.getElementById('pkg');
  if (!root) return;

  function render() {
  if (!window.PACKAGES) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = window.PACKAGES[id];
  const en = (window.PACKAGES_EN || {})[id] || {};

  if (!p) {
    root.innerHTML = `<section class="container" style="padding:160px 0;text-align:center">
      <h1 class="section__title" data-en="Package not found">ไม่พบแพ็กเกจ</h1>
      <p class="section__sub" data-en="Please choose a package from the Wellness Program page">กรุณาเลือกแพ็กเกจจากหน้า Wellness Program</p>
      <p style="margin-top:24px"><a class="btn btn--primary" href="program.html" data-en="← Back to packages">← กลับไปเลือกแพ็กเกจ</a></p>
    </section>`;
    if (window.bhApplyLang) window.bhApplyLang();
    return;
  }

  document.title = `${p.name} — B-Healthy`;

  const price = p.priceNow === 'ติดต่อสอบถาม'
    ? `<div class="pkg-price__now" data-en="${en.priceNow || 'Contact us'}">ติดต่อสอบถาม</div>`
    : `${p.priceOld ? `<div class="pkg-price__old" data-en="Regular ${p.priceOld} THB">ราคาปกติ ${p.priceOld} บาท</div>` : ''}
       <div class="pkg-price__now">${p.priceNow}<span data-en=" ${en.priceUnit || p.priceUnit}"> ${p.priceUnit}</span></div>
       ${p.priceNote ? `<div class="pkg-price__note" data-en="${en.priceNote || p.priceNote}">${p.priceNote}</div>` : ''}`;

  const exp = p.experiences.map((e, i) => `
    <article class="pxp">
      <div class="pxp__img"><img src="${e.img}" alt="${e.title}" loading="lazy" /></div>
      <h4>${e.title}${e.th ? `<span>${e.th}</span>` : ''}</h4>
      <p${en.expDesc && en.expDesc[i] ? ` data-en="${en.expDesc[i]}"` : ''}>${e.desc}</p>
    </article>`).join('');

  const includes = p.includes.map((it, i) =>
    `<li${en.includes && en.includes[i] ? ` data-en="${en.includes[i]}"` : ''}>${it}</li>`).join('');

  const isWorkshop = p.type === 'workshop';
  const backHref = isWorkshop ? 'workshops.html' : 'program.html';
  const backLabel = isWorkshop ? 'Wellness Workshop' : 'Wellness Program';

  const itinerary = (p.itinerary || []).map((d, idx) => {
    const den = (en.itinerary && en.itinerary[idx]) || {};
    return `
    <div class="tl">
      <div class="tl__day"><span>DAY</span><strong>${idx + 1}</strong></div>
      <div class="tl__content">
        <h4${den.title ? ` data-en="${den.title}"` : ''}>${d.title}</h4>
        <ul>${d.items.map((item, j) => `<li><span class="tl__time">${item.time}</span><span class="tl__text"${den.items && den.items[j] ? ` data-en="${den.items[j]}"` : ''}>${item.text}</span></li>`).join('')}</ul>
      </div>
    </div>`;
  }).join('');

  // --- Optional sections (retreats have venue + itinerary; workshops don't) ---
  const venueSection = p.venue ? `
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__script">Luxury</span><span class="pill-head__pill">VENUE</span></div>
        <div class="pkg-venue">
          <div class="pkg-venue__text">
            <h3>${p.venue.name}</h3>
            <p${en.venueDesc ? ` data-en="${en.venueDesc}"` : ''}>${p.venue.desc}</p>
          </div>
          <div class="pkg-venue__imgs">${p.venue.images.map(src => `<img src="${src}" alt="${p.venue.name}" loading="lazy" />`).join('')}</div>
        </div>
      </div>
    </section>` : '';

  const itinerarySection = (p.itinerary && p.itinerary.length) ? `
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__pill">PROGRAM HIGHLIGHTS</span></div>
        <div class="tl__wrap">${itinerary}</div>
      </div>
    </section>` : '';

  const expHead = isWorkshop
    ? `<span class="pill-head__script">Inside</span><span class="pill-head__pill" data-en="WORKSHOP AGENDA">WORKSHOP AGENDA</span>`
    : `<span class="pill-head__script">Premium</span><span class="pill-head__pill">WELLNESS EXPERIENCES</span>`;
  const inclHead = isWorkshop
    ? `<span class="pill-head__pill" data-en="WHAT YOU GET">WHAT YOU GET</span>`
    : `<span class="pill-head__pill">PACKAGE INCLUDES</span>`;

  root.style.setProperty('--pc', p.theme.primary);
  root.style.setProperty('--pa', p.theme.accent);
  root.style.setProperty('--pt', p.theme.tint);

  root.innerHTML = `
    <!-- HERO -->
    <section class="pkg-hero">
      <img class="pkg-hero__bg" src="${p.hero}" alt="${p.name}" />
      <div class="pkg-hero__overlay"></div>
      <div class="container pkg-hero__inner">
        <a class="pkg-back" href="${backHref}">← ${backLabel}</a>
        <p class="pkg-hero__tags">${p.tagline.map(t => `<span>${t}</span>`).join('')}</p>
        <h1 class="pkg-hero__title">${p.name}</h1>
        <p class="pkg-hero__meta"><span data-en="${en.duration || p.duration}">${p.duration}</span></p>
        <p class="pkg-hero__meta"><span data-en="${en.group || p.group}">${p.group}</span></p>
        <p class="pkg-hero__loc" data-en="${en.location || p.location}">${p.location}</p>
        <a href="#booking" class="btn btn--primary" data-en="Book this package">จองแพ็กเกจนี้</a>
      </div>
    </section>

    <!-- OVERVIEW + PRICE -->
    <section class="pkg-over">
      <div class="container pkg-over__grid">
        <div class="pkg-over__text">
          <p class="section__eyebrow">Overview</p>
          <h2 class="pkg-h2">${p.kicker}</h2>
          <p class="pkg-intro"${en.intro ? ` data-en="${en.intro}"` : ''}>${p.intro}</p>
        </div>
        <aside class="pkg-price">
          <span class="pkg-price__pill" data-en="From">ราคาเพียง</span>
          ${price}
          <a href="#booking" class="btn btn--primary btn--block" data-en="Book now">จองเลย</a>
        </aside>
      </div>
    </section>

    <!-- VENUE (retreats only, right after overview) -->
    ${venueSection}

    <!-- EXPERIENCES / WORKSHOP AGENDA -->
    <section class="pkg-sec${isWorkshop ? ' pkg-sec--tint' : ''}">
      <div class="container">
        <div class="pill-head">${expHead}</div>
        <div class="pxp__grid">${exp}</div>
      </div>
    </section>

    <!-- ITINERARY (retreats only) -->
    ${itinerarySection}

    <!-- INCLUDES / WHAT YOU GET (right before Book) -->
    <section class="pkg-sec">
      <div class="container">
        <div class="pill-head">${inclHead}</div>
        <ul class="pkg-includes">${includes}</ul>
      </div>
    </section>

    <!-- BOOKING -->
    <section class="pkg-book" id="booking">
      <div class="container">
        <div class="pkg-book__card">
          <div class="pkg-book__head">
            <h2 data-en="Book package">จองแพ็กเกจ</h2>
            <p>${p.name} · <span data-en="${en.duration || p.duration}">${p.duration}</span></p>
          </div>
          <form class="form" id="bookForm" novalidate>
            <label class="form__full"><span data-en="Package">แพ็กเกจ</span><input type="text" name="package" value="${p.name}" readonly /></label>
            <div class="form__row">
              <label><span data-en="Contact name">ชื่อผู้ติดต่อ</span> <span>*</span><input type="text" name="contact" required placeholder="ชื่อ-นามสกุล" data-en-ph="Full name" /></label>
              <label><span data-en="Company / Organization">ชื่อบริษัท / องค์กร</span><input type="text" name="company" placeholder="ชื่อองค์กร" data-en-ph="Organization" /></label>
            </div>
            <div class="form__row">
              <label><span data-en="Phone">เบอร์โทรศัพท์</span> <span>*</span><input type="tel" name="phone" required placeholder="08x-xxx-xxxx" /></label>
              <label><span data-en="Email">อีเมล</span> <span>*</span><input type="email" name="email" required placeholder="you@email.com" /></label>
            </div>
            <div class="form__row">
              <label><span data-en="Number of participants">จำนวนผู้เข้าร่วม</span><input type="number" name="pax" min="1" placeholder="เช่น 12" data-en-ph="e.g. 12" /></label>
              <label><span data-en="Preferred date">วันที่สนใจ</span><input type="date" name="date" /></label>
            </div>
            <label class="form__full"><span data-en="Additional details">รายละเอียดเพิ่มเติม</span><textarea name="message" rows="3" placeholder="เล่าให้เราฟังเกี่ยวกับทีมและเป้าหมายของคุณ" data-en-ph="Tell us about your team and your goals"></textarea></label>
            <label class="form__check"><input type="checkbox" name="consent" required /><span data-en="I accept the <a href='#'>Privacy Policy</a> and consent to be contacted by B-Healthy.">ฉันยอมรับ <a href="#">นโยบายความเป็นส่วนตัว</a> และยินยอมให้ B-Healthy ติดต่อกลับ</span></label>
            <button type="submit" class="btn btn--primary btn--block" data-en="Send booking request">ส่งคำขอจอง</button>
            <p class="form__done" id="formDone" hidden data-en="Thank you! Our team will contact you to confirm your booking as soon as possible 🌿">ขอบคุณค่ะ ทีมของเราจะติดต่อกลับเพื่อยืนยันการจองโดยเร็วที่สุด 🌿</p>
          </form>
        </div>
      </div>
    </section>`;

  // Booking form (front-end demo)
  const form = document.getElementById('bookForm');
  const done = document.getElementById('formDone');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    await window.bhSubmit?.('booking', Object.fromEntries(new FormData(form)));
    done.hidden = false;
    btn.textContent = '✓';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // apply current language to freshly rendered content
  if (window.bhApplyLang) window.bhApplyLang();
  }

  render();
  document.addEventListener('bh:packages-ready', render);
})();
