/* ============================================================
   B-Healthy — Blog articles (mock content for launch)
   Used by blog.html (listing) and post.html (article).

   Shape per article:
     id        slug used in post.html?id=
     category  filter pill on the listing (TH label via `en` for English)
     date      ISO — drives sort order, newest first
     cover     listing thumbnail + article hero
     body      ordered blocks: p | h2 | ul | quote | img

   Every block carries `th` (default) and `en`. Photos live in
   images/blog/ — see images/blog/CREDITS.md for sources.
   ============================================================ */

window.BLOG_POSTS = [

  /* ---------------------------------------------------------- */
  {
    id: "office-syndrome-signs",
    category: "Office Syndrome",
    categoryEn: "Office Syndrome",
    date: "2026-07-18",
    readMins: 6,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "ออฟฟิศซินโดรมไม่ใช่เรื่องของคนขี้บ่น",
    titleEn: "Office syndrome isn't just complaining",
    excerpt: "ปวดคอ บ่า ไหล่ ที่พนักงานบ่นกันทุกวัน มีที่มาทางกายภาพชัดเจน และแก้ได้ก่อนจะกลายเป็นอาการเรื้อรัง",
    excerptEn: "The neck and shoulder pain your team mentions every day has a clear physical cause — and it's fixable before it turns chronic.",
    cover: "images/blog/office-syndrome-1.jpg",
    coverAlt: "พนักงานใช้มือนวดต้นคอเพราะปวดเมื่อยจากการนั่งทำงาน",
    coverAltEn: "An office worker rubbing the back of their neck",
    body: [
      { type: "p",
        th: "คำว่า “ออฟฟิศซินโดรม” ไม่ใช่ชื่อโรคทางการแพทย์ แต่เป็นคำรวมที่ใช้เรียกกลุ่มอาการปวดกล้ามเนื้อและเยื่อพังผืดที่เกิดจากการอยู่ในท่าเดิมนาน ๆ โดยเฉพาะท่านั่งหน้าจอ อาการมักเริ่มจากความตึงเล็กน้อยตอนบ่าย แล้วค่อย ๆ กลายเป็นปวดตลอดวัน",
        en: "“Office syndrome” isn't a formal diagnosis — it's an umbrella term for the myofascial pain that builds up from holding one position for hours, especially in front of a screen. It usually starts as mild afternoon tightness and slowly becomes all-day pain." },
      { type: "p",
        th: "สิ่งที่ทำให้องค์กรมองข้ามคือมันไม่เคยทำให้ใครลาป่วยในวันแรก พนักงานจะทนไปเรื่อย ๆ จนถึงจุดที่ต้องไปกายภาพบำบัด ซึ่งตอนนั้นค่าใช้จ่ายและเวลาที่เสียไปสูงกว่าการป้องกันมาก",
        en: "The reason organisations miss it: nobody calls in sick on day one. People push through until they need physiotherapy — by which point the cost and lost time far exceed what prevention would have taken." },

      { type: "h2", th: "สัญญาณที่ควรจับตา", en: "Signs worth watching for" },
      { type: "ul", items: [
        { th: "ปวดตึงคอ บ่า ไหล่ ที่เป็นซ้ำ ๆ ในช่วงเวลาเดิมของวัน", en: "Recurring neck, shoulder or upper-back tightness at the same time each day" },
        { th: "ปวดหัวจากท้ายทอย โดยเฉพาะช่วงบ่ายแก่ ๆ", en: "Headaches starting at the base of the skull, typically late afternoon" },
        { th: "ชาหรือเสียวแปลบลงแขนและมือ", en: "Numbness or tingling running down the arm or into the hand" },
        { th: "ต้องขยับเก้าอี้หรือเปลี่ยนท่าบ่อยผิดปกติเพื่อให้นั่งได้", en: "Constantly shifting position or adjusting the chair just to stay comfortable" },
        { th: "ตาล้า แสบตา ร่วมกับอาการปวดต้นคอ", en: "Eye strain showing up alongside the neck pain" },
      ]},

      { type: "img", src: "images/blog/office-syndrome-2.jpg",
        alt: "พนักงานนั่งทำงานหน้าคอมพิวเตอร์ในท่าที่ล้าและเมื่อย",
        altEn: "A tired employee slumped at a laptop",
        caption: { th: "ท่านั่งที่คอยื่นไปข้างหน้าเพิ่มภาระให้กล้ามเนื้อคอหลายเท่าตัว", en: "A forward-head posture multiplies the load the neck muscles have to carry." } },

      { type: "h2", th: "แก้ที่ต้นเหตุ ไม่ใช่แค่ปลายทาง", en: "Fix the cause, not just the symptom" },
      { type: "p",
        th: "การนวดช่วยให้อาการดีขึ้นชั่วคราว แต่ถ้ากลับไปนั่งท่าเดิมบนโต๊ะที่สูงไม่พอดี อาการจะกลับมาภายในไม่กี่วัน สิ่งที่เปลี่ยนผลลัพธ์ระยะยาวคือสามอย่าง: ปรับโต๊ะและจอให้ตรงกับสรีระของแต่ละคน ตั้งจังหวะลุกขยับทุก 45–60 นาที และเพิ่มความแข็งแรงให้กล้ามเนื้อหลังส่วนบน",
        en: "Massage relieves the symptom, but if someone returns to the same desk at the same wrong height, it comes back within days. Three things change the long-term picture: fit the desk and monitor to the individual, build in a movement break every 45–60 minutes, and strengthen the upper back." },
      { type: "quote",
        th: "อาการที่สะสมมาเป็นปี ไม่หายด้วยการนวดครั้งเดียว แต่หายได้ด้วยการเปลี่ยนสิ่งที่ทำซ้ำทุกวัน",
        en: "Pain that took a year to build doesn't clear in one massage — it clears when the daily habit changes." },
      { type: "p",
        th: "ในเวิร์กชอป Office Syndrome Prevention ของ B-Healthy เราเริ่มจากประเมินอาการรายบุคคล แล้วสอนท่ายืดที่ทำได้จริงข้างโต๊ะ พร้อมปรับจุดตั้งอุปกรณ์ให้เหมาะกับแต่ละคนหน้างาน",
        en: "In B-Healthy's Office Syndrome Prevention workshop we start with an individual assessment, teach stretches that genuinely work at the desk, and adjust each person's setup on the spot." },
      { type: "img", src: "images/blog/office-syndrome-3.jpg",
        alt: "พนักงานยืดเหยียดร่างกายข้างโต๊ะทำงาน",
        altEn: "An employee stretching beside their desk",
        caption: { th: "ท่ายืดที่ดีที่สุดคือท่าที่ทำได้โดยไม่ต้องลุกจากโต๊ะ เพราะมันจะถูกทำจริง", en: "The best stretch is the one you can do without leaving the desk — because it actually gets done." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "sound-healing-explained",
    category: "กาย & ใจ",
    categoryEn: "Body & Mind",
    date: "2026-07-04",
    readMins: 5,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "เสียงบำบัดทำงานกับร่างกายเราอย่างไร",
    titleEn: "How sound healing actually works on the body",
    excerpt: "ไม่ใช่เรื่องลึกลับ — คลื่นเสียงต่อเนื่องช่วยพาระบบประสาทออกจากโหมดตื่นตัว และนั่นคือจุดที่ร่างกายเริ่มฟื้นฟูตัวเอง",
    excerptEn: "Nothing mystical about it — sustained tones help the nervous system leave alert mode, and that's where recovery begins.",
    cover: "images/blog/sound-healing-1.jpg",
    coverAlt: "ผู้ฝึกใช้ขันสวดทิเบตในการทำสมาธิและเสียงบำบัด",
    coverAltEn: "A practitioner playing Tibetan singing bowls during a session",
    body: [
      { type: "p",
        th: "Sound Healing คือการใช้เสียงที่มีความถี่สม่ำเสมอ เช่น ขันสวดทิเบต ฆ้อง หรือระฆัง สร้างคลื่นเสียงต่อเนื่องยาว ๆ ให้ผู้ฟังจดจ่ออยู่กับมัน สิ่งที่เกิดขึ้นไม่ใช่เวทมนตร์ แต่เป็นกลไกเดียวกับที่ทำให้เราสงบลงเวลาฟังเสียงฝนหรือเสียงคลื่น",
        en: "Sound healing uses steady, sustained tones — Tibetan bowls, gongs, chimes — to give attention something simple to rest on. The mechanism isn't mystical; it's the same one that settles you when you listen to rain or waves." },
      { type: "p",
        th: "เมื่อสมองมีสิ่งเดียวให้จับ ความคิดที่วนซ้ำจะเบาลง การหายใจช้าลงเอง และระบบประสาทพาราซิมพาเทติกซึ่งดูแลเรื่องการพักผ่อนและย่อยอาหารจะเริ่มทำงานเด่นขึ้นแทนโหมดสู้หรือหนี",
        en: "When the mind has one thing to hold, looping thoughts quieten, breathing slows on its own, and the parasympathetic nervous system — the rest-and-digest side — takes over from fight-or-flight." },

      { type: "img", src: "images/blog/sound-healing-2.jpg",
        alt: "มือประคองขันสวดทิเบตระหว่างการทำเสียงบำบัด",
        altEn: "Hands cradling a Tibetan singing bowl",
        caption: { th: "เสียงยาวต่อเนื่องคือจุดยึดของความสนใจ ไม่ต่างจากลมหายใจในการฝึกสมาธิ", en: "A long sustained tone works as an anchor for attention, much like the breath in meditation." } },

      { type: "h2", th: "เหมาะกับใครในองค์กร", en: "Who it suits in a workplace" },
      { type: "ul", items: [
        { th: "ทีมที่เพิ่งผ่านช่วงงานหนักหรือปิดโปรเจกต์ใหญ่", en: "Teams coming off a crunch or a big launch" },
        { th: "คนที่นั่งสมาธิไม่ได้เพราะ “คิดเยอะเกินไป” — เสียงช่วยให้เกาะง่ายกว่า", en: "People who can't meditate because their mind won't stop — sound gives it something easier to hold" },
        { th: "กิจกรรมปิดท้ายวันเวิร์กชอป ที่ต้องการให้ทุกคนกลับบ้านในสภาพผ่อนคลาย", en: "A closing activity, when you want everyone to leave genuinely unwound" },
      ]},
      { type: "p",
        th: "ข้อควรรู้: ผู้ที่ใส่เครื่องช่วยฟัง มีอาการไวต่อเสียง หรือกำลังตั้งครรภ์ ควรแจ้งผู้นำกิจกรรมก่อนเริ่ม เพื่อปรับระยะห่างและระดับเสียงให้เหมาะสม",
        en: "One practical note: anyone with a hearing aid, sound sensitivity, or who is pregnant should tell the facilitator beforehand so the volume and seating distance can be adjusted." },
      { type: "img", src: "images/blog/sound-healing-3.jpg",
        alt: "ผู้เข้าร่วมใช้ขันสวดทิเบตเพื่อการผ่อนคลายในร่ม",
        altEn: "A participant using a Tibetan singing bowl indoors",
        caption: { th: "หนึ่งรอบใช้เวลาประมาณ 45 นาที และไม่ต้องเปลี่ยนชุดหรือเตรียมอะไรมาก่อน", en: "A session runs about 45 minutes, with nothing to change into and nothing to prepare." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "desk-yoga-15-minutes",
    category: "ขยับร่างกาย",
    categoryEn: "Movement",
    date: "2026-06-20",
    readMins: 5,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "โยคะ 15 นาที ที่ทำได้จริงข้างโต๊ะทำงาน",
    titleEn: "A 15-minute yoga set that actually works at a desk",
    excerpt: "ไม่ต้องเปลี่ยนชุด ไม่ต้องมีเสื่อ และไม่ต้องจองห้องประชุม — ชุดท่าที่ออกแบบมาให้ทำได้ระหว่างวันทำงานจริง",
    excerptEn: "No changing clothes, no mat, no meeting room to book — a sequence built for a real working day.",
    cover: "images/blog/office-yoga-1.jpg",
    coverAlt: "ผู้หญิงฝึกโยคะและสมาธิในห้องที่มีแสงธรรมชาติ",
    coverAltEn: "A woman practising yoga indoors in natural light",
    body: [
      { type: "p",
        th: "อุปสรรคที่แท้จริงของการออกกำลังกายในที่ทำงานไม่ใช่เวลา แต่คือแรงเสียดทาน ถ้าต้องเปลี่ยนชุด หาเสื่อ และจองห้อง โอกาสที่จะเกิดขึ้นจริงแทบเป็นศูนย์ ชุดท่าที่ได้ผลจึงต้องเริ่มได้ภายในสิบวินาทีจากเก้าอี้ที่นั่งอยู่",
        en: "The real barrier to moving at work isn't time — it's friction. If it requires changing clothes, finding a mat and booking a room, it won't happen. A sequence that sticks has to start within ten seconds, from the chair you're already in." },

      { type: "h2", th: "ชุดท่า 15 นาที", en: "The 15-minute set" },
      { type: "ul", items: [
        { th: "หายใจลึก 2 นาที — นั่งหลังตรง เท้าแตะพื้น หายใจเข้า 4 จังหวะ ออก 6 จังหวะ", en: "Two minutes of breathing — sit tall, feet flat, inhale for four counts, exhale for six" },
        { th: "ยืดคอด้านข้าง 3 นาที — เอียงศีรษะค้างข้างละ 30 วินาที ไม่ดึงแรง", en: "Three minutes of side-neck stretch — hold 30 seconds each side, never pull" },
        { th: "หมุนไหล่และเปิดอก 3 นาที — ประสานมือไว้ด้านหลัง ดึงไหล่ลง", en: "Three minutes of shoulder rolls and chest opening — clasp hands behind the back, draw the shoulders down" },
        { th: "บิดตัวบนเก้าอี้ 3 นาที — หันลำตัวไปด้านข้าง จับพนักเก้าอี้ ค้างไว้", en: "Three minutes of seated twists — turn to one side, hold the chair back, breathe" },
        { th: "ยืนยืดหลังและขา 3 นาที — ก้มแตะปลายเท้าช้า ๆ แล้วค่อยยืดตัวขึ้น", en: "Three minutes standing — fold forward slowly, then roll back up one vertebra at a time" },
        { th: "นั่งนิ่ง 1 นาที — ไม่ต้องทำอะไร แค่สังเกตลมหายใจ", en: "One minute sitting still — nothing to do but notice the breath" },
      ]},

      { type: "img", src: "images/blog/office-yoga-2.jpg",
        alt: "ผู้ฝึกนั่งสมาธิบนเสื่อโยคะ",
        altEn: "A person meditating on a yoga mat",
        caption: { th: "หนึ่งนาทีสุดท้ายสำคัญที่สุด — เป็นช่วงที่ระบบประสาทได้เปลี่ยนโหมดจริง ๆ", en: "That last minute matters most — it's when the nervous system actually shifts gear." } },

      { type: "p",
        th: "ทำวันละครั้งได้ผลมากกว่าทำสัปดาห์ละสามชั่วโมงในวันหยุด เพราะปัญหาที่เราแก้คือการอยู่ท่าเดิมนาน ไม่ใช่การขาดการออกกำลังกาย",
        en: "Once a day beats three hours at the weekend, because the problem we're solving is staying in one position — not a lack of exercise." },
      { type: "img", src: "images/blog/office-yoga-3.jpg",
        alt: "กลุ่มพนักงานยืดเหยียดร่างกายร่วมกันในคลาสกลุ่ม",
        altEn: "A group stretching together in a class",
        caption: { th: "ทำเป็นกลุ่มช่วยให้เกิดขึ้นจริง เพราะไม่มีใครอยากเป็นคนเดียวที่ไม่ลุก", en: "Doing it as a group helps it stick — nobody wants to be the only one still sitting." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "food-as-medicine-lunch",
    category: "โภชนาการ",
    categoryEn: "Nutrition",
    date: "2026-06-06",
    readMins: 6,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "อาหารเป็นยา เริ่มที่มื้อกลางวันของพนักงาน",
    titleEn: "Food as medicine starts with the team lunch",
    excerpt: "อาการง่วงบ่ายสองไม่ได้มาจากงานน่าเบื่อเสมอไป มื้อกลางวันที่เลือกไว้ตอนเที่ยงมีส่วนมากกว่าที่คิด",
    excerptEn: "The 2pm slump isn't always the work. What went on the plate at noon has more to do with it than most people think.",
    cover: "images/blog/food-as-medicine-1.jpg",
    coverAlt: "ผักสดหลากชนิดจัดวางบนพื้นหลังสว่าง",
    coverAltEn: "An overhead spread of fresh vegetables and herbs",
    body: [
      { type: "p",
        th: "แนวคิด “อาหารเป็นยา” ไม่ได้แปลว่าต้องกินคลีนตลอดชีวิต แต่หมายถึงการเลือกอาหารที่ทำให้ร่างกายทำงานได้ดีในบริบทของวันนั้น สำหรับคนทำงานออฟฟิศ บริบทที่สำคัญที่สุดคือช่วงบ่ายที่ต้องใช้สมาธิยาว",
        en: "“Food as medicine” doesn't mean eating clean forever. It means choosing food that lets the body work well in the context of that particular day — and for office workers, the context that matters most is a long afternoon that needs sustained focus." },
      { type: "p",
        th: "มื้อกลางวันที่เป็นข้าวขาวจานใหญ่กับของทอด มักตามมาด้วยการง่วงหนักในหนึ่งชั่วโมง เพราะน้ำตาลในเลือดขึ้นเร็วแล้วลงเร็ว การเพิ่มโปรตีน ผัก และไขมันดีในจานเดียวกันช่วยให้กราฟนั้นราบขึ้น",
        en: "A big plate of white rice and something fried tends to be followed by a heavy slump within the hour — blood sugar spikes, then drops. Adding protein, vegetables and some good fat to the same plate flattens that curve." },

      { type: "img", src: "images/blog/food-as-medicine-2.jpg",
        alt: "ผักและสมุนไพรสดในตลาด",
        altEn: "Fresh herbs and vegetables at a market stall",
        caption: { th: "วัตถุดิบท้องถิ่นตามฤดูกาลมักสดกว่า ถูกกว่า และเข้ากับสภาพอากาศบ้านเรามากกว่า", en: "Local, seasonal produce is usually fresher, cheaper, and better suited to the climate we actually live in." } },

      { type: "h2", th: "สามอย่างที่องค์กรทำได้เลย", en: "Three things a company can change this month" },
      { type: "ul", items: [
        { th: "เพิ่มตัวเลือกที่มีผักและโปรตีนในร้านค้าหรือ catering ประจำ ไม่ต้องเอาของเดิมออก", en: "Add options with vegetables and protein to the regular canteen or catering list — no need to remove anything" },
        { th: "จัดน้ำเปล่าให้เข้าถึงง่ายกว่าน้ำหวาน ตำแหน่งที่วางมีผลจริง", en: "Make water easier to reach than sweetened drinks — placement genuinely changes behaviour" },
        { th: "เลี่ยงประชุมยาวคาบเที่ยง ให้คนได้กินโดยไม่ต้องรีบ", en: "Stop scheduling long meetings across lunch so people can eat without rushing" },
      ]},
      { type: "quote",
        th: "ไม่มีใครเปลี่ยนพฤติกรรมการกินเพราะโปสเตอร์ติดผนัง แต่เปลี่ยนเพราะตัวเลือกที่ดีอยู่ใกล้มือกว่า",
        en: "Nobody changes how they eat because of a poster on the wall. They change because the better option is the easier one to reach." },
      { type: "img", src: "images/blog/food-as-medicine-3.jpg",
        alt: "มะเขือเทศเชอร์รีและสมุนไพรสดบนโต๊ะไม้",
        altEn: "Cherry tomatoes and herbs on a rustic table",
        caption: { th: "ในโปรแกรม Retreat เราให้แพทย์แผนไทยออกแบบเมนูตามธาตุเจ้าเรือนของแต่ละกลุ่ม", en: "On our retreats, Thai traditional physicians design the menu around each group's element profile." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "burnout-early-signals",
    category: "กาย & ใจ",
    categoryEn: "Body & Mind",
    date: "2026-05-23",
    readMins: 7,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "หมดไฟไม่ใช่ขี้เกียจ: สัญญาณที่ HR ควรอ่านออก",
    titleEn: "Burnout isn't laziness — the signals HR should be reading",
    excerpt: "คนที่กำลังหมดไฟมักไม่ใช่คนที่ทำงานน้อยที่สุด แต่เป็นคนที่เคยทุ่มเทมากที่สุดในทีม",
    excerptEn: "The person burning out is rarely the one doing least. More often it's the one who used to give the most.",
    cover: "images/blog/burnout-1.jpg",
    coverAlt: "พนักงานซบหน้าลงบนโต๊ะทำงานด้วยความเหนื่อยล้า",
    coverAltEn: "An exhausted employee resting their head on a desk",
    body: [
      { type: "p",
        th: "ภาวะหมดไฟถูกจัดเป็นปรากฏการณ์ที่เกิดจากความเครียดเรื้อรังในที่ทำงานซึ่งไม่ได้รับการจัดการ ไม่ใช่ปัญหาของนิสัยส่วนตัว ลักษณะเด่นสามอย่างคือ พลังงานหมด ระยะห่างทางใจจากงานที่เพิ่มขึ้น และความรู้สึกว่าตัวเองทำได้ไม่ดีพอ",
        en: "Burnout is understood as a syndrome arising from chronic workplace stress that hasn't been managed — not a personality flaw. It shows up in three ways: energy depletion, growing mental distance from the job, and a sinking sense of ineffectiveness." },
      { type: "p",
        th: "สิ่งที่ทำให้ตรวจจับยากคือมันไม่ได้เริ่มจากการทำงานน้อยลง แต่มักเริ่มจากการทำงานหนักขึ้นเพื่อชดเชยความรู้สึกว่ายังไม่ดีพอ กว่าจะเห็นผลกระทบต่อผลงาน คนคนนั้นก็มักผ่านช่วงที่เหนื่อยที่สุดมานานแล้ว",
        en: "What makes it hard to spot is that it doesn't begin with someone doing less. It usually begins with them doing more, to compensate for feeling they aren't good enough. By the time output visibly drops, the hardest stretch is long past." },

      { type: "h2", th: "สัญญาณที่มักมาก่อนผลงานตก", en: "Signals that arrive before performance does" },
      { type: "ul", items: [
        { th: "หยุดเสนอไอเดียในที่ประชุม ทั้งที่เคยเป็นคนพูดมากที่สุด", en: "Stops offering ideas in meetings, having previously been the loudest voice" },
        { th: "ตอบอีเมลและแชตช้าลงอย่างเห็นได้ชัด", en: "Noticeably slower to reply to email and chat" },
        { th: "เริ่มลาป่วยเป็นวัน ๆ กระจาย ไม่ใช่ลายาว", en: "Scattered single sick days rather than one long absence" },
        { th: "ประชดประชันหรือพูดถึงงานด้วยน้ำเสียงเย็นชาผิดปกติ", en: "Cynicism, or an unusually flat tone when talking about the work" },
        { th: "ไม่ใช้วันลาพักร้อนที่มีอยู่", en: "Leaves accrued holiday untouched" },
      ]},

      { type: "img", src: "images/blog/burnout-2.jpg",
        alt: "พนักงานเหนื่อยล้าซบโต๊ะท่ามกลางเอกสารกองโต",
        altEn: "A worn-out employee slumped over a desk covered in paperwork",
        caption: { th: "ภาระงานที่ไม่มีจุดสิ้นสุดที่ชัดเจน คือปัจจัยที่พบบ่อยที่สุด", en: "Workload with no visible finish line is the most common driver." } },

      { type: "h2", th: "สิ่งที่ช่วยได้จริง", en: "What genuinely helps" },
      { type: "p",
        th: "กิจกรรมผ่อนคลายช่วยฟื้นพลังงานได้ แต่ไม่ได้แก้สาเหตุ ถ้าโครงสร้างงานยังเหมือนเดิม คนจะกลับไปหมดไฟซ้ำภายในไม่กี่เดือน สิ่งที่เปลี่ยนผลลัพธ์จริงคือความชัดเจนของขอบเขตงาน การกระจายภาระที่เป็นธรรม และหัวหน้าที่ถามไถ่ก่อนจะสาย",
        en: "Recovery activities restore energy, but they don't remove the cause. If the structure of the work stays the same, people burn out again within months. What actually changes the outcome is clear scope, fair distribution of load, and managers who ask before it's late." },
      { type: "quote",
        th: "การพาทีมไป Retreat หนึ่งครั้ง ช่วยให้คนหายเหนื่อย แต่การกลับมาเจอภาระงานเท่าเดิม จะพากลับไปที่เดิม",
        en: "One retreat helps people recover. Returning to an unchanged workload takes them right back." },
      { type: "img", src: "images/blog/burnout-3.jpg",
        alt: "พนักงานนั่งเหนื่อยล้าอยู่หน้าโต๊ะทำงานในออฟฟิศ",
        altEn: "An employee sitting exhausted at an office desk",
        caption: { th: "ถามก่อนที่ผลงานจะตก คือจุดที่ต้นทุนต่ำที่สุดสำหรับทุกฝ่าย", en: "Asking before output drops is the cheapest moment for everyone involved." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "sleep-hidden-cost",
    category: "การฟื้นฟู",
    categoryEn: "Recovery",
    date: "2026-05-09",
    readMins: 5,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "นอนไม่พอ คือต้นทุนที่องค์กรมองไม่เห็น",
    titleEn: "Sleep debt is the cost nobody puts on the balance sheet",
    excerpt: "ไม่มีใครลาป่วยเพราะนอนไม่พอ แต่ผลของมันปรากฏในทุกการตัดสินใจตลอดทั้งวัน",
    excerptEn: "Nobody calls in sick for poor sleep — but it shows up in every decision made that day.",
    cover: "images/blog/sleep-1.jpg",
    coverAlt: "ผู้หญิงนอนหลับสบายในแสงเช้าที่นุ่มนวล",
    coverAltEn: "A woman sleeping peacefully in soft morning light",
    body: [
      { type: "p",
        th: "การอดนอนสะสมส่งผลชัดเจนต่อความจำระยะสั้น การควบคุมอารมณ์ และความสามารถในการประเมินความเสี่ยง ที่น่ากังวลคือคนที่นอนไม่พอมักประเมินความสามารถของตัวเองสูงกว่าความเป็นจริง จึงไม่รู้ตัวว่ากำลังทำงานได้แย่ลง",
        en: "Accumulated sleep debt measurably affects short-term memory, emotional regulation, and risk assessment. The troubling part: under-slept people tend to rate their own performance higher than it is, so they don't notice the decline." },

      { type: "h2", th: "ทำไมพนักงานถึงนอนไม่หลับ ทั้งที่เหนื่อย", en: "Why exhausted people still can't sleep" },
      { type: "p",
        th: "ความเหนื่อยกับความง่วงไม่ใช่สิ่งเดียวกัน หลังวันที่เครียด ร่างกายยังอยู่ในโหมดตื่นตัว ระดับความตื่นตัวที่ค้างอยู่ทำให้หลับยากแม้จะล้ามาก การเลื่อนดูมือถือบนเตียงยิ่งยืดเวลานั้นออกไป",
        en: "Tired and sleepy aren't the same state. After a stressful day the body is still in alert mode, and that lingering arousal makes falling asleep hard no matter how drained you feel. Scrolling in bed stretches it out further." },

      { type: "img", src: "images/blog/sleep-2.jpg",
        alt: "ชายนอนหลับในห้องนอนที่มีแสงเช้าส่องเข้ามา",
        altEn: "A man asleep in a sunlit bedroom",
        caption: { th: "แสงธรรมชาติตอนเช้าเป็นตัวตั้งนาฬิกาชีวภาพที่ทรงพลังที่สุด และไม่มีค่าใช้จ่าย", en: "Morning daylight is the strongest — and cheapest — way to reset the body clock." } },

      { type: "h2", th: "สิ่งที่องค์กรควบคุมได้", en: "Levers the organisation actually controls" },
      { type: "ul", items: [
        { th: "วัฒนธรรมการส่งข้อความนอกเวลางาน — กำหนดให้ชัดว่าอะไรรอถึงพรุ่งนี้ได้", en: "After-hours messaging culture — be explicit about what can wait until tomorrow" },
        { th: "ตารางกะและการเดินทาง ที่ไม่บีบเวลานอนเกินไป", en: "Shift patterns and travel schedules that don't squeeze sleep" },
        { th: "แสงในออฟฟิศช่วงเช้า ยิ่งสว่างและใกล้แสงธรรมชาติยิ่งดี", en: "Morning light in the office — the brighter and closer to daylight, the better" },
        { th: "กิจกรรมผ่อนคลายช่วงเย็นในวันประชุมยาว เช่น Sound Healing หรือสมาธิสั้น ๆ", en: "An evening wind-down on long meeting days — sound healing or a short meditation" },
      ]},
      { type: "img", src: "images/blog/sleep-3.jpg",
        alt: "ผู้ใหญ่สวมผ้าปิดตานอนพักผ่อน",
        altEn: "An adult resting with a sleep mask on",
        caption: { th: "งีบสั้น 15–20 นาทีช่วยฟื้นความตื่นตัว โดยไม่รบกวนการนอนกลางคืน", en: "A 15–20 minute nap restores alertness without disrupting that night's sleep." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "elemental-aroma-oil",
    category: "ภูมิปัญญาไทย",
    categoryEn: "Thai Wisdom",
    date: "2026-04-25",
    readMins: 6,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "ธาตุเจ้าเรือน: ทำไมกลิ่นที่ใช่ของแต่ละคนไม่เหมือนกัน",
    titleEn: "Elemental constitution: why the right scent differs per person",
    excerpt: "แนวคิดธาตุเจ้าเรือนในการแพทย์แผนไทย ใช้อธิบายได้ว่าทำไมกลิ่นเดียวกันทำให้คนหนึ่งผ่อนคลาย แต่อีกคนกลับอึดอัด",
    excerptEn: "The Thai traditional idea of a governing element explains why one scent relaxes one person and unsettles another.",
    cover: "images/blog/elemental-aroma-1.jpg",
    coverAlt: "ขวดน้ำมันหอมระเหยและสมุนไพรแห้งจัดวางบนพื้นผิวสีขาว",
    coverAltEn: "Essential oil bottles and dried herbs arranged on a white surface",
    body: [
      { type: "p",
        th: "การแพทย์แผนไทยมองว่าร่างกายประกอบด้วยธาตุสี่ ได้แก่ ดิน น้ำ ลม และไฟ โดยแต่ละคนจะมี “ธาตุเจ้าเรือน” ที่เด่นกว่าธาตุอื่น ซึ่งสัมพันธ์กับเดือนเกิด ลักษณะร่างกาย และแนวโน้มการเจ็บป่วยที่พบบ่อย",
        en: "Thai traditional medicine views the body as composed of four elements — earth, water, wind and fire — with one dominant in each person. That governing element relates to birth month, physical build, and the ailments they're most prone to." },
      { type: "p",
        th: "เมื่อนำแนวคิดนี้มาใช้กับน้ำมันหอมระเหย หลักการคือเลือกกลิ่นที่ช่วยปรับสมดุลธาตุที่กำลังแปรปรวน ไม่ใช่เลือกกลิ่นที่ “หอมที่สุด” ซึ่งอธิบายได้ว่าทำไมกลิ่นลาเวนเดอร์ที่ใครหลายคนบอกว่าผ่อนคลาย กลับทำให้บางคนรู้สึกหนักหัว",
        en: "Applied to essential oils, the principle is to pick a scent that rebalances whichever element is out of sorts — not simply the one that smells nicest. It explains why lavender, which so many people find calming, leaves others feeling heavy-headed." },

      { type: "img", src: "images/blog/elemental-aroma-2.jpg",
        alt: "น้ำมันหอมระเหย เทียน และลาเวนเดอร์จัดวางในบรรยากาศผ่อนคลาย",
        altEn: "Essential oils, candles and lavender in a calming arrangement",
        caption: { th: "กลิ่นเดียวกันให้ผลต่างกันในแต่ละคน — จุดเริ่มต้นจึงควรเป็นการประเมินก่อนเลือก", en: "The same scent lands differently on different people — which is why assessment should come before selection." } },

      { type: "h2", th: "ในเวิร์กชอปเกิดอะไรขึ้นบ้าง", en: "What happens in the workshop" },
      { type: "ul", items: [
        { th: "ตรวจธาตุเจ้าเรือนรายบุคคลโดยแพทย์แผนไทย", en: "An individual element assessment by a Thai traditional physician" },
        { th: "เรียนรู้กลุ่มกลิ่นที่เข้ากับธาตุของตัวเอง", en: "Learning which scent families suit your own element" },
        { th: "ผสมน้ำมันหอมระเหยสูตรเฉพาะบุคคล กลับไปใช้ต่อที่บ้านหรือที่โต๊ะทำงาน", en: "Blending a personal oil to take back to your desk or home" },
      ]},
      { type: "p",
        th: "ข้อควรระวังตามหลักความปลอดภัย: น้ำมันหอมระเหยเข้มข้นควรเจือจางในน้ำมันตัวพาก่อนสัมผัสผิวเสมอ ผู้ตั้งครรภ์ ผู้มีโรคประจำตัว หรือผู้ที่แพ้ง่าย ควรปรึกษาผู้เชี่ยวชาญก่อนใช้",
        en: "A safety note: concentrated essential oils should always be diluted in a carrier oil before skin contact, and anyone pregnant, managing a medical condition, or prone to allergies should check with a professional first." },
      { type: "img", src: "images/blog/elemental-aroma-3.jpg",
        alt: "สมุนไพรแห้งหลากชนิดบนช้อนไม้",
        altEn: "Assorted dried herbs on wooden spoons",
        caption: { th: "สมุนไพรแต่ละชนิดถูกจัดกลุ่มตามฤทธิ์ร้อน–เย็น ซึ่งเป็นหัวใจของการปรับสมดุลธาตุ", en: "Herbs are grouped by warming or cooling action — the core of how the elements are rebalanced." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "measuring-wellness-roi",
    category: "องค์กร",
    categoryEn: "Corporate",
    date: "2026-04-11",
    readMins: 7,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "วัดผล Corporate Wellness อย่างไรให้ผู้บริหารเห็นภาพ",
    titleEn: "Measuring corporate wellness so leadership can see it",
    excerpt: "“พนักงานชอบมาก” ไม่พอจะขออนุมัติงบปีหน้า นี่คือตัวเลขที่เก็บได้จริงโดยไม่ต้องลงทุนระบบใหม่",
    excerptEn: "“People loved it” won't secure next year's budget. Here are the numbers you can collect without buying a new system.",
    cover: "images/blog/wellness-roi-1.jpg",
    coverAlt: "ทีมผู้บริหารประชุมวิเคราะห์ข้อมูลและกราฟร่วมกัน",
    coverAltEn: "A team reviewing charts and data together in a meeting",
    body: [
      { type: "p",
        th: "ปัญหาที่พบบ่อยของโปรแกรม Wellness ในองค์กรไทยไม่ใช่คุณภาพของกิจกรรม แต่คือการวัดผล เมื่อถึงรอบงบประมาณ สิ่งที่ HR มีอยู่ในมือมักเป็นแบบประเมินความพึงพอใจ ซึ่งไม่พอจะเทียบกับตัวเลขจากฝ่ายอื่น",
        en: "The usual failure point for wellness programmes isn't the quality of the activities — it's measurement. When budget season arrives, HR is often holding satisfaction scores, which don't compare well against the numbers other departments bring." },

      { type: "h2", th: "ตัวเลขที่มีอยู่แล้วในระบบ HR", en: "Numbers already sitting in your HR system" },
      { type: "ul", items: [
        { th: "อัตราการลาป่วยต่อหัวต่อไตรมาส เทียบก่อน–หลังโปรแกรม", en: "Sick days per head per quarter, before and after the programme" },
        { th: "อัตราการลาออกโดยสมัครใจ แยกตามทีมที่เข้าและไม่เข้าร่วม", en: "Voluntary turnover, split between teams that took part and those that didn't" },
        { th: "การใช้สิทธิ์ประกันกลุ่มในหมวดกล้ามเนื้อและกระดูก", en: "Group insurance claims in the musculoskeletal category" },
        { th: "อัตราการเข้าร่วมกิจกรรมซ้ำ ซึ่งบอกความสมัครใจได้ดีกว่าคะแนนความพึงพอใจ", en: "Repeat participation rate — a better signal of genuine buy-in than a satisfaction score" },
      ]},

      { type: "img", src: "images/blog/wellness-roi-2.jpg",
        alt: "กลุ่มคนทำงานหลากหลายประชุมร่วมกันในออฟฟิศสมัยใหม่",
        altEn: "A diverse group of professionals in a modern office meeting",
        caption: { th: "เก็บข้อมูลก่อนเริ่มโปรแกรมเสมอ — ถ้าไม่มีเส้นฐาน ก็ไม่มีอะไรให้เทียบ", en: "Always capture a baseline before the programme starts — without one there's nothing to compare against." } },

      { type: "h2", th: "กรอบการวัดที่ใช้ได้จริง", en: "A framework that survives contact with reality" },
      { type: "p",
        th: "เลือกตัวชี้วัดไม่เกินสามตัว วัดก่อนเริ่ม วัดซ้ำที่ 3 เดือนและ 6 เดือน และเปรียบเทียบกับทีมที่ยังไม่ได้เข้าร่วมในช่วงเวลาเดียวกัน การมีกลุ่มเทียบสำคัญมาก เพราะช่วยแยกผลของโปรแกรมออกจากฤดูกาลหรือรอบธุรกิจ",
        en: "Pick no more than three metrics. Measure before, then again at three and six months, and compare against teams that haven't joined yet over the same window. That comparison group matters — it separates the programme's effect from seasonality and business cycles." },
      { type: "quote",
        th: "ตัวเลขสามตัวที่เก็บสม่ำเสมอ มีน้ำหนักกว่าสิบตัวที่เก็บครั้งเดียวแล้วหายไป",
        en: "Three metrics tracked consistently carry more weight than ten collected once and forgotten." },
      { type: "img", src: "images/blog/wellness-roi-3.jpg",
        alt: "ทีมงานร่วมกันทำงานในพื้นที่ออฟฟิศที่มีแสงสว่าง",
        altEn: "A team collaborating in a bright office space",
        caption: { th: "รายงานที่สั้นและอ่านง่ายมีโอกาสถูกอ่านจริงมากกว่ารายงานสามสิบหน้า", en: "A short, readable report gets read. A thirty-page one rarely does." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "retreat-planning-checklist",
    category: "Retreats",
    categoryEn: "Retreats",
    date: "2026-03-28",
    readMins: 8,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "เช็กลิสต์จัด Wellness Retreat ให้ทีม 12 คน",
    titleEn: "A planning checklist for a 12-person wellness retreat",
    excerpt: "สิ่งที่มักตกหล่นไม่ใช่เรื่องที่พักหรืออาหาร แต่เป็นรายละเอียดเล็ก ๆ ที่ทำให้บางคนเข้าร่วมกิจกรรมไม่ได้",
    excerptEn: "What usually gets missed isn't the venue or the food — it's the small details that quietly exclude someone.",
    cover: "images/blog/retreat-planning-1.jpg",
    coverAlt: "รีสอร์ตริมสระน้ำท่ามกลางธรรมชาติเขียวชอุ่ม",
    coverAltEn: "A resort poolside surrounded by greenery",
    body: [
      { type: "p",
        th: "Retreat สำหรับองค์กรต่างจากทริปเที่ยวตรงที่ต้องออกแบบให้ทุกคนเข้าร่วมได้จริง ไม่ใช่แค่คนที่แข็งแรงที่สุดในทีม ความผิดพลาดที่พบบ่อยที่สุดคือจัดตารางแน่นเกินไปจนไม่มีเวลาว่างเลย",
        en: "A corporate retreat differs from a holiday in one key way: it has to work for everyone, not just the fittest person on the team. The most common mistake is packing the schedule so tightly there's no unstructured time at all." },

      { type: "h2", th: "4–6 สัปดาห์ก่อนเดินทาง", en: "Four to six weeks out" },
      { type: "ul", items: [
        { th: "สำรวจข้อจำกัดด้านสุขภาพและอาหารของทุกคน แบบไม่ระบุตัวตน", en: "Survey health and dietary constraints anonymously" },
        { th: "ยืนยันจำนวนห้องและรูปแบบการพัก บางคนไม่สะดวกพักร่วมกับเพื่อนร่วมงาน", en: "Confirm rooming — not everyone is comfortable sharing with a colleague" },
        { th: "เช็กว่าสถานที่เข้าถึงได้สำหรับคนที่เดินไกลไม่ไหว", en: "Check the venue works for anyone who can't walk far" },
        { th: "แจ้งตารางล่วงหน้า พร้อมระบุชัดว่ากิจกรรมไหนเข้าร่วมได้ตามสมัครใจ", en: "Share the schedule early, marking clearly which sessions are optional" },
      ]},

      { type: "img", src: "images/blog/retreat-planning-2.jpg",
        alt: "กลุ่มคนฝึกโยคะร่วมกันริมชายหาด",
        altEn: "A group practising yoga together on a beach",
        caption: { th: "กิจกรรมกลางแจ้งควรมีแผนสำรองในร่มเสมอ โดยเฉพาะช่วงหน้าฝน", en: "Every outdoor session needs an indoor fallback — especially in the rainy season." } },

      { type: "h2", th: "ตารางที่เว้นที่ว่างไว้", en: "Leave gaps in the schedule" },
      { type: "p",
        th: "ประสบการณ์จากหน้างานคือ ช่วงเวลาที่ทีมสนิทกันมากที่สุดมักไม่ใช่ระหว่างกิจกรรมที่จัดไว้ แต่เป็นช่วงว่างระหว่างมื้ออาหารกับกิจกรรมถัดไป ควรเว้นช่วงว่างอย่างน้อยวันละหนึ่งชั่วโมงครึ่ง",
        en: "From experience on the ground, the moments a team actually connects are rarely inside the scheduled activities — they're in the gaps between a meal and whatever comes next. Leave at least ninety unstructured minutes a day." },
      { type: "quote",
        th: "ตารางที่แน่นเกินไปทำให้คนกลับบ้านเหนื่อยกว่าตอนมา ซึ่งตรงข้ามกับเป้าหมายทั้งหมดของทริป",
        en: "An over-packed schedule sends people home more tired than they arrived — the exact opposite of the point." },
      { type: "img", src: "images/blog/retreat-planning-3.jpg",
        alt: "มุมสูงของรีสอร์ตกลางสวนเขตร้อน",
        altEn: "An aerial view of a resort set in a tropical garden",
        caption: { th: "เลือกสถานที่ที่เดินทางไม่เกินสามชั่วโมง เพื่อไม่ให้เสียวันแรกไปกับการเดินทาง", en: "Pick somewhere under three hours away, so day one isn't spent in transit." } },
    ],
  },

  /* ---------------------------------------------------------- */
  {
    id: "flower-mandala-art-therapy",
    category: "กาย & ใจ",
    categoryEn: "Body & Mind",
    date: "2026-03-14",
    readMins: 5,
    author: "ทีม B-Healthy",
    authorEn: "B-Healthy Team",
    title: "Flower Mandala: ศิลปะบำบัดที่ไม่ต้องวาดรูปเป็น",
    titleEn: "Flower Mandala: art therapy for people who can't draw",
    excerpt: "กิจกรรมที่ทุกคนทำได้ตั้งแต่ครั้งแรก เพราะไม่มีทักษะไหนต้องเตรียมมาก่อน และไม่มีผลงานไหนผิด",
    excerptEn: "Everyone can do it on the first try — no skill to bring, and no wrong result.",
    cover: "images/blog/flower-mandala-1.jpg",
    coverAlt: "แมนดาลาที่จัดเรียงจากกลีบดอกไม้และใบไม้หลากสี",
    coverAltEn: "A mandala arranged from colourful flower petals and leaves",
    body: [
      { type: "p",
        th: "อุปสรรคของศิลปะบำบัดในองค์กรคือคนส่วนใหญ่บอกว่า “วาดรูปไม่เป็น” แล้วปิดตัวเองตั้งแต่ยังไม่เริ่ม Flower Mandala แก้ปัญหานี้ตรงจุด เพราะวัสดุคือกลีบดอกไม้และใบไม้ที่มีสีและรูปทรงสวยอยู่แล้ว หน้าที่ของผู้ทำคือแค่จัดวาง",
        en: "The barrier to art therapy at work is that most people say “I can't draw” and shut down before starting. Flower Mandala removes that entirely: the material is petals and leaves that are already beautiful, and the task is simply arrangement." },
      { type: "p",
        th: "สิ่งที่เกิดขึ้นระหว่างทำคือความสนใจถูกดึงมาอยู่กับสิ่งตรงหน้าอย่างต่อเนื่อง เป็นสภาวะเดียวกับที่การฝึกสติพยายามสร้าง แต่เข้าถึงง่ายกว่ามากสำหรับคนที่นั่งหลับตาแล้วฟุ้งซ่าน",
        en: "What happens while making one is that attention settles continuously on the thing in front of you — the same state mindfulness practice aims for, but far more accessible for people whose minds wander the moment they close their eyes." },

      { type: "img", src: "images/blog/flower-mandala-2.jpg",
        alt: "แมนดาลาทำมือล้อมรอบด้วยดอกไม้แห้ง",
        altEn: "A handmade mandala surrounded by dried flowers",
        caption: { th: "ไม่มีแบบที่ถูกต้อง ทำให้ไม่มีใครรู้สึกว่าตัวเองทำผิด", en: "There's no correct version, so nobody can feel they got it wrong." } },

      { type: "h2", th: "ทำไมถึงเหมาะกับกิจกรรมทีม", en: "Why it works as a team activity" },
      { type: "ul", items: [
        { th: "ไม่มีการแข่งขัน จึงไม่มีใครถูกเปรียบเทียบ", en: "No competition, so nobody gets compared" },
        { th: "ทำร่วมกันเป็นวงใหญ่ได้ ทำให้เกิดบทสนทนาโดยไม่ต้องบังคับ", en: "It can be built as one large circle, which starts conversation without forcing it" },
        { th: "ใช้เวลา 45–60 นาที พอดีกับช่วงบ่ายที่คนล้า", en: "Runs 45–60 minutes — a good fit for the flat part of the afternoon" },
        { th: "วัสดุย่อยสลายได้ ไม่เหลือขยะหลังกิจกรรม", en: "The materials compost — nothing left behind" },
      ]},
      { type: "img", src: "images/blog/flower-mandala-3.jpg",
        alt: "การจัดกลีบดอกไม้เป็นลวดลายวงกลมบนพื้นไม้",
        altEn: "Flower petals laid out in a circular pattern on a wooden deck",
        caption: { th: "ความไม่ถาวรของผลงานเป็นส่วนหนึ่งของกิจกรรม — ทำเสร็จแล้วปล่อยไป", en: "The impermanence is part of it — you finish, then you let it go." } },
    ],
  },

];

/* Newest first — the listing and the “related” strip both rely on this. */
window.BLOG_POSTS.sort((a, b) => (a.date < b.date ? 1 : -1));

/* 2026-07-18 → "18 ก.ค. 2026" / "18 Jul 2026". Returned as a pair so the
   language toggle can swap the label without re-rendering anything.
   Lives here rather than in blog.js because post.html needs it too. */
(function () {
  const TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  window.bhBlogDate = iso => {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return { th: String(iso), en: String(iso) };
    return { th: `${d} ${TH[m - 1]} ${y}`, en: `${d} ${EN[m - 1]} ${y}` };
  };
})();
