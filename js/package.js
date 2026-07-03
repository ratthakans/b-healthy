// ============================================================
// B-Healthy — render a single package detail + booking form
// Reads ?id= from the URL and pulls from window.PACKAGES
// ============================================================
(function () {
  const root = document.getElementById('pkg');
  if (!root || !window.PACKAGES) return;

  const id = new URLSearchParams(location.search).get('id');
  const p = window.PACKAGES[id];

  if (!p) {
    root.innerHTML = `<section class="container" style="padding:160px 0;text-align:center">
      <h1 class="section__title">ไม่พบแพ็กเกจ</h1>
      <p class="section__sub">กรุณาเลือกแพ็กเกจจากหน้า Wellness Program</p>
      <p style="margin-top:24px"><a class="btn btn--primary" href="program.html">← กลับไปเลือกแพ็กเกจ</a></p>
    </section>`;
    return;
  }

  document.title = `${p.name} — B-Healthy`;

  const price = p.priceNow === 'ติดต่อสอบถาม'
    ? `<div class="pkg-price__now">ติดต่อสอบถาม</div>`
    : `${p.priceOld ? `<div class="pkg-price__old">ราคาปกติ ${p.priceOld} บาท</div>` : ''}
       <div class="pkg-price__now">${p.priceNow}<span> ${p.priceUnit}</span></div>
       ${p.priceNote ? `<div class="pkg-price__note">${p.priceNote}</div>` : ''}`;

  const exp = p.experiences.map(e => `
    <article class="pxp">
      <div class="pxp__img"><img src="${e.img}" alt="${e.title}" loading="lazy" /></div>
      <h4>${e.title}${e.th ? `<span>${e.th}</span>` : ''}</h4>
      <p>${e.desc}</p>
    </article>`).join('');

  const includes = p.includes.map(i => `<li>${i}</li>`).join('');

  const itinerary = p.itinerary.map((d, idx) => `
    <div class="tl">
      <div class="tl__day"><span>DAY</span><strong>${idx + 1}</strong></div>
      <div class="tl__content">
        <h4>${d.title}</h4>
        <ul>${d.items.map(it => `<li><span class="tl__time">${it.time}</span><span class="tl__text">${it.text}</span></li>`).join('')}</ul>
      </div>
    </div>`).join('');

  const venueImgs = p.venue.images.map(src => `<img src="${src}" alt="${p.venue.name}" loading="lazy" />`).join('');

  root.style.setProperty('--pc', p.theme.primary);
  root.style.setProperty('--pa', p.theme.accent);
  root.style.setProperty('--pt', p.theme.tint);

  root.innerHTML = `
    <!-- HERO -->
    <section class="pkg-hero">
      <img class="pkg-hero__bg" src="${p.hero}" alt="${p.name}" />
      <div class="pkg-hero__overlay"></div>
      <div class="container pkg-hero__inner">
        <a class="pkg-back" href="program.html">← Wellness Program</a>
        <p class="pkg-hero__tags">${p.tagline.map(t => `<span>${t}</span>`).join('')}</p>
        <h1 class="pkg-hero__title">${p.name}</h1>
        <p class="pkg-hero__meta">${p.duration} &nbsp;·&nbsp; ${p.group}</p>
        <p class="pkg-hero__loc">${p.location}</p>
        <a href="#booking" class="btn btn--primary">จองแพ็กเกจนี้</a>
      </div>
    </section>

    <!-- OVERVIEW + PRICE -->
    <section class="pkg-over">
      <div class="container pkg-over__grid">
        <div class="pkg-over__text">
          <p class="section__eyebrow">Overview</p>
          <h2 class="pkg-h2">${p.kicker}</h2>
          <p class="pkg-intro">${p.intro}</p>
        </div>
        <aside class="pkg-price">
          <span class="pkg-price__pill">ราคาเพียง</span>
          ${price}
          <a href="#booking" class="btn btn--primary btn--block">จองเลย</a>
        </aside>
      </div>
    </section>

    <!-- EXPERIENCES -->
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__script">Premium</span><span class="pill-head__pill">WELLNESS EXPERIENCES</span></div>
        <div class="pxp__grid">${exp}</div>
      </div>
    </section>

    <!-- INCLUDES -->
    <section class="pkg-sec">
      <div class="container">
        <div class="pill-head"><span class="pill-head__pill">PACKAGE INCLUDES</span></div>
        <ul class="pkg-includes">${includes}</ul>
      </div>
    </section>

    <!-- ITINERARY -->
    <section class="pkg-sec pkg-sec--tint">
      <div class="container">
        <div class="pill-head"><span class="pill-head__pill">PROGRAM HIGHLIGHTS</span></div>
        <div class="tl__wrap">${itinerary}</div>
      </div>
    </section>

    <!-- VENUE -->
    <section class="pkg-sec">
      <div class="container">
        <div class="pill-head"><span class="pill-head__script">Luxury</span><span class="pill-head__pill">VENUE</span></div>
        <div class="pkg-venue">
          <div class="pkg-venue__text">
            <h3>${p.venue.name}</h3>
            <p>${p.venue.desc}</p>
          </div>
          <div class="pkg-venue__imgs">${venueImgs}</div>
        </div>
      </div>
    </section>

    <!-- BOOKING -->
    <section class="pkg-book" id="booking">
      <div class="container">
        <div class="pkg-book__card">
          <div class="pkg-book__head">
            <h2>จองแพ็กเกจ</h2>
            <p>${p.name} · ${p.duration}</p>
          </div>
          <form class="form" id="bookForm" novalidate>
            <label class="form__full">แพ็กเกจ<input type="text" name="package" value="${p.name}" readonly /></label>
            <div class="form__row">
              <label>ชื่อผู้ติดต่อ <span>*</span><input type="text" name="contact" required placeholder="ชื่อ-นามสกุล" /></label>
              <label>ชื่อบริษัท / องค์กร<input type="text" name="company" placeholder="ชื่อองค์กร" /></label>
            </div>
            <div class="form__row">
              <label>เบอร์โทรศัพท์ <span>*</span><input type="tel" name="phone" required placeholder="08x-xxx-xxxx" /></label>
              <label>อีเมล <span>*</span><input type="email" name="email" required placeholder="you@email.com" /></label>
            </div>
            <div class="form__row">
              <label>จำนวนผู้เข้าร่วม<input type="number" name="pax" min="1" placeholder="เช่น 12" /></label>
              <label>วันที่สนใจ<input type="date" name="date" /></label>
            </div>
            <label class="form__full">รายละเอียดเพิ่มเติม<textarea name="message" rows="3" placeholder="เล่าให้เราฟังเกี่ยวกับทีมและเป้าหมายของคุณ"></textarea></label>
            <label class="form__check"><input type="checkbox" name="consent" required /><span>ฉันยอมรับ <a href="#">นโยบายความเป็นส่วนตัว</a> และยินยอมให้ B-Healthy ติดต่อกลับ</span></label>
            <button type="submit" class="btn btn--primary btn--block">ส่งคำขอจอง</button>
            <p class="form__done" id="formDone" hidden>ขอบคุณค่ะ ทีมของเราจะติดต่อกลับเพื่อยืนยันการจองโดยเร็วที่สุด 🌿</p>
          </form>
        </div>
      </div>
    </section>`;

  // Booking form (front-end demo)
  const form = document.getElementById('bookForm');
  const done = document.getElementById('formDone');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    done.hidden = false;
    form.querySelector('button[type=submit]').textContent = 'ส่งแล้ว ✓';
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
