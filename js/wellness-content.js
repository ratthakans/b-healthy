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
        tired:     t('ร่างกายกำลังบอกว่าใช้ไปเยอะกว่าที่เติมกลับ', 'your body is spending more than it gets back'),
        tense:     t('ความตึงยังค้างอยู่แม้ในเวลาที่ควรได้ผ่อน', 'the tension stays even when there is time to let go'),
        foggy:     t('ความคิดเดินตลอดจนแทบไม่มีช่วงว่างให้สมอง', 'your mind keeps running with almost no gap in between'),
        lowenergy: t('แรงที่มีไม่ค่อยพอกับสิ่งที่ต้องทำในแต่ละวัน', 'there is less in the tank than the day asks for'),
        okay:      t('ภาพรวมยังไปได้ดี และนี่คือจังหวะที่ดีที่จะดูแลไว้ก่อน', 'things are going well — a good moment to look after it before you have to')
      },
      energy: {
        steady:  t('พลังงานค่อนข้างสม่ำเสมอ', 'your energy holds fairly steady'),
        dips:    t('มีบางช่วงของวันที่แรงตกชัดเจน', 'there are hours of the day where it clearly drops'),
        swings:  t('จังหวะพลังงานขึ้นลงไม่ค่อยคาดเดาได้', 'the rhythm is hard to predict'),
        burns:   t('เริ่มต้นได้ดีแต่หมดเร็วกว่าที่ควร', 'you start well and run out sooner than you should'),
        drained: t('ความล้าอยู่กับคุณเกือบทั้งวัน', 'the tiredness is with you most of the day')
      },
      pain: {
        sleep:    t('โดยมีเรื่องการนอนเป็นตัวแปรหลัก', 'with sleep as the main variable'),
        stress:   t('โดยมีความเครียดเป็นตัวแปรหลัก', 'with stress as the main variable'),
        workload: t('โดยมีปริมาณงานเป็นตัวแปรหลัก', 'with workload as the main variable'),
        physical: t('โดยมีความล้าทางร่างกายเป็นตัวแปรหลัก', 'with physical fatigue as the main variable'),
        metime:   t('โดยมีเวลาส่วนตัวที่หายไปเป็นตัวแปรหลัก', 'with the missing personal time as the main variable')
      },
      work_type: {
        screen:   t('และงานหน้าจอทำให้ร่างกายอยู่ท่าเดิมนานกว่าที่รู้ตัว', 'and screen work holds your body in one position longer than you notice'),
        people:   t('และงานที่ต้องพบผู้คนใช้พลังงานทางใจมากกว่าที่คนภายนอกเห็น', 'and work with people spends more of you than it looks from outside'),
        travel:   t('และการเดินทางทำให้จังหวะในแต่ละวันไม่ค่อยคงที่', 'and travelling keeps the shape of your day from settling'),
        physical: t('และงานที่ใช้ร่างกายต้องการการฟื้นตัวที่ตั้งใจ', 'and physical work needs recovery you actually plan for'),
        decide:   t('และการตัดสินใจต่อเนื่องกินพลังสมองสะสมไปเรื่อย ๆ', 'and deciding all day quietly drains the same reserve')
      }
    },

    // ---- 02 + 03 DIRECTION / WHAT THIS MEANS ----------------------------
    DIRECTION: {
      calm: {
        line:    t('ช่วงนี้ร่างกายและใจกำลังมองหาความสงบ', 'right now you are looking for calm'),
        meaning: t('สิ่งที่คุณตอบชี้ไปที่ระบบที่ยังไม่ได้ลดความเร็วลงจริง ๆ ไม่ใช่เรื่องของการพักให้นานขึ้น แต่เป็นการหาจังหวะที่ร่างกายรู้ว่าปลอดภัยพอจะผ่อนได้',
                  'What you described points at a system that has not actually slowed down. This is less about resting longer and more about finding a moment your body reads as safe enough to let go.')
      },
      energy: {
        line:    t('ช่วงนี้สิ่งที่ขาดคือแรงที่ใช้ได้จริงในแต่ละวัน', 'what is short right now is usable day-to-day energy'),
        meaning: t('แรงที่หายไปมักไม่ได้มาจากการทำน้อยหรือมากเกินไปอย่างเดียว แต่มาจากจังหวะเติมที่ไม่สม่ำเสมอ การเติมเล็ก ๆ ที่เกิดขึ้นประจำมักได้ผลกว่าการพักยาวครั้งเดียว',
                  'Energy rarely disappears because of one big thing. It goes because the topping-up is irregular. Small refills that actually happen tend to beat one long break that keeps getting postponed.')
      },
      focus: {
        line:    t('ช่วงนี้สมองต้องการพื้นที่ว่างมากกว่าต้องการแรง', 'your head needs space more than it needs fuel'),
        meaning: t('เมื่อมีหลายเรื่องเปิดค้างไว้พร้อมกัน ความคิดจะใช้พลังงานไปกับการสลับไปมามากกว่าการทำงานจริง การปิดเรื่องทีละอย่างช่วยได้มากกว่าการพยายามตั้งใจให้หนักขึ้น',
                  'With several things left open at once, most of the effort goes into switching between them rather than into the work. Closing one thing at a time helps more than trying to concentrate harder.')
      },
      rest: {
        line:    t('ช่วงนี้ร่างกายขอเวลาฟื้นตัวอย่างชัดเจน', 'your body is asking for recovery, plainly'),
        meaning: t('การพักที่ได้ผลไม่ได้วัดจากจำนวนชั่วโมง แต่วัดจากการที่ร่างกายได้ลดระดับลงจริง ช่วงสั้น ๆ ที่ตั้งใจและเกิดขึ้นสม่ำเสมอ มักฟื้นได้ดีกว่าวันหยุดยาวที่เลื่อนออกไปเรื่อย ๆ',
                  'Rest that works is not measured in hours but in whether the body actually came down a level. Short, deliberate, regular tends to restore more than a long break that keeps moving.')
      },
      reset: {
        line:    t('ช่วงนี้คุณกำลังมองหาการตั้งต้นใหม่ทั้งจังหวะ', 'you are looking to reset the whole rhythm'),
        meaning: t('สิ่งที่คุณตอบไม่ได้ชี้ไปที่เรื่องใดเรื่องหนึ่ง แต่ชี้ไปที่จังหวะโดยรวมที่เสียสมดุล การเริ่มใหม่ไม่จำเป็นต้องรื้อทุกอย่าง มักเริ่มจากหมุดเล็ก ๆ หนึ่งจุดในแต่ละวันที่คุณควบคุมได้จริง',
                  'What you described does not point at one thing but at the overall rhythm. Starting again does not mean tearing everything up; it usually starts with one small fixed point in the day that is genuinely yours.')
      }
    },

    // ---- 04 YOUR WELLNESS MATCH -----------------------------------------
    MATCH: {
      calm:   { tea: t('ชากลุ่มกลิ่นอ่อน ดื่มช้า ๆ ตอนเย็น', 'Light, gentle teas, taken slowly in the evening'),
                aroma: t('กลิ่นกลุ่มลาเวนเดอร์และไม้หอม', 'Lavender and soft woods'),
                ritual: t('หายใจออกยาวกว่าหายใจเข้า สามนาที ก่อนเริ่มงานและก่อนนอน', 'Three minutes of breathing out longer than you breathe in — before work and before bed') },
      energy: { tea: t('ชากลิ่นสดชื่นในช่วงเช้าถึงบ่ายต้น', 'Brighter teas, morning to early afternoon'),
                aroma: t('กลิ่นกลุ่มส้มและเปปเปอร์มินต์', 'Citrus and peppermint'),
                ritual: t('ลุกเดินและยืดตัวสองนาทีทุกชั่วโมงทำงาน', 'Two minutes up and stretching, every working hour') },
      focus:  { tea: t('ชาที่ไม่หวานและไม่แรงเกินไป จิบระหว่างช่วงงาน', 'Unsweetened, not too strong, sipped between work blocks'),
                aroma: t('กลิ่นกลุ่มโรสแมรีและยูคาลิปตัส', 'Rosemary and eucalyptus'),
                ritual: t('จบทีละเรื่องก่อนเปิดเรื่องใหม่ และพักสายตา 20 วินาทีทุก 20 นาที', 'Finish one thing before opening the next, and rest your eyes 20 seconds every 20 minutes') },
      rest:   { tea: t('ชาไม่มีคาเฟอีนในช่วงค่ำ', 'Caffeine-free in the evening'),
                aroma: t('กลิ่นกลุ่มคาโมมายล์และวานิลลา', 'Chamomile and vanilla'),
                ritual: t('ปิดหน้าจอก่อนนอนหนึ่งชั่วโมง และให้เวลาเข้านอนใกล้เคียงกันทุกวัน', 'Screens off an hour before bed, and the same bedtime most days') },
      reset:  { tea: t('เลือกชาหนึ่งแก้วให้เป็นหมุดเวลาเดิมของทุกวัน', 'One cup at the same time each day, as a marker'),
                aroma: t('กลิ่นกลุ่มตะไคร้หอมและขิง', 'Lemongrass and ginger'),
                ritual: t('กำหนด Reset Moment วันละหนึ่งครั้ง เวลาเดิม สั้นก็ได้ แต่ต้องได้จริง', 'One reset moment a day, same time, short is fine as long as it happens') }
    },

    LIFESTYLE_TIP: {
      screen:   t('ตั้งช่วงพักสั้นคั่นระหว่าง Work Block แทนการรวบพักยาวทีเดียวตอนเย็น', 'Put short breaks between work blocks instead of saving it all for the evening'),
      people:   t('กันเวลาเงียบไว้สิบนาทีหลังการประชุมที่ใช้พลังงานมาก', 'Keep ten quiet minutes after the meetings that take the most out of you'),
      travel:   t('ยึดหนึ่งกิจวัตรให้เหมือนเดิมทุกวันแม้สถานที่จะเปลี่ยน', 'Hold one routine identical every day, wherever you wake up'),
      physical: t('ให้การฟื้นตัวเป็นส่วนหนึ่งของตาราง ไม่ใช่สิ่งที่ทำเมื่อเหลือเวลา', 'Put recovery in the schedule rather than in the time left over'),
      decide:   t('รวบการตัดสินใจสำคัญไว้ในช่วงที่สมองสดที่สุดของวัน', 'Group the decisions that matter into the clearest part of your day')
    },

    // ---- 05 YOUR EXPERIENCE MATCH ---------------------------------------
    // Real packages, linked to their real pages.
    PACKAGES: {
      tea:   { id: 'personalized-herbal-tea', label: t('Personalized Herbal Tea') },
      aroma: { id: 'elemental-aroma-oil',     label: t('Elemental Aroma Oil') },
      sound: { id: 'sound-healing',           label: t('Sound Healing') },
      yoga:  { id: 'yoga-meditation',         label: t('Yoga Meditation') }
    },
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
    // So the offer splits on team size. Someone with a team gets a 60–90
    // minute taster cut from the three-hour class, which costs half a
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
      title: t('และมีอีกอย่างสำหรับคุณ', 'And one more thing'),
      lead: t('ผลประเมินนี้บอกเรื่องของคุณคนเดียว แต่ในทีมคุณมีคนที่กำลังเจอแบบเดียวกันอีกกี่คน',
              'This guide is about you. How many people on your team are in the same place?'),
      teamOffer: t('เวิร์กช็อปทดลองให้ทีมของคุณ 60–90 นาที ไม่มีค่าใช้จ่าย',
                   'A 60–90 minute taster workshop for your team, at no cost'),
      soloOffer: t('มินิเซสชันออนไลน์ 45 นาที ไม่มีค่าใช้จ่าย จัดเดือนละครั้ง',
                   'A free 45-minute online session, once a month'),
      sizes: [
        { v: 'lt10',  label: t('น้อยกว่า 10 คน', 'Fewer than 10') },
        { v: '10-30', label: t('10–30 คน', '10–30') },
        { v: '31-100', label: t('31–100 คน', '31–100') },
        { v: '100+',  label: t('มากกว่า 100 คน', 'More than 100') }
      ],
      cta: t('รับสิทธิ์', 'Claim it'),
      doneTeam: t('เก็บรหัสนี้ไว้ ทีมของเราจะติดต่อกลับเพื่อนัดวันและจำนวนคน',
                  'Keep this code. Our team will be in touch to agree a date and numbers.'),
      doneSolo: t('เก็บรหัสนี้ไว้ ทีมของเราจะติดต่อกลับพร้อมรอบที่ใกล้ที่สุด',
                  'Keep this code. Our team will be in touch with the next session date.')
    }
  };
})();
