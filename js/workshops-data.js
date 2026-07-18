/* ============================================================
   B-Healthy — Workshop data (marketplace products)
   Same schema as packages.js (minus venue/itinerary), so
   package.html renders workshop detail with the SAME template.
   Merged into window.PACKAGES for id lookup on package.html.
   ============================================================ */
(function () {

  const WORKSHOPS = {

    /* -------------------------------------------------------- */
    "office-syndrome": {
      id: "office-syndrome",
      type: "workshop",
      name: "Office Syndrome Relief",
      category: "Body",
      kicker: "Office Syndrome Prevention",
      tagline: ["Relieve", "Realign", "Recharge"],
      location: "In-house · จัดที่องค์กรของคุณ",
      duration: "1 คลาส · 3 ชั่วโมง",
      group: "20–30 คน / คลาส",
      priceNow: "ติดต่อสอบถาม",
      priceUnit: "",
      theme: { primary: "#1ECAD3", accent: "#2bb8d6", tint: "#e6f8f9" },
      hero: "images/photos/wk-office.jpg",
      intro:
        "เวิร์กชอปดูแลและป้องกันกลุ่มอาการออฟฟิศซินโดรม เรียนรู้การปรับท่าทางและการยืดเหยียด " +
        "เพื่อลดอาการปวดเมื่อยจากการทำงาน เสริมสร้างความแข็งแรงและความยืดหยุ่นให้พนักงาน",
      experiences: [
        { title: "Body Check", th: "ประเมินอาการ", desc: "ประเมินระยะความรุนแรงของกลุ่มอาการออฟฟิศซินโดรมรายบุคคล", img: "images/workshop/office-syndrome/office-syndrome-1.jpg" },
        { title: "Knowledge", th: "หลักการยศาสตร์", desc: "เรียนรู้สาเหตุของโรค และฝึกจัดสรีระให้ถูกต้องตามหลัก Ergonomics", img: "images/workshop/office-syndrome/office-syndrome-6.jpg" },
        { title: "Exercise & Movement", th: "", desc: "ปรับพฤติกรรมด้วยการเคลื่อนไหวง่ายๆ ในชีวิตประจำวัน ลดความตึงเครียด เพิ่มความยืดหยุ่น", img: "images/workshop/office-syndrome/office-syndrome-11.jpg" },
      ],
      includes: [
        "ประเมินสรีระและอาการรายบุคคลก่อนเริ่มกิจกรรม",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "อุปกรณ์และสื่อประกอบกิจกรรมครบชุด",
        "คู่มือท่ายืดเหยียดกลับไปทำต่อที่ออฟฟิศ/ที่บ้าน",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร",
      ],
    },

    /* -------------------------------------------------------- */
    "sound-healing": {
      id: "sound-healing",
      type: "workshop",
      name: "Sound Healing Meditation",
      category: "Mind",
      kicker: "Stress & Burnout Recovery",
      tagline: ["Relax", "Restore", "Rebalance"],
      location: "In-house · จัดที่องค์กรของคุณ",
      duration: "1 คลาส · 3 ชั่วโมง",
      group: "20–30 คน / คลาส",
      priceNow: "ติดต่อสอบถาม",
      priceUnit: "",
      theme: { primary: "#425CC7", accent: "#6f86e0", tint: "#eaeefb" },
      hero: "images/photos/wk-sound.jpg",
      intro:
        "ฟื้นฟูร่างกายและจิตใจ ผ่อนคลายความเครียด ลดภาวะหมดไฟในการทำงาน " +
        "ด้วยคลื่นเสียงบำบัดและการฝึกสมาธิ เติมพลังใจและสมดุลให้พนักงานกลับมาพร้อมทำงาน",
      experiences: [
        { title: "Element Balance Check", th: "ตรวจธาตุเจ้าเรือน", desc: "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนดูแลสุขภาพให้ตรงจุด", img: "images/workshop/sound-healing/sound-healing-1.jpg" },
        { title: "Orientation & Meditation", th: "", desc: "ฟื้นฟูสมดุลภายในผ่านการฝึกหายใจ การเคลื่อนไหว และการทำสมาธิ", img: "images/workshop/sound-healing/sound-healing-4.jpg" },
        { title: "Sound Healing", th: "เสียงบำบัด", desc: "ใช้คลื่นเสียงช่วยผ่อนคลาย ลดความเครียด และเสริมสร้างสมาธิ", img: "images/workshop/sound-healing/sound-healing-6.jpg" },
      ],
      includes: [
        "ตรวจธาตุเจ้าเรือนโดยแพทย์แผนไทย",
        "เซสชัน 3 ชั่วโมง นำโดย Wellness Facilitator",
        "เครื่องดนตรีและอุปกรณ์เสียงบำบัดครบชุด",
        "แนวทางการฝึกหายใจและสมาธิกลับไปทำต่อ",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร",
      ],
    },

    /* -------------------------------------------------------- */
    "yoga-meditation": {
      id: "yoga-meditation",
      type: "workshop",
      name: "Yoga Meditation",
      category: "Mind",
      kicker: "Stress & Burnout Recovery",
      tagline: ["Breathe", "Move", "Balance"],
      location: "In-house · จัดที่องค์กรของคุณ",
      duration: "1 คลาส · 3 ชั่วโมง",
      group: "20–30 คน / คลาส",
      priceNow: "ติดต่อสอบถาม",
      priceUnit: "",
      theme: { primary: "#AE85FD", accent: "#c4a6ff", tint: "#f2ecff" },
      hero: "images/photos/wk-yoga.jpg",
      intro:
        "การบำบัดเพื่อความสงบที่ผสานการฝึกลมหายใจอย่างมีสติเข้ากับการเคลื่อนไหวแบบโยคะ " +
        "ช่วยปลดปล่อยความตึงเครียดของร่างกาย ลดความเครียด และปรับสมดุลร่างกายและจิตใจ",
      experiences: [
        { title: "Element Balance Check", th: "ตรวจธาตุเจ้าเรือน", desc: "ตรวจธาตุเจ้าเรือนตามศาสตร์การแพทย์แผนไทย เพื่อวางแผนดูแลสุขภาพให้ตรงจุด", img: "images/workshop/yoga-meditation/yoga-meditation-1.jpg" },
        { title: "Sound Healing & Meditation", th: "", desc: "ฝึกร่วมกับดนตรีบำบัด เพื่อช่วยผ่อนคลายและลดความเครียด", img: "images/workshop/yoga-meditation/yoga-meditation-4.jpg" },
        { title: "Yoga Meditation", th: "", desc: "ผสานลมหายใจอย่างมีสติกับการเคลื่อนไหวแบบโยคะ ปรับสมดุลร่างกายและจิตใจ", img: "images/workshop/yoga-meditation/yoga-meditation-7.jpg" },
      ],
      includes: [
        "ตรวจธาตุเจ้าเรือนโดยแพทย์แผนไทย",
        "เซสชัน 3 ชั่วโมง นำโดยครูโยคะและ Wellness Facilitator",
        "เสื่อโยคะและอุปกรณ์ประกอบครบชุด",
        "แนวทางการฝึกลมหายใจและโยคะกลับไปทำต่อ",
        "ปรับแต่งเนื้อหา รูปแบบ และระยะเวลาให้เหมาะกับองค์กร",
      ],
    },

  };

  /* ---- English strings (parallel to the Thai fields above) ---- */
  const WORKSHOPS_EN = {
    "office-syndrome": {
      location: "In-house · At your organization",
      duration: "1 Session · 3 Hours",
      group: "20–30 people / session",
      priceUnit: "",
      priceNow: "Contact us",
      intro: "A workshop to prevent and relieve office-syndrome symptoms — learn posture correction and stretching to ease work-related aches, and build strength and flexibility for your team.",
      expDesc: [
        "Assess the severity of each person's office-syndrome symptoms",
        "Learn the causes and practice correct ergonomic posture",
        "Everyday movement habits to ease tension and improve flexibility",
      ],
      includes: [
        "Individual posture & symptom assessment before the session",
        "3-hour session led by a Wellness Facilitator",
        "All equipment and activity materials included",
        "Take-home stretching guide for the office / home",
        "Content, format, and duration customized to your organization",
      ],
    },
    "sound-healing": {
      location: "In-house · At your organization",
      duration: "1 Session · 3 Hours",
      group: "20–30 people / session",
      priceUnit: "",
      priceNow: "Contact us",
      intro: "Restore body and mind, release stress, and reduce burnout with sound-healing waves and guided meditation — recharge your team's energy and balance.",
      expDesc: [
        "Thai-medicine element assessment to plan targeted wellness",
        "Restore inner balance through breathing, movement, and meditation",
        "Sound waves to relax, reduce stress, and build focus",
      ],
      includes: [
        "Element assessment by a Thai traditional physician",
        "3-hour session led by a Wellness Facilitator",
        "All sound-healing instruments and equipment included",
        "Breathing and meditation practice to take home",
        "Content, format, and duration customized to your organization",
      ],
    },
    "yoga-meditation": {
      location: "In-house · At your organization",
      duration: "1 Session · 3 Hours",
      group: "20–30 people / session",
      priceUnit: "",
      priceNow: "Contact us",
      intro: "A calming therapy blending mindful breathing with yoga movement — release physical tension, reduce stress, and rebalance body and mind.",
      expDesc: [
        "Thai-medicine element assessment to plan targeted wellness",
        "Practice with music therapy to relax and reduce stress",
        "Blend mindful breathing with yoga movement to rebalance body and mind",
      ],
      includes: [
        "Element assessment by a Thai traditional physician",
        "3-hour session led by a yoga teacher & Wellness Facilitator",
        "Yoga mats and all equipment included",
        "Breathing and yoga practice to take home",
        "Content, format, and duration customized to your organization",
      ],
    },
  };

  window.WORKSHOPS = WORKSHOPS;
  window.WORKSHOP_ORDER = ["office-syndrome", "sound-healing", "yoga-meditation"];
  window.WORKSHOPS_EN = WORKSHOPS_EN;

  // Merge into the package catalog so package.html?id= can render workshop detail
  window.PACKAGES = Object.assign({}, window.PACKAGES || {}, WORKSHOPS);
  window.PACKAGES_EN = Object.assign({}, window.PACKAGES_EN || {}, WORKSHOPS_EN);

})();
