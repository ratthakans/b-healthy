// ============================================================
// B-Healthy — Personal Wellness Check: the questions and the scoring
//
// Straight from B-HEALTHY PERSONAL WELLNESS (FORM → PERSONALIZATION
// FRAMEWORK). Four questions carry score, five carry tags only, and the
// weights are the document's: desired 40, feeling 25, energy 20, pain 15.
//
// Scoring, so the numbers can be argued with rather than guessed at:
//
//   score(direction) = Σ over the four scoring questions
//                        weight × (points awarded ÷ 3)
//
// Divided by three because an option gives at most 3 to its own direction, so
// an answer sheet pointing one way the whole time lands on exactly 100.
// Highest is Primary, runner-up is Secondary; a tie goes to whichever the
// reader picked in "what do you want back", because their own intent should
// outrank an inference drawn from it.
//
// The three point sets the document spells out are reproduced exactly here —
// สมองแน่น, Reset, and ล้าส่วนใหญ่. The rest follows their shape and is the
// part to argue with: change a number and the result changes, which is the
// point of keeping them in one table instead of inside the engine.
// ============================================================
(function () {
  const t = (th, en) => ({ th: th, en: en || th });

  window.BH_WELLNESS = {
    DIRECTIONS: ['calm', 'energy', 'focus', 'rest', 'reset'],

    DIRECTION_LABEL: {
      calm:   t('ใจสงบ', 'Calm'),
      energy: t('เติมพลัง', 'Energy'),
      focus:  t('สมาธิ คิดได้ชัด', 'Focus'),
      rest:   t('พักฟื้นร่างกาย', 'Rest and recovery'),
      reset:  t('ปรับสมดุลใหม่', 'Reset')
    },

    // One screen per entry. Grouping the context questions keeps this at seven
    // screens instead of ten — the drop-off between those is not small.
    STEPS: [
      {
        key: 'state',
        title: t('ตอนนี้คุณเป็นอย่างไร', 'How are you right now?'),
        questions: ['feeling']
      },
      { key: 'energy', title: t('พลังงานของคุณ', 'Your energy'), questions: ['energy'] },
      { key: 'desired', title: t('สิ่งที่คุณอยากได้กลับมา', 'What you want back'), questions: ['desired'] },
      { key: 'pain', title: t('สิ่งที่กระทบคุณมากที่สุด', 'What affects you most'), questions: ['pain'] },
      {
        key: 'work',
        title: t('เรื่องการทำงานของคุณ', 'About your work'),
        hint: t('ใช้ปรับคำแนะนำให้เข้ากับจังหวะชีวิตจริง ไม่ได้ใช้ตัดสินผล',
                'Used to fit the advice to your actual week — it does not change your result.'),
        questions: ['work_style', 'work_type', 'age_group']
      },
      {
        key: 'taste',
        title: t('สไตล์การพักของคุณ', 'How you like to rest'),
        questions: ['pref', 'interest']
      }
    ],

    QUESTIONS: {
      // ---------- scored ----------
      feeling: {
        weight: 25,
        q: t('ตอนนี้คุณรู้สึกแบบไหนมากที่สุด', 'Which is closest to how you feel right now?'),
        options: [
          { v: 'tired',   label: t('เหนื่อยล้า พักแล้วก็ยังไม่หาย', 'Worn out, even after resting'), score: { rest: 3, energy: 2, reset: 1 } },
          { v: 'tense',   label: t('ตึงเครียด ผ่อนคลายได้ยาก', 'Tense, hard to unwind'), score: { calm: 3, rest: 1, reset: 1 } },
          { v: 'foggy',   label: t('คิดเยอะ สมองไม่ได้พักเลย', 'Thinking all the time, my head never rests'), score: { focus: 3, calm: 1, reset: 1 } },
          { v: 'lowenergy', label: t('แรงน้อย ไม่พอกับสิ่งที่ต้องทำ', 'Low on energy for what the day asks'), score: { energy: 3, rest: 2 } },
          { v: 'okay',    label: t('โดยรวมโอเค อยากดูแลตัวเองต่อไป', 'Generally okay, and want to keep it that way'), score: { calm: 1, energy: 1, focus: 1, rest: 1, reset: 1 } }
        ]
      },
      energy: {
        weight: 20,
        q: t('ช่วงนี้พลังงานของคุณเป็นแบบไหน', 'How has your energy been lately?'),
        options: [
          { v: 'steady', label: t('ดี สม่ำเสมอทั้งวัน', 'Good and steady all day'), score: { energy: 1, focus: 1 } },
          { v: 'dips',   label: t('มีบางช่วงของวันที่แรงตก', 'Drops at certain times of day'), score: { energy: 2, focus: 2, rest: 1 } },
          { v: 'swings', label: t('ขึ้น ๆ ลง ๆ คาดเดาไม่ได้', 'Up and down, hard to predict'), score: { reset: 3, calm: 2, energy: 1 } },
          { v: 'burns',  label: t('เริ่มวันได้ดี แต่หมดแรงเร็ว', 'Start well, run out quickly'), score: { energy: 3, rest: 2, reset: 1 } },
          { v: 'drained', label: t('เหนื่อยล้าเกือบทั้งวัน', 'Tired most of the day'), score: { rest: 3, reset: 2, energy: 1 } }
        ]
      },
      desired: {
        weight: 40,
        q: t('ตอนนี้คุณอยากได้อะไรกลับมามากที่สุด', 'What would you most like back right now?'),
        options: [
          { v: 'calm',   label: t('ความสงบ ใจเบาลง', 'Calm — a lighter mind'),        score: { calm: 3 } },
          { v: 'energy', label: t('พลังงาน มีแรงมากขึ้น', 'Energy — more in the tank'), score: { energy: 3 } },
          { v: 'focus',  label: t('สมาธิ คิดได้ชัดขึ้น', 'Focus — a clearer head'),    score: { focus: 3 } },
          { v: 'rest',   label: t('ได้พักผ่อนเต็มที่ ร่างกายฟื้นตัว', 'Proper rest, so my body can recover'), score: { rest: 3 } },
          { v: 'reset',  label: t('เริ่มต้นใหม่ ปรับสมดุลชีวิตให้ลงตัว', 'A fresh start, a life back in balance'), score: { reset: 3 } }
        ]
      },
      pain: {
        weight: 15,
        q: t('อะไรทำให้คุณเสียสมดุลมากที่สุด', 'What affects your balance the most?'),
        options: [
          { v: 'sleep',    label: t('นอนไม่พอ หรือนอนหลับไม่สนิท', 'Too little sleep, or poor sleep'), score: { rest: 3, calm: 2, energy: 1 } },
          { v: 'stress',   label: t('ความเครียดสะสม', 'Built-up stress'), score: { calm: 3, reset: 2, rest: 1 } },
          { v: 'workload', label: t('งานเยอะเกินไป', 'Too much work'), score: { focus: 3, reset: 2, calm: 1 } },
          { v: 'physical', label: t('ร่างกายเหนื่อยล้า ปวดเมื่อย', 'A tired, aching body'), score: { rest: 3, energy: 2 } },
          { v: 'metime',   label: t('ไม่มีเวลาให้ตัวเอง', 'No time for yourself'), score: { reset: 3, calm: 2 } }
        ]
      },

      // ---------- tags only: context and taste, never score ----------
      work_style: {
        q: t('รูปแบบการทำงานของคุณ', 'How you work'),
        options: [
          { v: 'office',    label: t('เข้าออฟฟิศทุกวัน', 'In the office every day') },
          { v: 'hybrid',    label: t('ไฮบริด สลับเข้าออฟฟิศกับทำงานที่บ้าน', 'Hybrid, office and home') },
          { v: 'wfh',       label: t('ทำงานที่บ้าน', 'From home') },
          { v: 'freelance', label: t('ฟรีแลนซ์', 'Freelance') },
          { v: 'shift',     label: t('ทำงานเป็นกะ หรือเวลาไม่แน่นอน', 'Shifts or irregular hours') }
        ]
      },
      work_type: {
        q: t('งานของคุณส่วนใหญ่เป็นแบบไหน', 'What your work mostly involves'),
        options: [
          { v: 'screen',   label: t('นั่งทำงานหน้าจอ', 'Sitting at a screen') },
          { v: 'people',   label: t('พบปะ พูดคุยกับผู้คน', 'Meeting and talking to people') },
          { v: 'travel',   label: t('เดินทางบ่อย', 'Travelling a lot') },
          { v: 'physical', label: t('ใช้แรงกาย', 'Physical work') },
          { v: 'decide',   label: t('บริหาร ตัดสินใจ', 'Managing and deciding') }
        ]
      },
      age_group: {
        q: t('ช่วงอายุของคุณ', 'Your age'),
        options: [
          { v: '18-24', label: t('18–24') }, { v: '25-34', label: t('25–34') },
          { v: '35-44', label: t('35–44') }, { v: '45-54', label: t('45–54') },
          { v: '55+',   label: t('55 ปีขึ้นไป', '55+') }
        ]
      },
      pref: {
        q: t('เวลาพัก คุณชอบทำอะไร', 'When you rest, what do you like to do?'),
        options: [
          { v: 'quiet',    label: t('อยู่เงียบ ๆ พักผ่อนกับตัวเอง', 'Quiet time on my own') },
          { v: 'tea',      label: t('จิบชาหรือเครื่องดื่มอุ่น ๆ', 'A cup of tea or something warm') },
          { v: 'aroma',    label: t('อยู่กับกลิ่นหอมที่ช่วยผ่อนคลาย', 'A calming scent around me') },
          { v: 'sound',    label: t('ฟังเพลงหรือเสียงที่ช่วยให้ผ่อนคลาย', 'Music or soothing sound') },
          { v: 'movement', label: t('ออกกำลังกาย หรือออกไปเดินรับธรรมชาติ', 'Exercise, or a walk outdoors') }
        ]
      },
      // Broad kinds of activity rather than product names: most readers do
      // not know what Sound Healing is yet, but they know whether they want
      // to make something with their hands. wellness-content.js BY_INTEREST
      // turns each into a real workshop.
      interest: {
        q: t('อยากดูแลตัวเองด้วยกิจกรรมแบบไหน', 'What kind of wellness activity appeals to you?'),
        options: [
          { v: 'mind',       label: t('ด้านจิตใจ ได้สำรวจและเข้าใจตัวเอง', 'The mind — exploring and understanding myself') },
          { v: 'meditation', label: t('ฝึกสมาธิ ให้ใจนิ่งขึ้น', 'Meditation — a steadier mind') },
          { v: 'handson',    label: t('ลงมือปฏิบัติ ได้ของที่ทำเองกลับไป', 'Hands-on — making something to take home') },
          { v: 'relax',      label: t('ผ่อนคลาย ปล่อยความตึงเครียด', 'Relaxation — letting the tension go') },
          { v: 'knowledge',  label: t('ได้ความรู้ (Knowledge) ไปดูแลตัวเอง', 'Knowledge — learning to look after myself') },
          { v: 'recommend',  label: t('ให้ B-Healthy แนะนำให้', 'Let B-Healthy suggest') }
        ],
        // Answers sent before October 2026 named a product. Kept so the admin
        // still shows what those people read; never offered on the form.
        legacy: [
          { v: 'tea',   label: t('ชาสมุนไพร', 'Herbal tea') },
          { v: 'aroma', label: t('น้ำมันหอมระเหย', 'Aromatherapy') },
          { v: 'sound', label: t('Sound Healing') },
          { v: 'yoga',  label: t('โยคะ และสมาธิ', 'Yoga and meditation') }
        ]
      }
    }
  };
})();
