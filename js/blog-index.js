/* ============================================================
   B-Healthy — bundled article index (offline fallback)

   Listing-level fields only: no article bodies. blog.html loads just this,
   which is why the listing costs ~7KB instead of ~60KB. Article bodies live
   in js/blog-bodies.js and are loaded only where they are actually rendered
   (post.html and admin.html).

   This is a FALLBACK. Once articles are imported, js/blog-store.js replaces
   window.BLOG_POSTS with the published rows from Supabase.
   ============================================================ */

window.BLOG_POSTS = [
  {
    "id": "office-syndrome-signs",
    "category": "Office Syndrome",
    "categoryEn": "Office Syndrome",
    "date": "2026-07-18",
    "readMins": 6,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "ออฟฟิศซินโดรมไม่ใช่เรื่องของคนขี้บ่น",
    "titleEn": "Office syndrome isn't just complaining",
    "excerpt": "ปวดคอ บ่า ไหล่ ที่พนักงานบ่นกันทุกวัน มีที่มาทางกายภาพชัดเจน และแก้ได้ก่อนจะกลายเป็นอาการเรื้อรัง",
    "excerptEn": "The neck and shoulder pain your team mentions every day has a clear physical cause — and it's fixable before it turns chronic.",
    "cover": "images/blog/office-syndrome-1.jpg",
    "coverAlt": "พนักงานใช้มือนวดต้นคอเพราะปวดเมื่อยจากการนั่งทำงาน",
    "coverAltEn": "An office worker rubbing the back of their neck"
  },
  {
    "id": "sound-healing-explained",
    "category": "กาย & ใจ",
    "categoryEn": "Body & Mind",
    "date": "2026-07-04",
    "readMins": 5,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "เสียงบำบัดทำงานกับร่างกายเราอย่างไร",
    "titleEn": "How sound healing actually works on the body",
    "excerpt": "ไม่ใช่เรื่องลึกลับ — คลื่นเสียงต่อเนื่องช่วยพาระบบประสาทออกจากโหมดตื่นตัว และนั่นคือจุดที่ร่างกายเริ่มฟื้นฟูตัวเอง",
    "excerptEn": "Nothing mystical about it — sustained tones help the nervous system leave alert mode, and that's where recovery begins.",
    "cover": "images/blog/sound-healing-1.jpg",
    "coverAlt": "ผู้ฝึกใช้ขันสวดทิเบตในการทำสมาธิและเสียงบำบัด",
    "coverAltEn": "A practitioner playing Tibetan singing bowls during a session"
  },
  {
    "id": "desk-yoga-15-minutes",
    "category": "ขยับร่างกาย",
    "categoryEn": "Movement",
    "date": "2026-06-20",
    "readMins": 5,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "โยคะ 15 นาที ที่ทำได้จริงข้างโต๊ะทำงาน",
    "titleEn": "A 15-minute yoga set that actually works at a desk",
    "excerpt": "ไม่ต้องเปลี่ยนชุด ไม่ต้องมีเสื่อ และไม่ต้องจองห้องประชุม — ชุดท่าที่ออกแบบมาให้ทำได้ระหว่างวันทำงานจริง",
    "excerptEn": "No changing clothes, no mat, no meeting room to book — a sequence built for a real working day.",
    "cover": "images/blog/office-yoga-1.jpg",
    "coverAlt": "ผู้หญิงฝึกโยคะและสมาธิในห้องที่มีแสงธรรมชาติ",
    "coverAltEn": "A woman practising yoga indoors in natural light"
  },
  {
    "id": "food-as-medicine-lunch",
    "category": "โภชนาการ",
    "categoryEn": "Nutrition",
    "date": "2026-06-06",
    "readMins": 6,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "อาหารเป็นยา เริ่มที่มื้อกลางวันของพนักงาน",
    "titleEn": "Food as medicine starts with the team lunch",
    "excerpt": "อาการง่วงบ่ายสองไม่ได้มาจากงานน่าเบื่อเสมอไป มื้อกลางวันที่เลือกไว้ตอนเที่ยงมีส่วนมากกว่าที่คิด",
    "excerptEn": "The 2pm slump isn't always the work. What went on the plate at noon has more to do with it than most people think.",
    "cover": "images/blog/food-as-medicine-1.jpg",
    "coverAlt": "ผักสดหลากชนิดจัดวางบนพื้นหลังสว่าง",
    "coverAltEn": "An overhead spread of fresh vegetables and herbs"
  },
  {
    "id": "burnout-early-signals",
    "category": "กาย & ใจ",
    "categoryEn": "Body & Mind",
    "date": "2026-05-23",
    "readMins": 7,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "หมดไฟไม่ใช่ขี้เกียจ: สัญญาณที่ HR ควรอ่านออก",
    "titleEn": "Burnout isn't laziness — the signals HR should be reading",
    "excerpt": "คนที่กำลังหมดไฟมักไม่ใช่คนที่ทำงานน้อยที่สุด แต่เป็นคนที่เคยทุ่มเทมากที่สุดในทีม",
    "excerptEn": "The person burning out is rarely the one doing least. More often it's the one who used to give the most.",
    "cover": "images/blog/burnout-1.jpg",
    "coverAlt": "พนักงานซบหน้าลงบนโต๊ะทำงานด้วยความเหนื่อยล้า",
    "coverAltEn": "An exhausted employee resting their head on a desk"
  },
  {
    "id": "sleep-hidden-cost",
    "category": "การฟื้นฟู",
    "categoryEn": "Recovery",
    "date": "2026-05-09",
    "readMins": 5,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "นอนไม่พอ คือต้นทุนที่องค์กรมองไม่เห็น",
    "titleEn": "Sleep debt is the cost nobody puts on the balance sheet",
    "excerpt": "ไม่มีใครลาป่วยเพราะนอนไม่พอ แต่ผลของมันปรากฏในทุกการตัดสินใจตลอดทั้งวัน",
    "excerptEn": "Nobody calls in sick for poor sleep — but it shows up in every decision made that day.",
    "cover": "images/blog/sleep-1.jpg",
    "coverAlt": "ผู้หญิงนอนหลับสบายในแสงเช้าที่นุ่มนวล",
    "coverAltEn": "A woman sleeping peacefully in soft morning light"
  },
  {
    "id": "thai-elements-aroma-oil",
    "category": "ภูมิปัญญาไทย",
    "categoryEn": "Thai Wisdom",
    "date": "2026-04-25",
    "readMins": 6,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "ธาตุเจ้าเรือน: ทำไมกลิ่นที่ใช่ของแต่ละคนไม่เหมือนกัน",
    "titleEn": "Elemental constitution: why the right scent differs per person",
    "excerpt": "แนวคิดธาตุเจ้าเรือนในการแพทย์แผนไทย ใช้อธิบายได้ว่าทำไมกลิ่นเดียวกันทำให้คนหนึ่งผ่อนคลาย แต่อีกคนกลับอึดอัด",
    "excerptEn": "The Thai traditional idea of a governing element explains why one scent relaxes one person and unsettles another.",
    "cover": "images/blog/elemental-aroma-1.jpg",
    "coverAlt": "ขวดน้ำมันหอมระเหยและสมุนไพรแห้งจัดวางบนพื้นผิวสีขาว",
    "coverAltEn": "Essential oil bottles and dried herbs arranged on a white surface"
  },
  {
    "id": "measuring-wellness-roi",
    "category": "องค์กร",
    "categoryEn": "Corporate",
    "date": "2026-04-11",
    "readMins": 7,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "วัดผล Corporate Wellness อย่างไรให้ผู้บริหารเห็นภาพ",
    "titleEn": "Measuring corporate wellness so leadership can see it",
    "excerpt": "“พนักงานชอบมาก” ไม่พอจะขออนุมัติงบปีหน้า นี่คือตัวเลขที่เก็บได้จริงโดยไม่ต้องลงทุนระบบใหม่",
    "excerptEn": "“People loved it” won't secure next year's budget. Here are the numbers you can collect without buying a new system.",
    "cover": "images/blog/wellness-roi-1.jpg",
    "coverAlt": "ทีมผู้บริหารประชุมวิเคราะห์ข้อมูลและกราฟร่วมกัน",
    "coverAltEn": "A team reviewing charts and data together in a meeting"
  },
  {
    "id": "retreat-planning-checklist",
    "category": "Retreats",
    "categoryEn": "Retreats",
    "date": "2026-03-28",
    "readMins": 8,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "เช็กลิสต์จัด Wellness Retreat ให้ทีม 12 คน",
    "titleEn": "A planning checklist for a 12-person wellness retreat",
    "excerpt": "สิ่งที่มักตกหล่นไม่ใช่เรื่องที่พักหรืออาหาร แต่เป็นรายละเอียดเล็ก ๆ ที่ทำให้บางคนเข้าร่วมกิจกรรมไม่ได้",
    "excerptEn": "What usually gets missed isn't the venue or the food — it's the small details that quietly exclude someone.",
    "cover": "images/blog/retreat-planning-1.jpg",
    "coverAlt": "รีสอร์ตริมสระน้ำท่ามกลางธรรมชาติเขียวชอุ่ม",
    "coverAltEn": "A resort poolside surrounded by greenery"
  },
  {
    "id": "flower-mandala-art-therapy",
    "category": "กาย & ใจ",
    "categoryEn": "Body & Mind",
    "date": "2026-03-14",
    "readMins": 5,
    "author": "ทีม B-Healthy",
    "authorEn": "B-Healthy Team",
    "title": "Flower Mandala: ศิลปะบำบัดที่ไม่ต้องวาดรูปเป็น",
    "titleEn": "Flower Mandala: art therapy for people who can't draw",
    "excerpt": "กิจกรรมที่ทุกคนทำได้ตั้งแต่ครั้งแรก เพราะไม่มีทักษะไหนต้องเตรียมมาก่อน และไม่มีผลงานไหนผิด",
    "excerptEn": "Everyone can do it on the first try — no skill to bring, and no wrong result.",
    "cover": "images/blog/flower-mandala-1.jpg",
    "coverAlt": "แมนดาลาที่จัดเรียงจากกลีบดอกไม้และใบไม้หลากสี",
    "coverAltEn": "A mandala arranged from colourful flower petals and leaves"
  }
];

/* Newest first — the listing and the "related" strip both rely on this. */
window.BLOG_POSTS.sort((a, b) => (a.date < b.date ? 1 : -1));
