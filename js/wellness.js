// ============================================================
// B-Healthy — Personal Wellness Check
//
// Landing → six question screens → contact details → personal guide.
// Questions and weights live in js/wellness-data.js, every word of the guide
// in js/wellness-content.js; this file is only the machinery.
//
// Contact details are asked LAST, after the reader has already answered
// everything. Asking first costs most of the people who would have finished.
//
// Answers are kept in sessionStorage so a refresh, a phone call or a dropped
// connection does not throw away six screens of work.
// ============================================================
(function () {
  const root = document.getElementById('wcRoot');
  if (!root || !window.BH_WELLNESS || !window.BH_WELLNESS_CONTENT) return;

  const D = window.BH_WELLNESS;
  const C = window.BH_WELLNESS_CONTENT;
  const esc = window.bhEsc, escAttr = window.bhEscAttr;
  const KEY = 'bh-wellness';

  const isEn = () => document.documentElement.lang === 'en';
  const say = o => (o ? (isEn() ? (o.en || o.th) : o.th) : '');

  // --- state ------------------------------------------------------------
  let answers = {}, step = -1, result = null, claim = null, sending = false;

  function load() {
    try {
      const raw = sessionStorage.getItem(KEY);
      const o = raw ? JSON.parse(raw) : null;
      if (o && typeof o === 'object') {
        answers = o.answers || {};
        step = typeof o.step === 'number' ? o.step : -1;
        result = o.result || null;
        claim = o.claim || null;
      }
    } catch (e) { /* storage blocked — the quiz still works, it just forgets */ }
  }
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ answers: answers, step: step, result: result, claim: claim })); }
    catch (e) {}
  }

  // --- scoring ----------------------------------------------------------
  // weight × (points ÷ 3), summed. See the header of wellness-data.js.
  function score() {
    const totals = {};
    D.DIRECTIONS.forEach(d => { totals[d] = 0; });

    Object.keys(D.QUESTIONS).forEach(qid => {
      const q = D.QUESTIONS[qid];
      if (!q.weight) return;                        // tag-only question
      const opt = (q.options || []).find(o => o.v === answers[qid]);
      if (!opt || !opt.score) return;
      Object.keys(opt.score).forEach(dir => {
        totals[dir] += q.weight * (opt.score[dir] / 3);
      });
    });

    D.DIRECTIONS.forEach(d => { totals[d] = Math.round(totals[d]); });

    // A tie goes to what the reader actually asked for: their own intent
    // should outrank a direction inferred from how they described the week.
    const wanted = answers.desired;
    const ranked = D.DIRECTIONS.slice().sort((a, b) =>
      (totals[b] - totals[a]) || (a === wanted ? -1 : b === wanted ? 1 : 0));

    return { totals: totals, primary: ranked[0], secondary: ranked[1] };
  }

  // --- the guide --------------------------------------------------------
  function experiences() {
    const pick = answers.interest === 'recommend'
      ? C.BY_DIRECTION[result.primary]
      : (C.PACKAGES[answers.interest] ? answers.interest : C.BY_DIRECTION[result.primary]);
    const second = C.BY_PREF[answers.pref];
    const keys = second && second !== pick ? [pick, second] : [pick];
    return keys.map(k => C.PACKAGES[k]).filter(Boolean);
  }

  // Four clauses into one sentence. Thai separates with spaces and English
  // with commas — joined the same way, the English ran together into one
  // unreadable line.
  function currentState() {
    const s = C.STATE;
    const parts = [s.feeling[answers.feeling], s.energy[answers.energy],
                   s.pain[answers.pain], s.work_type[answers.work_type]]
      .filter(Boolean).map(say).filter(Boolean);
    if (!parts.length) return '';
    if (!isEn()) return parts.join(' ');
    const line = parts.join(', ');
    return line.charAt(0).toUpperCase() + line.slice(1) + '.';
  }

  // --- rendering --------------------------------------------------------
  function optionList(qid) {
    const q = D.QUESTIONS[qid];
    return `
      <fieldset class="wc-q">
        <legend class="wc-q__label">${esc(say(q.q))}</legend>
        <div class="wc-opts" role="radiogroup" aria-label="${escAttr(say(q.q))}">
          ${q.options.map(o => `
            <label class="wc-opt${answers[qid] === o.v ? ' is-on' : ''}">
              <input type="radio" name="${esc(qid)}" value="${esc(o.v)}"${answers[qid] === o.v ? ' checked' : ''} />
              <span>${esc(say(o.label))}</span>
            </label>`).join('')}
        </div>
      </fieldset>`;
  }

  function renderIntro() {
    root.innerHTML = `
      <section class="wc-hero">
        <div class="container wc-hero__inner">
          <span class="wc-kicker" data-en="Personal Wellness Check">แบบประเมินสุขภาวะส่วนบุคคล</span>
          <h1 class="wc-hero__title" data-en="Nine questions. A guide written for your week, not for everyone's.">9 คำถาม สำหรับจังหวะชีวิตของคุณ ไม่ใช่ของทุกคน</h1>
          <p class="wc-hero__sub" data-en="Tell us how your weeks actually run and we will put together a wellness direction, a few things to try, and the experience that fits. Around two minutes.">เล่าให้เราฟังว่าช่วงนี้คุณเป็นอย่างไร แล้วเราจะประกอบทิศทางสุขภาวะ สิ่งที่ลองได้จริง และประสบการณ์ที่เหมาะกับคุณ ใช้เวลาราว 2 นาที</p>
          <button class="btn btn--primary wc-start" id="wcStart" data-en="Start the check">เริ่มทำแบบประเมิน</button>
          <p class="wc-note" data-en="Not a medical diagnosis. It does not identify any condition, and it does not read your ธาตุเจ้าเรือน — that is what the Element Workshop is for.">ไม่ใช่การวินิจฉัยทางการแพทย์ ไม่ระบุโรค และไม่ได้ทายธาตุเจ้าเรือน ซึ่งเป็นเนื้อหาของ Element Workshop</p>
        </div>
      </section>`;
    done();
    document.getElementById('wcStart').addEventListener('click', () => { step = 0; save(); render(); });
  }

  function renderStep() {
    const s = D.STEPS[step];
    const pct = Math.round((step / (D.STEPS.length + 1)) * 100);
    root.innerHTML = `
      <section class="wc-sec">
        <div class="container wc-wrap">
          <div class="wc-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <span style="width:${pct}%"></span>
          </div>
          <p class="wc-count"><span data-en="Step ${step + 1} of ${D.STEPS.length + 1}">ขั้นที่ ${step + 1} จาก ${D.STEPS.length + 1}</span></p>
          <h2 class="wc-title">${esc(say(s.title))}</h2>
          ${s.hint ? `<p class="wc-hint">${esc(say(s.hint))}</p>` : ''}
          <form id="wcForm" novalidate>
            ${s.questions.map(optionList).join('')}
            <p class="wc-err" id="wcErr" role="alert"></p>
            <div class="wc-nav">
              ${step > 0 ? `<button type="button" class="btn btn--ghost" id="wcBack" data-en="Back">ย้อนกลับ</button>` : ''}
              <button type="submit" class="btn btn--primary" data-en="Continue">ถัดไป</button>
            </div>
          </form>
        </div>
      </section>`;
    done();

    root.querySelectorAll('.wc-opt input').forEach(i => i.addEventListener('change', e => {
      answers[e.target.name] = e.target.value;
      save();
      const group = e.target.closest('.wc-opts');
      group.querySelectorAll('.wc-opt').forEach(l => l.classList.remove('is-on'));
      e.target.closest('.wc-opt').classList.add('is-on');
      document.getElementById('wcErr').textContent = '';
    }));

    const back = document.getElementById('wcBack');
    if (back) back.addEventListener('click', () => { step--; save(); render(); });

    document.getElementById('wcForm').addEventListener('submit', e => {
      e.preventDefault();
      const missing = s.questions.find(q => !answers[q]);
      if (missing) {
        msg('wcErr', 'กรุณาเลือกคำตอบให้ครบก่อนไปต่อ', 'Please answer every question before continuing.');
        const el = root.querySelector(`[name="${missing}"]`);
        if (el) el.closest('.wc-q').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      step++; save(); render();
    });
  }

  function renderLead() {
    const pct = Math.round((D.STEPS.length / (D.STEPS.length + 1)) * 100);
    root.innerHTML = `
      <section class="wc-sec">
        <div class="container wc-wrap">
          <div class="wc-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
          <p class="wc-count"><span data-en="Last step">ขั้นสุดท้าย</span></p>
          <h2 class="wc-title" data-en="Where should we address your guide?">จะให้เรียกคุณว่าอะไรดี</h2>
          <p class="wc-hint" data-en="Your guide appears on the next screen — you do not have to wait for an email.">ผลลัพธ์จะแสดงบนหน้าถัดไปทันที ไม่ต้องรออีเมล</p>
          <form class="form" id="wcLead" novalidate>
            <!-- data-en goes on an inner <span>, never on the label itself:
                 i18n swaps an element's whole innerHTML, so a label carrying
                 data-en deletes the input nested inside it on first render.
                 Same pattern as contact.html. -->
            <label class="form__full"><span data-en="Name">ชื่อ</span> <span>*</span>
              <input id="wcName" type="text" autocomplete="name" required placeholder="ชื่อ-นามสกุล" data-en-ph="Full name" /></label>
            <div class="form__row">
              <label><span data-en="Email">อีเมล</span> <span>*</span>
                <input id="wcEmail" type="email" autocomplete="email" inputmode="email" required placeholder="you@email.com" /></label>
              <label><span data-en="Phone">เบอร์โทร</span> <span>*</span>
                <input id="wcPhone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="08x-xxx-xxxx" /></label>
            </div>
            <label class="form__check">
              <input type="checkbox" id="wcConsent" />
              <span data-en="I agree that B-Healthy may keep my answers and contact details in order to prepare this guide and to contact me about workplace wellbeing. My answers describe how I feel, which is health-related information. I can ask for it to be deleted at any time at b-healthy@pzentsmart.com.">ข้าพเจ้ายินยอมให้ B-Healthy เก็บคำตอบและข้อมูลติดต่อ เพื่อจัดทำผลประเมินนี้และติดต่อเรื่องสุขภาวะองค์กร โดยเข้าใจว่าคำตอบเกี่ยวกับความรู้สึกและสภาพร่างกายเป็นข้อมูลด้านสุขภาพ และขอให้ลบข้อมูลได้ทุกเมื่อที่ b-healthy@pzentsmart.com</span>
            </label>
            <p class="wc-err" id="wcErr" role="alert"></p>
            <div class="wc-nav">
              <button type="button" class="btn btn--ghost" id="wcBack" data-en="Back">ย้อนกลับ</button>
              <button type="submit" class="btn btn--primary" id="wcSend" data-en="See my guide">ดูผลประเมินของฉัน</button>
            </div>
          </form>
        </div>
      </section>`;
    done();

    document.getElementById('wcBack').addEventListener('click', () => { step--; save(); render(); });
    document.getElementById('wcLead').addEventListener('submit', submit);
  }

  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    const name = document.getElementById('wcName').value.trim();
    const email = document.getElementById('wcEmail').value.trim();
    const phone = document.getElementById('wcPhone').value.trim();
    const consent = document.getElementById('wcConsent').checked;

    if (!name) return msg('wcErr', 'กรุณากรอกชื่อ', 'Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return msg('wcErr', 'อีเมลยังไม่ถูกต้อง', 'That email does not look right.');
    if ((phone.replace(/\D/g, '') || '').length < 9) return msg('wcErr', 'เบอร์โทรยังไม่ถูกต้อง', 'That phone number does not look right.');
    // Health-related answers are sensitive personal data under PDPA s.26, so
    // consent is an explicit act, never a pre-ticked box or small print.
    if (!consent) return msg('wcErr', 'กรุณายืนยันความยินยอมก่อนส่ง', 'Please confirm your consent before sending.');

    const r = score();
    const btn = document.getElementById('wcSend');
    sending = true;
    btn.disabled = true;
    btn.textContent = 'กำลังประมวลผล…';
    btn.setAttribute('data-en', 'Working…');
    delete btn.__th;
    done();

    const payload = {
      name: name, email: email, phone: phone,
      subject: 'Wellness Check — ' + r.primary.toUpperCase() + ' / ' + r.secondary.toUpperCase(),
      primary: r.primary, secondary: r.secondary, scores: r.totals,
      answers: Object.assign({}, answers),
      consent: true, consent_at: new Date().toISOString()
    };

    let res = { ok: false };
    try { res = await window.bhSubmit('wellness', payload); } catch (err) { res = { ok: false }; }

    sending = false;
    if (!res || !res.ok) {
      btn.disabled = false;
      btn.textContent = 'ดูผลประเมินของฉัน';
      btn.setAttribute('data-en', 'See my guide');
      delete btn.__th;
      msg('wcErr', 'ส่งไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อเราทาง LINE @bhealthyme',
          "Couldn't send — please try again, or reach us on LINE @bhealthyme");
      done();
      return;
    }

    result = { primary: r.primary, secondary: r.secondary, totals: r.totals,
               name: name, email: email, phone: phone };
    step = D.STEPS.length + 1;
    save();
    render();
  }

  function renderResult() {
    const p = result.primary, s = result.secondary;
    const exp = experiences();
    const m = C.MATCH[p];
    const tip = C.LIFESTYLE_TIP[answers.work_type];
    const max = Math.max(1, ...D.DIRECTIONS.map(d => result.totals[d]));

    root.innerHTML = `
      <section class="wc-sec wc-result">
        <div class="container wc-wrap">
          <p class="wc-kicker" data-en="Your personal wellness guide">ผลประเมินสุขภาวะของคุณ</p>
          <h1 class="wc-title wc-title--lg">${esc(result.name)}</h1>

          <article class="wc-block">
            <h2 class="wc-block__h"><span class="wc-num">01</span><span data-en="Your current state">สิ่งที่คุณเล่าให้เราฟัง</span></h2>
            <p class="wc-lead">${esc(currentState())}</p>
          </article>

          <article class="wc-block">
            <h2 class="wc-block__h"><span class="wc-num">02</span><span data-en="Your wellness direction">ทิศทางสุขภาวะของคุณ</span></h2>
            <div class="wc-dir">
              <div class="wc-dir__main">
                <span class="wc-dir__tag" data-en="Primary">หลัก</span>
                <strong>${esc(say(D.DIRECTION_LABEL[p]))}</strong>
              </div>
              <div class="wc-dir__sub">
                <span class="wc-dir__tag" data-en="Secondary">รอง</span>
                <strong>${esc(say(D.DIRECTION_LABEL[s]))}</strong>
              </div>
            </div>
            <ul class="wc-scores">
              ${D.DIRECTIONS.slice().sort((a, b) => result.totals[b] - result.totals[a]).map(d => `
                <li><span class="wc-scores__n">${esc(say(D.DIRECTION_LABEL[d]))}</span>
                  <span class="wc-scores__bar"><i style="width:${Math.round((result.totals[d] / max) * 100)}%"></i></span>
                  <span class="wc-scores__v">${esc(result.totals[d])}</span></li>`).join('')}
            </ul>
          </article>

          <article class="wc-block">
            <h2 class="wc-block__h"><span class="wc-num">03</span><span data-en="What this means for you">สิ่งนี้หมายถึงอะไรสำหรับคุณ</span></h2>
            <p class="wc-lead">${esc(say(C.DIRECTION[p].line))}</p>
            <p>${esc(say(C.DIRECTION[p].meaning))}</p>
          </article>

          <article class="wc-block">
            <h2 class="wc-block__h"><span class="wc-num">04</span><span data-en="Your wellness match">สิ่งที่เหมาะกับคุณ</span></h2>
            <dl class="wc-match">
              <dt data-en="Tea">ชา</dt><dd>${esc(say(m.tea))}</dd>
              <dt data-en="Aroma">กลิ่น</dt><dd>${esc(say(m.aroma))}</dd>
              <dt data-en="A simple ritual">กิจวัตรสั้น ๆ</dt><dd>${esc(say(m.ritual))}</dd>
              ${tip ? `<dt data-en="For your working week">สำหรับจังหวะงานของคุณ</dt><dd>${esc(say(tip))}</dd>` : ''}
            </dl>
          </article>

          <article class="wc-block">
            <h2 class="wc-block__h"><span class="wc-num">05</span><span data-en="Your experience match">ประสบการณ์ที่เหมาะกับคุณ</span></h2>
            <div class="wc-exp">
              ${exp.map(x => `<a class="wc-exp__card" href="package.html?id=${encodeURIComponent(x.id)}">
                <strong>${esc(say(x.label))}</strong>
                <span data-en="See this experience →">ดูรายละเอียด →</span></a>`).join('')}
            </div>
          </article>

          <article class="wc-block wc-next">
            <h2 class="wc-block__h"><span class="wc-num">06</span><span data-en="Want to go deeper?">อยากรู้ลึกกว่านี้ไหม</span></h2>
            <p data-en="This check reads your week. The B-Healthy Element Workshop reads your ธาตุเจ้าเรือน — a deeper balance assessment and a blend put together for you.">แบบประเมินนี้อ่านจังหวะชีวิตช่วงนี้ของคุณ ส่วน B-Healthy Element Workshop คือการตรวจธาตุเจ้าเรือน วิเคราะห์สมดุลเชิงลึก และจัดสูตรเฉพาะบุคคล</p>
            ${pendingOffer() ? '' : `<a class="btn btn--primary" id="wcNext" href="contact.html" data-en="Talk to us about the workshop">คุยกับเราเรื่องเวิร์กช็อป</a>`}
          </article>

          ${C.OFFER && C.OFFER.enabled ? offerBlock() : ''}

          <div class="wc-foot">
            <button class="btn btn--ghost" id="wcPrint" type="button" data-en="Save or print this guide">บันทึกหรือพิมพ์ผลนี้</button>
            <button class="btn btn--ghost" id="wcAgain" type="button" data-en="Start over">ทำใหม่อีกครั้ง</button>
          </div>
          <p class="wc-note" data-en="This guide is based on what you told us. It is not a medical diagnosis and does not identify any condition.">ผลนี้ประกอบจากสิ่งที่คุณตอบ ไม่ใช่การวินิจฉัยทางการแพทย์ และไม่ได้ระบุโรคใด ๆ</p>
        </div>
      </section>`;
    done();

    // Carries the result into the contact form, so the team opens the
    // conversation already knowing what the person said. Absent while the
    // free-workshop offer is still unanswered — two buttons side by side are
    // two asks, and the offer is the one that converts.
    const next = document.getElementById('wcNext');
    if (next) next.href = 'contact.html?subject=' + encodeURIComponent('Element Workshop — ' + p.toUpperCase() + ' / ' + s.toUpperCase());

    bindOffer();
    document.getElementById('wcPrint').addEventListener('click', () => window.print());
    document.getElementById('wcAgain').addEventListener('click', () => {
      answers = {}; result = null; claim = null; step = -1; save(); render();
      window.scrollTo({ top: 0 });
    });
  }

  // --- 07 the offer -----------------------------------------------------
  // Asked for AFTER the guide, never before: the company name and the head
  // count are what qualify the lead, and people hand those over far more
  // readily once they have already been given something.
  function offerBlock() {
    const o = C.OFFER;
    if (claim) {
      const team = claim.size !== 'lt10';
      return `
        <article class="wc-block wc-offer wc-offer--done">
          <h2 class="wc-block__h"><span class="wc-num">07</span><span data-en="Your code">รหัสรับสิทธิ์ของคุณ</span></h2>
          <p class="wc-code">${esc(claim.code)}</p>
          <p>${esc(say(team ? o.doneTeam : o.doneSolo))}</p>
          <p class="wc-note">${esc(say(team ? o.teamOffer : o.soloOffer))} · ${esc(say(o.replyWithin))}</p>
        </article>`;
    }
    return `
      <article class="wc-block wc-offer">
        <h2 class="wc-block__h"><span class="wc-num">07</span><span>${esc(say(o.title))}</span></h2>
        <p class="wc-lead">${esc(say(o.lead))}</p>
        <ul class="wc-offer__list">
          <li>${esc(say(o.teamOffer))}</li>
          <li>${esc(say(o.soloOffer))}</li>
        </ul>
        <form class="form wc-offer__form" id="wcClaim" novalidate>
          <div class="form__row">
            <label><span data-en="Company or organisation">บริษัท / องค์กร</span> <span>*</span>
              <input id="wcCo" type="text" autocomplete="organization" required /></label>
            <label><span data-en="How many people on your team">ทีมคุณมีกี่คน</span> <span>*</span>
              <select id="wcSize" required>
                <option value="" data-en="Please choose">กรุณาเลือก</option>
                ${o.sizes.map(x => `<option value="${esc(x.v)}">${esc(say(x.label))}</option>`).join('')}
              </select></label>
          </div>
          <label class="form__full"><span data-en="Which one would you like?">อยากได้เวิร์กช็อปไหน</span>
            <select id="wcWant">
              ${Object.keys(C.PACKAGES).map(k => `<option value="${esc(k)}"${k === suggestedKey() ? ' selected' : ''}>${esc(say(C.PACKAGES[k].label))}</option>`).join('')}
            </select></label>
          <p class="wc-err" id="wcClaimErr" role="alert"></p>
          <button class="btn btn--primary" type="submit" id="wcClaimBtn">${esc(say(o.cta))}</button>
        </form>
      </article>`;
  }

  // True while the offer is on screen and nobody has taken it yet.
  function pendingOffer() {
    return !!(C.OFFER && C.OFFER.enabled && !claim);
  }

  function suggestedKey() {
    if (answers.interest === 'recommend') return C.BY_DIRECTION[result.primary];
    return C.PACKAGES[answers.interest] ? answers.interest : C.BY_DIRECTION[result.primary];
  }

  function bindOffer() {
    const form = document.getElementById('wcClaim');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const co = document.getElementById('wcCo').value.trim();
      const size = document.getElementById('wcSize').value;
      const want = document.getElementById('wcWant').value;
      if (!co) return msg('wcClaimErr', 'กรุณากรอกชื่อบริษัทหรือองค์กร', 'Please enter your company or organisation.');
      if (!size) return msg('wcClaimErr', 'กรุณาเลือกจำนวนคนในทีม', 'Please choose your team size.');

      const btn = document.getElementById('wcClaimBtn');
      btn.disabled = true;
      btn.textContent = 'กำลังบันทึก…';
      btn.setAttribute('data-en', 'Saving…');
      delete btn.__th;
      done();

      const code = C.OFFER.codePrefix + '-' +
        (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(-6).toUpperCase();

      const body = {
        name: result.name, email: result.email, phone: result.phone,
        company: co,
        subject: 'Free workshop claim — ' + want + ' (' + size + ')',
        claim_code: code, team_size: size, workshop: want,
        // Carried so a claim row still makes sense on its own in the admin.
        primary: result.primary, secondary: result.secondary,
        claim_for: result.email, claimed_at: new Date().toISOString()
      };

      let res = { ok: false };
      try { res = await window.bhSubmit('workshop-claim', body); } catch (err) { res = { ok: false }; }

      if (!res || !res.ok) {
        btn.disabled = false;
        btn.textContent = say(C.OFFER.cta);
        btn.setAttribute('data-en', C.OFFER.cta.en);
        delete btn.__th;
        msg('wcClaimErr', 'บันทึกไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อเราทาง LINE @bhealthyme',
            "Couldn't save — please try again, or reach us on LINE @bhealthyme");
        return;
      }

      claim = { code: code, size: size, workshop: want, company: co };
      save();
      renderResult();
      document.querySelector('.wc-offer').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // --- helpers ----------------------------------------------------------
  function msg(id, th, en) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = th;
    el.setAttribute('data-en', en);
    delete el.__th;
    el.classList.add('show');
    done();
  }
  function done() { if (window.bhApplyLang) window.bhApplyLang(); }

  function render() {
    if (result && step > D.STEPS.length) return renderResult();
    if (step < 0) return renderIntro();
    if (step >= D.STEPS.length) return renderLead();
    renderStep();
  }

  load();
  render();
  // The guide is rebuilt rather than translated in place: it is generated
  // copy, and i18n only swaps elements that carry data-en.
  document.getElementById('navLang')?.addEventListener('click', () => setTimeout(render, 0));
})();
