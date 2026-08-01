/* ============================================================
   B-Healthy — Workshop data (offline fallback)

   Same schema as packages.js (minus venue/itinerary) so package.html renders
   workshop detail with the SAME template. Merged into window.PACKAGES for id
   lookup.

   This mirrors the published rows in Supabase and is used only when the
   database is unconfigured, unreachable or empty — js/store.js replaces it
   otherwise. Keep it in step when workshops are added in the admin, or an
   outage will quietly show a shorter catalogue than the site really has.

   Ids use the hyphenated slugs (see supabase-fix-workshop-ids.sql).
   ============================================================ */
(function () {

  const WORKSHOPS = {
    "elemental-aroma-oil": {
      "id": "elemental-aroma-oil",
      "hero": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/elementalaromaoil/1784517845153-bjmhnh.png",
      "name": "Elemental Aroma Oil",
      "type": "workshop",
      "group": "10–15 คน / คลาส",
      "intro": "กิจกรรมเชิงปฏิบัติที่ชวนคุณมาลงมือปรุงน้ำมันหอมระเหยสูตรเฉพาะบุคคลตามหลักธาตุเจ้าเรือน เพื่อปรับสมดุลจิตใจและคลายความเครียดสะสมอย่างตรงจุด โดยผู้เข้าร่วมจะได้รับทั้งทักษะความรู้และได้ผลิตภัณฑ์กลิ่นบำบัดของตัวเองกลับไปใช้สูดดม เพื่อชาร์จพลังและดูแลสุขภาพอย่างยั่งยืนในชีวิตประจำวัน",
      "theme": {
        "tint": "#e6f4f8",
        "accent": "#425cc7",
        "primary": "#1ecad3"
      },
      "kicker": "Elemental Aromatherapy",
      "tagline": [],
      "category": "Body",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [
        "ประเมินสรีระและอาการรายบุคคลก่อนเริ่มกิจกรรม",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "อุปกรณ์และวัตถุดิบปรุงน้ำมันหอมระเหยครบชุด",
        "น้ำมันหอมระเหยสูตรเฉพาะคุณ พร้อมคู่มือกลับบ้าน",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร"
      ],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "39,000",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ตรวจธาตุเจ้าเรือน",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/elementalaromaoil/1785473378159-qjtobj.png",
          "desc": "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนทำน้ำมันหอมระเหยให้ตรงตามธาตุ",
          "title": "Element Balance Check"
        },
        {
          "th": "",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/elementalaromaoil/1785473307318-0nifux.png",
          "desc": "เรียนรู้คุณสมบัติและประโยชน์ของน้ำมันหอมระเหย",
          "title": "Essential Oil Education Session"
        },
        {
          "th": "",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/elementalaromaoil/1785473359440-8oby67.jpg",
          "desc": "ผสมน้ำมันหอมระเหยสูตรเฉพาะบุคคล โดยคัดสรรกลิ่นที่เหมาะกับสภาวะร่างกาย ความต้องการ และความชอบของแต่ละบุคคล",
          "title": "Personalized Aroma Blending "
        }
      ]
    },
    "flower-mandala": {
      "id": "flower-mandala",
      "hero": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/flowermandala/1784530648711-hcbk85.png",
      "name": "Flower Mandala",
      "type": "workshop",
      "group": "10–15 คน / คลาส",
      "intro": "เป็นกิจกรรมศิลปะบำบัด (Art Therapy) ที่ได้รับแรงบันดาลใจจากแนวคิด Mandala ซึ่งสื่อถึง \"ศูนย์กลาง\" หรือ \"แก่นแท้ของตัวตน\" ผู้เข้าร่วมจะสร้างสรรค์ลวดลายจากดอกไม้และวัสดุธรรมชาติอย่างอิสระ เพื่อสะท้อนอารมณ์ ความคิด และจิตใต้สำนึก กิจกรรมนี้ช่วยเชื่อมโยงธรรมชาติภายนอกกับธรรมชาติภายใน ส่งเสริมสมาธิ การผ่อนคลาย และการเข้าใจตนเองผ่านกระบวนการสร้างสรรค์งานศิลปะ.",
      "theme": {
        "tint": "#e6f4f8",
        "accent": "#425cc7",
        "primary": "#1ecad3"
      },
      "kicker": "Flower Mandala",
      "tagline": [],
      "category": "Body",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "43,900",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ตรวจธาตุเจ้าเรือน",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/flowermandala/1785473806782-rx2mxj.png",
          "desc": "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย",
          "title": "Element Balance Check"
        },
        {
          "th": "ทำสมาธิ เลือกดอกไม้ และจัดวางตามความรู้สึก",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/flowermandala/1785473954240-sdoqwc.jpg",
          "desc": "เริ่มต้นด้วยการทำสมาธิสั้นๆ เพื่อเตรียมจิตใจให้ผ่อนคลาย จากนั้นเลือกดอกไม้และใบไม้ตามสภาวะจิตใจโดยไม่ต้องใช้เหตุผล แล้วลงมือจัดเรียงเป็น Flower Mandala บนผืนผ้าอย่างอิสระ ไร้กฎเกณฑ์ ไร้ถูกผิด เพื่อปลดปล่อยจินตนาการเต็มที่",
          "title": "Mindfulness & Mandala Creation"
        },
        {
          "th": "สังเกตความหมายภายใน และเชื่อมโยงสู่ชีวิตประจำวัน",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/flowermandala/1785473961375-2hslzv.jpg",
          "desc": "ร่วมสังเกตผลงานเพื่อทำความเข้าใจตนเองผ่านสีสัน รูปแบบ และการจัดวาง สะท้อนความรู้สึกระหว่างการทำงานเพื่อค้นพบมุมมองใหม่ๆ ในจิตใจ พร้อมตกผลึกแนวคิดและนำสิ่งที่เรียนรู้ไปปรับใช้ในชีวิตประจำวันอย่างมีความสุข",
          "title": "Inner Reflection & Closing"
        }
      ]
    },
    "office-syndrome": {
      "id": "office-syndrome",
      "hero": "images/photos/wk-office.jpg",
      "name": "Office Syndrome Relief",
      "type": "workshop",
      "group": "20–30 คน / คลาส",
      "intro": "เวิร์กชอปดูแลและป้องกันกลุ่มอาการออฟฟิศซินโดรม เรียนรู้การปรับท่าทางและการยืดเหยียด เพื่อลดอาการปวดเมื่อยจากการทำงาน เสริมสร้างความแข็งแรงและความยืดหยุ่นให้พนักงาน",
      "theme": {
        "tint": "#e6f8f9",
        "accent": "#2bb8d6",
        "primary": "#1ecad3"
      },
      "kicker": "Office Syndrome Prevention",
      "tagline": [
        "Relieve",
        "Realign",
        "Recharge"
      ],
      "category": "Body",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [
        "ประเมินสรีระและอาการรายบุคคลก่อนเริ่มกิจกรรม",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "อุปกรณ์และสื่อประกอบกิจกรรมครบชุด",
        "คู่มือท่ายืดเหยียดกลับไปทำต่อที่ออฟฟิศ/ที่บ้าน",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร"
      ],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "43,900",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ประเมินอาการ",
          "img": "images/workshop/office-syndrome/office-syndrome-1.jpg",
          "desc": "ประเมินระยะความรุนแรงของกลุ่มอาการออฟฟิศซินโดรมรายบุคคล",
          "title": "Body Check"
        },
        {
          "th": "หลักการยศาสตร์",
          "img": "images/workshop/office-syndrome/office-syndrome-6.jpg",
          "desc": "เรียนรู้สาเหตุของโรค และฝึกจัดสรีระให้ถูกต้องตามหลัก Ergonomics",
          "title": "Knowledge"
        },
        {
          "th": "",
          "img": "images/workshop/office-syndrome/office-syndrome-11.jpg",
          "desc": "ปรับพฤติกรรมด้วยการเคลื่อนไหวง่ายๆ ในชีวิตประจำวัน ลดความตึงเครียด เพิ่มความยืดหยุ่น",
          "title": "Exercise & Movement"
        }
      ]
    },
    "personalized-herbal-tea": {
      "id": "personalized-herbal-tea",
      "hero": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/personalizedherbaltea/1784529878299-q8ta0f.png",
      "name": "Personalized Herbal Tea",
      "type": "workshop",
      "group": "10–15 คน / คลาส",
      "intro": "กิจกรรมเชิงปฏิบัติที่ชวนคุณมาลงมือปรุงชาสูตรพิเศษเฉพาะตัวตามหลักธาตุเจ้าเรือน เพื่อฟื้นฟูสุขภาพภายในและลดความตึงเครียดอย่างตรงจุด โดยผู้เข้าร่วมจะได้รับทั้งทักษะความรู้และได้ชาสมุนไพรสูตรของตัวเองกลับไปชงดื่ม เพื่อปรับสมดุลและดูแลสุขภาพอย่างยั่งยืนในชีวิตประจำวัน",
      "theme": {
        "tint": "#e6f4f8",
        "accent": "#425cc7",
        "primary": "#1ecad3"
      },
      "kicker": "Personalized Herbal Tea",
      "tagline": [],
      "category": "Body",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [
        "ประเมินสรีระและอาการรายบุคคลก่อนเริ่มกิจกรรม",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "อุปกรณ์และวัตถุดิบปรุงชาครบชุด",
        "ชาสมุนไพรสูตรเฉพาะคุณ พร้อมคู่มือกลับบ้าน",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร"
      ],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "39,000",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ตรวจธาตุเจ้าเรือน",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/personalizedherbaltea/1785473537511-bq2unf.png",
          "desc": "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนปรุงชทให้ตรงตามธาตุ",
          "title": "Element Balance Check"
        },
        {
          "th": "",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/personalizedherbaltea/1785473602968-selfmb.png",
          "desc": "- เรียนรู้คุณสมบัติและสรรพคุณของสมุนไพรไทยแต่ละชนิด\n- ทำความเข้าใจรสยาและฤทธิ์ของสมุนไพรตามหลักการแพทย์แผนไทย\n- เรียนรู้การเลือกสมุนไพรให้เหมาะกับธาตุเจ้าเรือน",
          "title": "Personalized Herbal Tea Selection"
        },
        {
          "th": "",
          "img": "https://gngibdrjcnshyqkomkjs.supabase.co/storage/v1/object/public/package-images/personalizedherbaltea/1785473764081-vo3mco.jpg",
          "desc": "- ลงมือผสมชาสมุนไพรสูตรเฉพาะบุคคล\n- ปรับสูตรตามรสชาติ กลิ่น และคุณสมบัติตามธาตุเจ้าเรือน\n- บรรจุชาสมุนไพรสูตรเฉพาะบุคคลกลับบ้าน",
          "title": "Personalized Tea Blending "
        }
      ]
    },
    "sound-healing": {
      "id": "sound-healing",
      "hero": "images/photos/wk-sound.jpg",
      "name": "Sound Healing",
      "type": "workshop",
      "group": "20–30 คน / คลาส",
      "intro": "ฟื้นฟูร่างกายและจิตใจ ผ่อนคลายความเครียด ลดภาวะหมดไฟในการทำงาน ด้วยคลื่นเสียงบำบัดและการฝึกสมาธิ เติมพลังใจและสมดุลให้พนักงานกลับมาพร้อมทำงาน",
      "theme": {
        "tint": "#eaeefb",
        "accent": "#6f86e0",
        "primary": "#425cc7"
      },
      "kicker": "Stress & Burnout Recovery",
      "tagline": [
        "Relax",
        "Restore",
        "Rebalance"
      ],
      "category": "Mind",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [
        "ตรวจธาตุเจ้าเรือนโดยแพทย์แผนไทย",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "เครื่องดนตรีและอุปกรณ์เสียงบำบัดครบชุด",
        "แนวทางการฝึกหายใจและสมาธิกลับไปทำต่อ",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร"
      ],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "43,900",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ตรวจธาตุเจ้าเรือน",
          "img": "images/workshop/sound-healing/sound-healing-1.jpg",
          "desc": "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนดูแลสุขภาพให้ตรงจุด",
          "title": "Element Balance Check"
        },
        {
          "th": "",
          "img": "images/workshop/sound-healing/sound-healing-4.jpg",
          "desc": "ฟื้นฟูสมดุลภายในผ่านการฝึกหายใจ การเคลื่อนไหว และการทำสมาธิ",
          "title": "Orientation & Meditation"
        },
        {
          "th": "เสียงบำบัด",
          "img": "images/workshop/sound-healing/sound-healing-6.jpg",
          "desc": "ใช้คลื่นเสียงช่วยผ่อนคลาย ลดความเครียด และเสริมสร้างสมาธิ",
          "title": "Sound Healing"
        }
      ]
    },
    "yoga-meditation": {
      "id": "yoga-meditation",
      "hero": "images/photos/wk-yoga.jpg",
      "name": "Yoga Meditation",
      "type": "workshop",
      "group": "20–30 คน / คลาส",
      "intro": "การบำบัดเพื่อความสงบที่ผสานการฝึกลมหายใจอย่างมีสติเข้ากับการเคลื่อนไหวแบบโยคะ ช่วยปลดปล่อยความตึงเครียดของร่างกาย ลดความเครียด และปรับสมดุลร่างกายและจิตใจ",
      "theme": {
        "tint": "#f2ecff",
        "accent": "#c4a6ff",
        "primary": "#ae85fd"
      },
      "kicker": "Stress & Burnout Recovery",
      "tagline": [
        "Breathe",
        "Move",
        "Balance"
      ],
      "category": "Mind",
      "duration": "1 คลาส · 3 ชั่วโมง",
      "includes": [
        "ตรวจธาตุเจ้าเรือนโดยแพทย์แผนไทย",
        "เซสชัน 3 ชั่วโมง นำโดยครูโยคะและ Wellness Facilitator",
        "เสื่อโยคะและอุปกรณ์ประกอบครบชุด",
        "แนวทางการฝึกลมหายใจและโยคะกลับไปทำต่อ",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร"
      ],
      "location": "In-house · จัดที่องค์กรของคุณ",
      "priceNow": "43,900",
      "priceOld": "",
      "priceUnit": "",
      "experiences": [
        {
          "th": "ตรวจธาตุเจ้าเรือน",
          "img": "images/workshop/yoga-meditation/yoga-meditation-1.jpg",
          "desc": "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนดูแลสุขภาพให้ตรงจุด",
          "title": "Element Balance Check"
        },
        {
          "th": "",
          "img": "images/workshop/yoga-meditation/yoga-meditation-4.jpg",
          "desc": "ฝึกร่วมกับดนตรีบำบัด เพื่อช่วยผ่อนคลายและลดความเครียด",
          "title": "Sound Healing & Meditation"
        },
        {
          "th": "",
          "img": "images/workshop/yoga-meditation/yoga-meditation-7.jpg",
          "desc": "ผสานลมหายใจอย่างมีสติกับการเคลื่อนไหวแบบโยคะ ปรับสมดุลร่างกายและจิตใจ",
          "title": "Yoga Meditation"
        }
      ]
    }
  };

  const WORKSHOPS_EN = {
    "office-syndrome": {
      "group": "20–30 people / session",
      "intro": "A workshop to prevent and relieve office-syndrome symptoms — learn posture correction and stretching to ease work-related aches, and build strength and flexibility for your team.",
      "expDesc": [
        "Assess the severity of each person's office-syndrome symptoms",
        "Learn the causes and practice correct ergonomic posture",
        "Everyday movement habits to ease tension and improve flexibility"
      ],
      "duration": "1 Session · 3 Hours",
      "includes": [
        "Individual posture & symptom assessment before the session",
        "3-hour session led by a Wellness Facilitator",
        "All equipment and activity materials included",
        "Take-home stretching guide for the office / home",
        "Content, format, and duration customized to your organization"
      ],
      "location": "In-house · At your organization",
      "priceNow": "Contact us",
      "priceUnit": ""
    },
    "sound-healing": {
      "group": "20–30 people / session",
      "intro": "Restore body and mind, release stress, and reduce burnout with sound-healing waves and guided meditation — recharge your team's energy and balance.",
      "expDesc": [
        "Thai-medicine element assessment to plan targeted wellness",
        "Restore inner balance through breathing, movement, and meditation",
        "Sound waves to relax, reduce stress, and build focus"
      ],
      "duration": "1 Session · 3 Hours",
      "includes": [
        "Element assessment by a Thai traditional physician",
        "3-hour session led by a Wellness Facilitator",
        "All sound-healing instruments and equipment included",
        "Breathing and meditation practice to take home",
        "Content, format, and duration customized to your organization"
      ],
      "location": "In-house · At your organization",
      "priceNow": "Contact us",
      "priceUnit": ""
    },
    "yoga-meditation": {
      "group": "20–30 people / session",
      "intro": "A calming therapy blending mindful breathing with yoga movement — release physical tension, reduce stress, and rebalance body and mind.",
      "expDesc": [
        "Thai-medicine element assessment to plan targeted wellness",
        "Practice with music therapy to relax and reduce stress",
        "Blend mindful breathing with yoga movement to rebalance body and mind"
      ],
      "duration": "1 Session · 3 Hours",
      "includes": [
        "Element assessment by a Thai traditional physician",
        "3-hour session led by a yoga teacher & Wellness Facilitator",
        "Yoga mats and all equipment included",
        "Breathing and yoga practice to take home",
        "Content, format, and duration customized to your organization"
      ],
      "location": "In-house · At your organization",
      "priceNow": "Contact us",
      "priceUnit": ""
    }
  };

  window.WORKSHOPS = WORKSHOPS;
  window.WORKSHOP_ORDER = ["office-syndrome","sound-healing","yoga-meditation","elemental-aroma-oil","personalized-herbal-tea","flower-mandala"];
  window.WORKSHOPS_EN = WORKSHOPS_EN;

  // Merge into the package catalog so package.html?id= can render workshop detail
  window.PACKAGES = Object.assign({}, window.PACKAGES || {}, WORKSHOPS);
  window.PACKAGES_EN = Object.assign({}, window.PACKAGES_EN || {}, WORKSHOPS_EN);

})();
