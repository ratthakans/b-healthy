// ============================================================
// B-Healthy — Personal Wellness Check: the words
//
// Separate from wellness-data.js (the questions) and wellness.js (the maths)
// so copy can be rewritten without going near either. This is a first draft:
// the Thai is the one to read, the English is a working translation.
//
// The rule the framework sets, and the one that matters most here: this is
// NOT a diagnosis. Nothing below names a condition, promises a cure, or
// guesses at ธาตุเจ้าเรือน — that last one is the Element Workshop's value,
// not a form's. Everything is written as "this is what you told us" and
// "here is something to try".
// ============================================================
(function () {
  const t = (th, en) => ({ th: th, en: en || th });

  window.BH_WELLNESS_CONTENT = {

    // ---- 01 YOUR CURRENT STATE ------------------------------------------
    // Assembled from four clauses rather than stored as 625 combinations.
    // Reads as a sentence someone wrote, stays true to the actual answers.
    STATE: {
      feeling: {
        tired:     t('ร่างกายกำลังบอกว่าใช้แรงไปมากกว่าที่ได้เติมกลับ', 'your body is spending more than it gets back'),
        tense:     t('ความเครียดยังค้างอยู่ แม้ในเวลาที่ควรได้พัก', 'the tension stays even when you should be resting'),
        foggy:     t('สมองคิดอยู่ตลอดเวลา แทบไม่มีช่วงได้พัก', 'your mind keeps running with almost no break'),
        lowenergy: t('แรงที่มีไม่ค่อยพอกับสิ่งที่ต้องทำในแต่ละวัน', 'there is less in the tank than the day asks for'),
        okay:      t('ภาพรวมยังไปได้ดี และนี่คือจังหวะที่ดีที่จะดูแลตัวเองไว้ก่อน', 'things are going well — a good moment to look after yourself before you have to')
      },
      energy: {
        steady:  t('พลังงานค่อนข้างสม่ำเสมอ', 'your energy holds fairly steady'),
        dips:    t('มีบางช่วงของวันที่แรงตกชัดเจน', 'there are times of day when it clearly drops'),
        swings:  t('พลังงานขึ้น ๆ ลง ๆ จนคาดเดาได้ยาก', 'it goes up and down in a way that is hard to predict'),
        burns:   t('เริ่มวันได้ดีแต่หมดแรงเร็วกว่าที่ควร', 'you start well and run out sooner than you should'),
        drained: t('ความเหนื่อยล้าอยู่กับคุณเกือบทั้งวัน', 'the tiredness is with you most of the day')
      },
      pain: {
        sleep:    t('เรื่องที่กระทบคุณมากที่สุดคือการนอน', 'what affects you most is sleep'),
        stress:   t('เรื่องที่กระทบคุณมากที่สุดคือความเครียดสะสม', 'what affects you most is built-up stress'),
        workload: t('เรื่องที่กระทบคุณมากที่สุดคืองานที่มากเกินไป', 'what affects you most is the amount of work'),
        physical: t('เรื่องที่กระทบคุณมากที่สุดคือความเหนื่อยล้าของร่างกาย', 'what affects you most is a tired body'),
        metime:   t('เรื่องที่กระทบคุณมากที่สุดคือการไม่มีเวลาให้ตัวเอง', 'what affects you most is having no time for yourself')
      },
      work_type: {
        screen:   t('และการนั่งทำงานหน้าจอทำให้ร่างกายอยู่ท่าเดิมนานกว่าที่รู้ตัว', 'and screen work keeps your body in one position longer than you notice'),
        people:   t('และงานที่ต้องพบปะผู้คนใช้พลังใจมากกว่าที่คนอื่นมองเห็น', 'and working with people takes more out of you than others can see'),
        travel:   t('และการเดินทางบ่อยทำให้แต่ละวันไม่ค่อยมีจังหวะที่แน่นอน', 'and travelling often keeps your days from settling into a rhythm'),
        physical: t('และงานที่ใช้แรงกายต้องการเวลาฟื้นตัวที่จัดไว้อย่างตั้งใจ', 'and physical work needs recovery time you actually plan for'),
        decide:   t('และการตัดสินใจต่อเนื่องทั้งวันค่อย ๆ ดึงพลังสมองไปทีละน้อย', 'and deciding all day slowly drains your mental energy')
      }
    },

    // ---- 02 + 03 DIRECTION / WHAT THIS MEANS ----------------------------
    // note: one line under the direction's name on the 02 cards, so a reader
    // who sees "Focus" knows what it is asking of them.
    DIRECTION: {
      calm: {
        note:    t('ใจต้องการช่วงเวลาที่ได้ผ่อนลงจริง ๆ', 'Your mind needs moments to genuinely slow down'),
        line:    t('ช่วงนี้ร่างกายและใจกำลังมองหาความสงบ', 'right now you are looking for calm'),
        meaning: t('คำตอบของคุณบอกว่าร่างกายและใจยังไม่ได้ผ่อนลงจริง ๆ สิ่งที่ช่วยได้ไม่ใช่การพักให้นานขึ้น แต่คือการหาช่วงเวลาที่รู้สึกปลอดภัยพอจะปล่อยวางได้',
                  'Your answers say your body and mind have not really slowed down. What helps is not resting longer, but finding moments where you feel safe enough to let go.')
      },
      energy: {
        note:    t('ร่างกายต้องการการเติมแรงอย่างสม่ำเสมอ', 'Your body needs regular refuelling'),
        line:    t('ช่วงนี้คุณขาดแรงที่ใช้ได้จริงในแต่ละวัน', 'right now you are short of usable day-to-day energy'),
        meaning: t('แรงที่หายไปมักไม่ได้มาจากการทำงานหนักเพียงเรื่องเดียว แต่มาจากการเติมพลังที่ไม่สม่ำเสมอ การเติมเล็ก ๆ ที่ทำได้ทุกวัน มักได้ผลกว่าการรอพักยาวครั้งเดียว',
                  'Energy rarely disappears because of one big thing. It goes because the topping-up is irregular. Small refills you can manage every day tend to beat one long break you keep waiting for.')
      },
      focus: {
        note:    t('สมองต้องการพื้นที่ว่าง เพื่อให้คิดได้ชัดขึ้น', 'Your head needs space to think clearly'),
        line:    t('ช่วงนี้สมองต้องการพื้นที่ว่างมากกว่าต้องการแรง', 'your head needs space more than it needs fuel'),
        meaning: t('เมื่อมีหลายเรื่องค้างอยู่พร้อมกัน สมองจะใช้พลังไปกับการสลับไปมามากกว่าการทำงานจริง การทำให้เสร็จทีละเรื่องช่วยได้มากกว่าการพยายามตั้งใจให้หนักขึ้น',
                  'With several things left open at once, most of the effort goes into switching between them rather than into the work. Finishing one thing at a time helps more than trying to concentrate harder.')
      },
      rest: {
        note:    t('ร่างกายต้องการเวลาพักฟื้นอย่างเต็มที่', 'Your body needs proper time to recover'),
        line:    t('ช่วงนี้ร่างกายต้องการเวลาฟื้นตัวอย่างชัดเจน', 'your body is plainly asking for recovery'),
        meaning: t('การพักที่ได้ผลไม่ได้วัดจากจำนวนชั่วโมง แต่วัดจากว่าร่างกายได้ผ่อนลงจริงหรือไม่ การพักสั้น ๆ อย่างตั้งใจและสม่ำเสมอ มักช่วยให้ฟื้นตัวได้ดีกว่ารอวันหยุดยาวที่เลื่อนออกไปเรื่อย ๆ',
                  'Rest that works is not measured in hours but in whether your body actually came down a level. Short, deliberate, regular breaks tend to restore more than a long holiday that keeps being postponed.')
      },
      reset: {
        note:    t('ชีวิตต้องการจังหวะใหม่ที่สมดุลกว่าเดิม', 'Your days need a new, steadier rhythm'),
        line:    t('ช่วงนี้คุณกำลังมองหาการเริ่มต้นจังหวะชีวิตใหม่', 'you are looking to reset the whole rhythm'),
        meaning: t('คำตอบของคุณไม่ได้ชี้ไปที่เรื่องใดเรื่องหนึ่ง แต่ชี้ว่าจังหวะชีวิตโดยรวมเสียสมดุล การเริ่มใหม่ไม่จำเป็นต้องเปลี่ยนทุกอย่าง เริ่มได้จากกิจวัตรเล็ก ๆ หนึ่งอย่างในแต่ละวันที่คุณทำได้จริง',
                  'Your answers do not point at one thing but at the overall rhythm. Starting again does not mean changing everything; it can start with one small daily habit you can genuinely keep.')
      }
    },

    // ---- 04 RECOMMENDATIONS ---------------------------------------------
    MATCH: {
      calm:   { tea: t('ชารสอ่อน กลิ่นเบา จิบช้า ๆ ตอนเย็น', 'Light, gentle tea, sipped slowly in the evening'),
                aroma: t('กลิ่นลาเวนเดอร์ หรือกลิ่นไม้หอม', 'Lavender, or soft woody scents'),
                ritual: t('หายใจออกให้ยาวกว่าหายใจเข้า 3 นาที ก่อนเริ่มงานและก่อนนอน', 'Three minutes of breathing out longer than you breathe in — before work and before bed') },
      energy: { tea: t('ชากลิ่นสดชื่น ดื่มช่วงเช้าถึงบ่ายต้น ๆ', 'A fresh, bright tea, from morning to early afternoon'),
                aroma: t('กลิ่นส้ม หรือเปปเปอร์มินต์', 'Citrus or peppermint'),
                ritual: t('ลุกเดินและยืดเส้น 2 นาที ทุกชั่วโมงที่ทำงาน', 'Two minutes of walking and stretching every working hour') },
      focus:  { tea: t('ชารสอ่อน ไม่หวาน จิบระหว่างวันทำงาน', 'A mild, unsweetened tea, sipped through the working day'),
                aroma: t('กลิ่นโรสแมรี หรือยูคาลิปตัส', 'Rosemary or eucalyptus'),
                ritual: t('ทำงานให้เสร็จทีละเรื่องก่อนเริ่มเรื่องใหม่ และพักสายตา 20 วินาทีทุก 20 นาที', 'Finish one thing before starting the next, and rest your eyes 20 seconds every 20 minutes') },
      rest:   { tea: t('ชาที่ไม่มีคาเฟอีน ดื่มช่วงค่ำ', 'A caffeine-free tea in the evening'),
                aroma: t('กลิ่นคาโมมายล์ หรือวานิลลา', 'Chamomile or vanilla'),
                ritual: t('ปิดหน้าจอก่อนนอน 1 ชั่วโมง และเข้านอนเวลาใกล้เคียงกันทุกวัน', 'Screens off an hour before bed, and the same bedtime most days') },
      reset:  { tea: t('ดื่มชาหนึ่งแก้วในเวลาเดิมทุกวัน ให้เป็นจุดตั้งต้นของวัน', 'One cup of tea at the same time each day, to anchor it'),
                aroma: t('กลิ่นตะไคร้หอม หรือขิง', 'Lemongrass or ginger'),
                ritual: t('มีช่วงเวลารีเซ็ตตัวเองวันละครั้งในเวลาเดิม สั้นแค่ไหนก็ได้ แต่ต้องทำจริง', 'One reset moment a day at the same time — short is fine, as long as it happens') }
    },

    LIFESTYLE_TIP: {
      screen:   t('ลุกพักสั้น ๆ 5 นาทีทุกชั่วโมง ดีกว่ารอพักทีเดียวตอนเลิกงาน', 'Get up for five minutes every hour, rather than waiting to rest after work'),
      people:   t('หลังประชุมหรือคุยงานหนัก ๆ ให้เวลาเงียบ ๆ กับตัวเอง 10 นาที', 'After a heavy meeting or conversation, give yourself ten quiet minutes'),
      travel:   t('เลือกกิจวัตรหนึ่งอย่าง แล้วทำให้เหมือนเดิมทุกวันไม่ว่าจะอยู่ที่ไหน', 'Pick one routine and keep it the same every day, wherever you are'),
      physical: t('ใส่เวลาพักฟื้นร่างกายไว้ในตารางงาน ไม่ต้องรอให้มีเวลาว่าง', 'Put recovery time in your schedule instead of waiting for free time'),
      decide:   t('เก็บเรื่องสำคัญที่ต้องตัดสินใจไว้ในช่วงที่หัวโล่งที่สุดของวัน', 'Save the important decisions for the clearest part of your day')
    },

    // ---- 05 WELLNESS ACTIVITIES -----------------------------------------
    // Real packages, linked to their real pages.
    PACKAGES: {
      tea:     { id: 'personalized-herbal-tea', label: t('Personalized Herbal Tea') },
      aroma:   { id: 'elemental-aroma-oil',     label: t('Elemental Aroma Oil') },
      sound:   { id: 'sound-healing',           label: t('Sound Healing') },
      yoga:    { id: 'yoga-meditation',         label: t('Yoga Meditation') },
      mandala: { id: 'flower-mandala',          label: t('Flower Mandala') },
      office:  { id: 'office-syndrome',         label: t('Office Syndrome Relief') }
    },
    // The broad answers to "what kind of activity". Hands-on has two
    // workshops; wellness.js picks between them by the rest preference.
    BY_INTEREST: { mind: 'mandala', meditation: 'yoga', relax: 'sound', knowledge: 'office', handson: 'tea' },
    // Used when the reader says "let B-Healthy suggest".
    BY_DIRECTION: { calm: 'sound', energy: 'yoga', focus: 'aroma', rest: 'sound', reset: 'tea' },
    // A preference maps to an experience too, and seconds the recommendation.
    BY_PREF: { tea: 'tea', aroma: 'aroma', sound: 'sound', movement: 'yoga', quiet: 'sound' },

    // ---- 07 THE OFFER ---------------------------------------------------
    // Everything about the giveaway lives here. Change the words, the sizes
    // or the turnaround without touching wellness.js.
    //
    // Why a taster and not a workshop: a workshop is THB 39,000–43,900 for a
    // class of 10–30. It is priced per organisation, not per seat, so giving
    // one away to an individual who answered a quiz means handing a stranger
    // forty thousand baht of trainer, materials and travel — and that person
    // is usually not the one who signs anything.
    //
    // So the offer splits on team size. Someone with a team gets a short
    // taster (60–90 minutes) cut from the three-hour class, which costs half a
    // trainer's day and only happens for a real prospect. Someone without one
    // is not turned away empty-handed; they get the online session. Nobody
    // leaves with nothing, and nobody leaves with THB 40,000.
    OFFER: {
      enabled: true,
      codePrefix: 'BH',
      replyWithin: t('ภายใน 2 วันทำการ', 'within 2 working days'),
      // The dividing line. Below it, the online session; on or above it, the
      // on-site taster for the team.
      teamThreshold: '10-30',
      // Lengths and how often sessions run are left to the call: promising
      // "45 minutes, monthly" here is a schedule the team then has to keep.
      title: t('รับเวิร์กช็อปฟรี สำหรับคุณหรือทีมของคุณ', 'Claim a free workshop for you or your team'),
      lead: t('ผลประเมินนี้เป็นเรื่องของคุณคนเดียว แต่ในทีมของคุณอาจมีอีกหลายคนที่กำลังรู้สึกแบบเดียวกัน',
              'This guide is about you, but others on your team may well be feeling the same.'),
      teamOffer: t('Trial Workshop สำหรับทีมของคุณ ไม่มีค่าใช้จ่าย',
                   'A free Trial Workshop for your team'),
      soloOffer: t('Online Mini Session ไม่มีค่าใช้จ่าย',
                   'A free Online Mini Session'),
      sizes: [
        { v: 'lt10',  label: t('น้อยกว่า 10 คน', 'Fewer than 10') },
        { v: '10-30', label: t('10–30 คน', '10–30') },
        { v: '31-100', label: t('31–100 คน', '31–100') },
        { v: '100+',  label: t('มากกว่า 100 คน', 'More than 100') }
      ],
      cta: t('รับสิทธิ์', 'Claim it'),
      doneTeam: t('เก็บรหัสนี้ไว้ ทีมของเราจะติดต่อกลับเพื่อนัดวันและจำนวนคน',
                  'Keep this code. Our team will be in touch to agree a date and numbers.'),
      doneSolo: t('เก็บรหัสนี้ไว้ ทีมของเราจะติดต่อกลับเพื่อแจ้งรอบที่ใกล้ที่สุด',
                  'Keep this code. Our team will be in touch with the next session date.')
    }
  };
})();
