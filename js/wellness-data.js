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
      calm:   t('ความสงบ', 'Calm'),
      energy: t('พลังงาน', 'Energy'),
      focus:  t('สมาธิ', 'Focus'),
      rest:   t('การพักฟื้น', 'Rest'),
      reset:  t('การตั้งต้นใหม่', 'Reset')
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
          { v: 'tired',   label: t('เหนื่อยล้า', 'Worn out'),                     score: { rest: 3, energy: 2, reset: 1 } },
          { v: 'tense',   label: t('ตึงเครียด', 'Tense'),                         score: { calm: 3, rest: 1, reset: 1 } },
          { v: 'foggy',   label: t('สมองแน่น คิดเยอะ', 'Head full, thinking a lot'), score: { focus: 3, calm: 1, reset: 1 } },
          { v: 'lowenergy', label: t('พลังงานต่ำ', 'Low on energy'),              score: { energy: 3, rest: 2 } },
          { v: 'okay',    label: t('โดยรวมโอเค', 'Generally okay'),               score: { calm: 1, energy: 1, focus: 1, rest: 1, reset: 1 } }
        ]
      },
      energy: {
        weight: 20,
        q: t('พลังงานของคุณช่วงนี้เป็นแบบไหน', 'How has your energy been lately?'),
        options: [
          { v: 'steady', label: t('ดีสม่ำเสมอ', 'Steady and good'),               score: { energy: 1, focus: 1 } },
          { v: 'dips',   label: t('ตกบางช่วง', 'Dips at certain hours'),          score: { energy: 2, focus: 2, rest: 1 } },
          { v: 'swings', label: t('ขึ้นลงไม่แน่นอน', 'Up and down'),              score: { reset: 3, calm: 2, energy: 1 } },
          { v: 'burns',  label: t('หมดเร็ว', 'Runs out quickly'),                 score: { energy: 3, rest: 2, reset: 1 } },
          { v: 'drained', label: t('ล้าเกือบทั้งวัน', 'Tired most of the day'),   score: { rest: 3, reset: 2, energy: 1 } }
        ]
      },
      desired: {
        weight: 40,
        q: t('ตอนนี้คุณอยากได้อะไรกลับมามากที่สุด', 'What would you most like back right now?'),
        options: [
          { v: 'calm',   label: t('ความสงบ ใจเบาลง', 'Calm — a lighter mind'),        score: { calm: 3 } },
          { v: 'energy', label: t('พลังงาน มีแรงมากขึ้น', 'Energy — more in the tank'), score: { energy: 3 } },
          { v: 'focus',  label: t('สมาธิ คิดได้ชัดขึ้น', 'Focus — a clearer head'),    score: { focus: 3 } },
          { v: 'rest',   label: t('การพัก ได้ฟื้นจริง ๆ', 'Rest — to actually recover'), score: { rest: 3 } },
          { v: 'reset',  label: t('ตั้งสมดุลใหม่ทั้งหมด', 'A full reset'),             score: { reset: 3 } }
        ]
      },
      pain: {
        weight: 15,
        q: t('อะไรกระทบสมดุลของคุณมากที่สุด', 'What affects your balance the most?'),
        options: [
          { v: 'sleep',    label: t('การนอน', 'Sleep'),                     score: { rest: 3, calm: 2, energy: 1 } },
          { v: 'stress',   label: t('ความเครียด', 'Stress'),                score: { calm: 3, reset: 2, rest: 1 } },
          { v: 'workload', label: t('ปริมาณงาน', 'Workload'),               score: { focus: 3, reset: 2, calm: 1 } },
          { v: 'physical', label: t('ความล้าทางร่างกาย', 'Physical fatigue'), score: { rest: 3, energy: 2 } },
          { v: 'metime',   label: t('ไม่มีเวลาให้ตัวเอง', 'No time for yourself'), score: { reset: 3, calm: 2 } }
        ]
      },

      // ---------- tags only: context and taste, never score ----------
      work_style: {
        q: t('รูปแบบการทำงาน', 'How you work'),
        options: [
          { v: 'office',    label: t('เข้าออฟฟิศ', 'In the office') },
          { v: 'hybrid',    label: t('ไฮบริด', 'Hybrid') },
          { v: 'wfh',       label: t('ทำงานที่บ้าน', 'From home') },
          { v: 'freelance', label: t('ฟรีแลนซ์', 'Freelance') },
          { v: 'shift',     label: t('เป็นกะ / เวลายืดหยุ่น', 'Shift or flexible hours') }
        ]
      },
      work_type: {
        q: t('ลักษณะงานหลัก', 'What your work mostly involves'),
        options: [
          { v: 'screen',   label: t('อยู่หน้าจอ', 'A screen') },
          { v: 'people',   label: t('พบปะผู้คน', 'Meeting people') },
          { v: 'travel',   label: t('เดินทาง', 'Travelling') },
          { v: 'physical', label: t('ใช้ร่างกาย', 'Physical work') },
          { v: 'decide',   label: t('บริหาร ตัดสินใจ', 'Managing and deciding') }
        ]
      },
      age_group: {
        q: t('ช่วงอายุ', 'Age'),
        options: [
          { v: '18-24', label: t('18–24') }, { v: '25-34', label: t('25–34') },
          { v: '35-44', label: t('35–44') }, { v: '45-54', label: t('45–54') },
          { v: '55+',   label: t('55 ปีขึ้นไป', '55+') }
        ]
      },
      pref: {
        q: t('เวลาพัก คุณชอบแบบไหน', 'When you rest, what do you reach for?'),
        options: [
          { v: 'quiet',    label: t('ความเงียบ', 'Quiet') },
          { v: 'tea',      label: t('จิบชา', 'A cup of tea') },
          { v: 'aroma',    label: t('กลิ่นหอม', 'Scent') },
          { v: 'sound',    label: t('เสียงและดนตรี', 'Sound and music') },
          { v: 'movement', label: t('ขยับร่างกาย ออกไปหาธรรมชาติ', 'Moving, or getting outdoors') }
        ]
      },
      interest: {
        q: t('สนใจ Wellness แบบไหน', 'Which kind of wellness interests you?'),
        options: [
          { v: 'tea',       label: t('ชาสมุนไพร', 'Herbal tea') },
          { v: 'aroma',     label: t('น้ำมันหอมระเหย', 'Aromatherapy') },
          { v: 'sound',     label: t('Sound Healing') },
          { v: 'yoga',      label: t('โยคะ และสมาธิ', 'Yoga and meditation') },
          { v: 'recommend', label: t('ให้ B-Healthy แนะนำให้', 'Let B-Healthy suggest') }
        ]
      }
    }
  };
})();
