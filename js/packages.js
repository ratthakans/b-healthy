/* ============================================================
   B-Healthy — Package data (single source of truth)
   Used by program.html (cards) and package.html (detail + booking)
   Swap picsum image URLs for real photos any time.
   ============================================================ */

window.PACKAGES = {

  /* ---------------------------------------------------------- */
  "amphawa": {
    id: "amphawa",
    name: "Amphawa Mindful Escape",
    category: "Corporate",
    kicker: "Mindful Escape",
    tagline: ["Reconnect", "Recharge", "Rebalance"],
    location: "ริมคลองอัมพวา · สมุทรสงคราม",
    duration: "2 วัน 1 คืน",
    group: "สำหรับกลุ่ม 10–12 ท่าน",
    priceNow: "6,500",
    priceOld: "10,900",
    priceUnit: "บาท / ท่าน",
    theme: { primary: "#1c7fb0", accent: "#2bb8d6", tint: "#e6f4f8" },
    hero: "https://picsum.photos/seed/bh-amphawa-hero/1200/800",
    intro:
      "สัมผัสประสบการณ์ Wellness Retreat ท่ามกลางธรรมชาติริมคลองอัมพวา " +
      "เรียนรู้การดูแลสุขภาพกายและใจอย่างสมดุล และกิจกรรมเชื่อมสัมพันธ์ในบรรยากาศอบอุ่น",
    experiences: [
      { title: "Workshop", th: "ธาตุเจ้าเรือน & น้ำมันหอมระเหย", desc: "เรียนรู้ธาตุเจ้าเรือน และผสมน้ำมันหอมระเหยเฉพาะบุคคล", img: "https://picsum.photos/seed/bh-amp-1/500/400" },
      { title: "Yoga & Meditation", th: "โยคะ & สมาธิ", desc: "เติมพลังกายและใจ ด้วยการฝึกโยคะและสมาธิ ในบรรยากาศริมน้ำ", img: "https://picsum.photos/seed/bh-amp-2/500/400" },
      { title: "Healthy Dinner", th: "อาหารสุขภาพ", desc: "จากวัตถุดิบท้องถิ่น อร่อย ดีต่อใจ", img: "https://picsum.photos/seed/bh-amp-3/500/400" },
      { title: "Music & Connection Night", th: "", desc: "เชื่อมสัมพันธ์และแบ่งปัน ในบรรยากาศอบอุ่น", img: "https://picsum.photos/seed/bh-amp-4/500/400" },
    ],
    includes: [
      "ที่พัก 1 คืน — Amphawa Hideaway Homestay",
      "อาหารสุขภาพ 2 มื้อ",
      "Workshop ธาตุเจ้าเรือน & น้ำมันหอมระเหย",
      "Yoga & Meditation Session",
      "Music & Connection Night",
      "Wellness Facilitator ตลอดโปรแกรม",
    ],
    venue: {
      name: "Amphawa Hideaway Homestay",
      desc: "ที่พักติดริมคลองอัมพวา ท่ามกลางธรรมชาติและวิถีชีวิตชุมชนอัมพวา สัมผัสความสงบ เรียบง่าย ใกล้ชิดธรรมชาติ เพื่อกิจกรรมเพื่อสุขภาพอย่างแท้จริง",
      images: ["https://picsum.photos/seed/bh-amp-v1/500/400", "https://picsum.photos/seed/bh-amp-v2/500/400", "https://picsum.photos/seed/bh-amp-v3/500/400"],
    },
    itinerary: [
      { day: "Day 1", title: "Workshop & Connection Night", items: [
        { time: "13.00", text: "Welcome Check in" },
        { time: "14.00", text: "Workshop ธาตุเจ้าเรือน & น้ำมันหอมระเหย" },
        { time: "18.00", text: "Healthy Dinner / Music & Connection Night" },
      ]},
      { day: "Day 2", title: "Recharge & Balance For Corporate", items: [
        { time: "06.30", text: "Yoga & Meditation" },
        { time: "08.00", text: "Local Breakfast" },
        { time: "09.00–12.00", text: "Private Corporate Session — Team Meeting, Team Building, Workshop, Town Hall, Strategic Meeting และอื่นๆ" },
        { time: "12.00", text: "Check out" },
      ]},
    ],
  },

  /* ---------------------------------------------------------- */
  "golden-life": {
    id: "golden-life",
    name: "Golden Life Wellness Retreat",
    category: "Retirement",
    kicker: "Golden Life",
    tagline: ["Live Well", "Age Well", "Retire Well"],
    location: "Anantara Hua Hin · ประจวบคีรีขันธ์",
    duration: "3 วัน 2 คืน",
    group: "โปรแกรมเตรียมความพร้อมสู่ชีวิตหลังเกษียณอย่างมีคุณภาพ",
    priceNow: "29,000",
    priceOld: "",
    priceUnit: "บาท / ท่าน (พัก 2 ท่าน)",
    priceNote: "พัก 1 ท่าน 33,000 บาท / ท่าน",
    theme: { primary: "#1f4d3a", accent: "#c9a24b", tint: "#eef2ec" },
    hero: "https://picsum.photos/seed/bh-golden-hero/1200/800",
    intro:
      "โปรแกรมเตรียมความพร้อมสู่ชีวิตหลังเกษียณอย่างมีคุณภาพ ดูแลสุขภาพ เรียนรู้ วางแผนชีวิต " +
      "และเชื่อมต่อกับเพื่อนใหม่ ในรีสอร์ทระดับ 5 ดาวริมทะเลหัวหิน",
    experiences: [
      { title: "Health Check", th: "ตรวจสุขภาพ", desc: "ตรวจและประเมินร่างกายโดยผู้เชี่ยวชาญ", img: "https://picsum.photos/seed/bh-gl-1/500/400" },
      { title: "Workshop", th: "สุขภาพวัยเกษียณ", desc: "เรียนรู้โภชนาการ การออกกำลังกาย การนอนหลับ และการป้องกันโรคไม่ติดต่อเรื้อรัง", img: "https://picsum.photos/seed/bh-gl-2/500/400" },
      { title: "Yoga & Meditation", th: "", desc: "เสริมสร้างความยืดหยุ่น ลดความเครียด ผ่อนคลายจิตใจ", img: "https://picsum.photos/seed/bh-gl-3/500/400" },
      { title: "Body & Mind Retreat", th: "", desc: "ปรับสมดุลร่างกายและจิตใจ ด้วย Recovery Massage & Sound Healing", img: "https://picsum.photos/seed/bh-gl-4/500/400" },
      { title: "Food as Medicine", th: "อาหารสุขภาพ", desc: "อาหารที่ดีต่อร่างกายตามหลักโภชนาการและสมดุล", img: "https://picsum.photos/seed/bh-gl-5/500/400" },
    ],
    includes: [
      "ห้องพัก 2 คืน — Anantara Hua Hin Resort & Spa",
      "อาหารสุขภาพ (Food as Medicine) ตลอดโปรแกรม",
      "ตรวจสุขภาพและวิเคราะห์องค์ประกอบร่างกาย",
      "ปรึกษาผู้เชี่ยวชาญด้านสุขภาพ",
      "Yoga & Meditation / Body & Mind Retreat",
      "Workshop สุขภาพวัยเกษียณ",
      "แผนดูแลสุขภาพเฉพาะบุคคล + คำแนะนำระยะยาว",
      "Wellness Facilitator ตลอดโปรแกรม",
    ],
    venue: {
      name: "Anantara Hua Hin Resort & Spa",
      desc: "รีสอร์ทริมทะเลหัวหิน ระดับ 5 ดาว บรรยากาศเงียบสงบ ร่มรื่น เหมาะสำหรับการพักผ่อนและฟื้นฟูสุขภาพอย่างแท้จริง",
      images: ["https://picsum.photos/seed/bh-gl-v1/500/400", "https://picsum.photos/seed/bh-gl-v2/500/400", "https://picsum.photos/seed/bh-gl-v3/500/400"],
    },
    itinerary: [
      { day: "Day 1", title: "เริ่มต้นดูแลสุขภาพ", items: [
        { time: "14.00", text: "Welcome Check-in" },
        { time: "15.00", text: "ตรวจสุขภาพเบื้องต้น — วิเคราะห์องค์ประกอบร่างกาย, วัดความดัน, ประเมินพฤติกรรมสุขภาพ" },
        { time: "16.30", text: "กิจกรรมเดินเขียว และเพิ่มความยืดหยุ่นของร่างกาย" },
        { time: "18.30", text: "อาหารสุขภาพ (Food as Medicine)" },
        { time: "20.00", text: "พักผ่อนตามอัธยาศัย" },
      ]},
      { day: "Day 2", title: "ฟื้นฟูร่างกายและเรียนรู้การดูแลสุขภาพ", items: [
        { time: "07.00", text: "Yoga & Meditation" },
        { time: "08.00", text: "อาหารเช้า" },
        { time: "09.30", text: "Workshop สุขภาพวัยเกษียณ — โภชนาการวัย 50+, การนอนหลับ, การป้องกันโรค NCDs" },
        { time: "12.00", text: "อาหารกลางวัน" },
        { time: "14.00", text: "Body & Mind Retreat — Recovery Massage & Sound Healing" },
        { time: "18.30", text: "อาหารเย็น" },
        { time: "20.00", text: "Music & Connection" },
      ]},
      { day: "Day 3", title: "วางแผนสุขภาพระยะยาว", items: [
        { time: "07.00", text: "เดินออกกำลังกายและฝึกการหายใจ" },
        { time: "09.30", text: "อาหารเช้า / สรุปและแลกเปลี่ยนประสบการณ์" },
        { time: "10.00", text: "รับคำแนะนำการดูแลสุขภาพระยะยาว" },
        { time: "12.00", text: "Check-out" },
      ]},
    ],
  },

  /* ---------------------------------------------------------- */
  "rebalance": {
    id: "rebalance",
    name: "Rebalance Retreat",
    category: "Corporate",
    kicker: "Rebalance Retreat",
    tagline: ["Play Better", "Recover Faster", "Healthier Holiday"],
    location: "ริมน้ำแควน้อย · กาญจนบุรี",
    duration: "2 วัน 1 คืน",
    group: "สำหรับกลุ่ม 10–12 ท่าน",
    priceNow: "ติดต่อสอบถาม",
    priceOld: "",
    priceUnit: "",
    theme: { primary: "#2094a8", accent: "#ef9ba7", tint: "#e7f4f5" },
    hero: "https://picsum.photos/seed/bh-rebalance-hero/1200/800",
    intro:
      "มาสัมผัสประสบการณ์เวลาท่ามกลางธรรมชาติริมน้ำแควน้อย จังหวัดกาญจนบุรี " +
      "โปรแกรมที่ออกแบบมาเพื่อส่งเสริมสุขภาวะบุคลากร ทั้งร่างกาย จิตใจ และกิจกรรม Wellness ที่ช่วยสร้างความสมดุลอย่างยั่งยืน",
    experiences: [
      { title: "Move", th: "Yoga & Meditation", desc: "คลายความตึงเครียดสะสม ฟื้นฟูร่างกาย และจิตใจ", img: "https://picsum.photos/seed/bh-rb-1/500/400" },
      { title: "Nourish", th: "Food as Medicine", desc: "สัมผัสอาหารและวัตถุดิบธรรมชาติ เพื่อพลังงานที่ดีต่อคุณ", img: "https://picsum.photos/seed/bh-rb-2/500/400" },
      { title: "Recharge", th: "Sound Healing", desc: "ผ่อนคลายอย่างลึกซึ้ง ผ่านการบำบัดด้วยเสียง", img: "https://picsum.photos/seed/bh-rb-3/500/400" },
      { title: "Wellness Workshop", th: "Office Syndrome Prevention", desc: "เรียนรู้และฝึกปฏิบัติจริง เพื่อดูแลสุขภาพพนักงาน", img: "https://picsum.photos/seed/bh-rb-4/500/400" },
    ],
    includes: [
      "ที่พัก 1 คืน — Makham Villa Kanchanaburi",
      "อาหารสุขภาพ (Food as Medicine)",
      "Yoga & Meditation Session",
      "Sound Healing",
      "Wellness Workshop — Office Syndrome Prevention",
      "Wellness Facilitator ตลอดโปรแกรม",
    ],
    venue: {
      name: "Makham Villa Kanchanaburi",
      desc: "รีสอร์ทสไตล์ Modern Tropical ที่รายล้อมด้วยธรรมชาติอันร่มรื่น และสายน้ำอันสงบ เหมาะสำหรับการพักผ่อน ฟื้นฟูสุขภาพ และกิจกรรม Wellness แบบกลุ่ม",
      images: ["https://picsum.photos/seed/bh-rb-v1/500/400", "https://picsum.photos/seed/bh-rb-v2/500/400", "https://picsum.photos/seed/bh-rb-v3/500/400"],
    },
    itinerary: [
      { day: "Day 1", title: "Recharge & Recover", items: [
        { time: "13.00", text: "Welcome Check in" },
        { time: "14.00", text: "Wellness Workshop — Office Syndrome Prevention" },
        { time: "16.30", text: "Sound Healing" },
        { time: "18.00", text: "Healthy Dinner (Food as Medicine) / Music & Connection" },
      ]},
      { day: "Day 2", title: "Move & Rebalance", items: [
        { time: "06.30", text: "Move — Yoga & Meditation" },
        { time: "08.00", text: "Local Breakfast" },
        { time: "09.00–12.00", text: "Private Corporate Session / กิจกรรมกลุ่ม" },
        { time: "12.00", text: "Check out" },
      ]},
    ],
  },

  /* ---------------------------------------------------------- */
  "golf": {
    id: "golf",
    name: "Golf Recovery Retreat",
    category: "Golf & Sport",
    kicker: "Golf Recovery",
    tagline: ["Play Better", "Recover Faster", "Healthier Holiday"],
    location: "Anantara Hua Hin + Black Mountain Golf Club",
    duration: "3 วัน 2 คืน",
    group: "สำหรับกลุ่ม 12–24 ท่าน",
    priceNow: "33,000",
    priceOld: "",
    priceUnit: "บาท / ท่าน (พัก 2 ท่าน)",
    priceNote: "พัก 1 ท่าน 37,000 บาท / ท่าน",
    theme: { primary: "#166b8c", accent: "#2bb8d6", tint: "#e6f2f6" },
    hero: "https://picsum.photos/seed/bh-golf-hero/1200/800",
    intro:
      "ประสบการณ์กอล์ฟเพื่อการฟื้นฟูร่างกายและจิตใจ ทำให้เล่นดีขึ้น ฟื้นตัวไวขึ้น และได้พักผ่อนอย่างมีคุณภาพ " +
      "Improve Mobility · Enhance Performance · Recover Faster · Sleep Better · Feel Healthier",
    experiences: [
      { title: "Dynamic Warm Up", th: "for Golfers", desc: "อบอุ่นร่างกายอย่างถูกวิธี เตรียมพร้อมก่อนออกรอบ", img: "https://picsum.photos/seed/bh-golf-1/500/400" },
      { title: "Sports Recovery Massage", th: "", desc: "นวดฟื้นฟูกล้ามเนื้อ ลดอาการตึงและเมื่อยล้า", img: "https://picsum.photos/seed/bh-golf-2/500/400" },
      { title: "Personal Wellness Assessment", th: "", desc: "ประเมินสมรรถภาพร่างกายและวิเคราะห์เพื่อวางแผนฟื้นฟู", img: "https://picsum.photos/seed/bh-golf-3/500/400" },
      { title: "18 Hole Golf & Recovery", th: "", desc: "ตีกอล์ฟพร้อมฟื้นฟูสุขภาพ", img: "https://picsum.photos/seed/bh-golf-4/500/400" },
      { title: "Healthy Food", th: "", desc: "อาหารเพื่อสุขภาพ อร่อย ครบโภชนาการ", img: "https://picsum.photos/seed/bh-golf-5/500/400" },
      { title: "Yoga Meditation & Sound Healing", th: "", desc: "ผ่อนคลายจิตใจ ลดความเครียด ด้วยโยคะและเสียงบำบัด", img: "https://picsum.photos/seed/bh-golf-6/500/400" },
    ],
    includes: [
      "ที่พัก Anantara Hua Hin — Garden View Room 2 คืน",
      "ออกรอบ Black Mountain Golf Club 1 Round",
      "Healthy Dining 5 Meals",
      "Personal Wellness Assessment",
      "Spot Recovery Massage",
      "Yoga & Sound Healing Meditation",
      "Wellness Workshop + Your Wellness Host",
      "ของที่ระลึกจาก B-Healthy",
    ],
    venue: {
      name: "Anantara Hua Hin Resort & Black Mountain Golf Club",
      desc: "รีสอร์ทระดับ 5 ดาว Luxury Beachfront Resort คู่กับสนามกอล์ฟระดับ Championship Course ที่ได้รับการยอมรับในระดับโลก พร้อมทัศนียภาพสวยงามและมาตรฐานการเล่นระดับมืออาชีพ",
      images: ["https://picsum.photos/seed/bh-golf-v1/500/400", "https://picsum.photos/seed/bh-golf-v2/500/400", "https://picsum.photos/seed/bh-golf-v3/500/400"],
    },
    itinerary: [
      { day: "Day 1", title: "Health Check up, Mobility & Golf Movement Screening", items: [
        { time: "13.30", text: "Welcome Check in" },
        { time: "15.00", text: "Personal Wellness Assessment — Body Composition, ตรวจกล้ามเนื้อโดยแพทย์แผนไทย, Mobility & Golf Movement Screening" },
        { time: "18.00", text: "Dinner (Food as Medicine)" },
      ]},
      { day: "Day 2", title: "18-Hole Championship & Deep Recovery", items: [
        { time: "05.30", text: "ออกเดินทาง Black Mountain Golf Club (by Van)" },
        { time: "06.00", text: "Healthy Breakfast & Drinks" },
        { time: "07.00", text: "Dynamic Warm Up" },
        { time: "08.00", text: "Tee Off (18 Holes)" },
        { time: "12.30", text: "Lunch at Isara Cafe" },
        { time: "14.00", text: "Sport Recovery Massage / Wellness Workshop" },
        { time: "18.00", text: "Dinner & Music Connection" },
      ]},
      { day: "Day 3", title: "Tea Connect & Takeaway", items: [
        { time: "07.00", text: "Breakfast (Buffet)" },
        { time: "10.00", text: "Tea Connect (Soft drink, gift set)" },
        { time: "12.00", text: "Check out" },
      ]},
    ],
  },
};

window.PACKAGE_ORDER = ["amphawa", "golden-life", "rebalance", "golf"];

/* ---- English strings (parallel to the Thai fields above) ---- */
window.PACKAGES_EN = {
  "amphawa": {
    location: "Amphawa Canal · Samut Songkhram",
    duration: "2 Days 1 Night",
    group: "For groups of 10–12",
    priceUnit: "THB / person",
    priceNow: "6,500",
    intro: "Experience a Wellness Retreat amid nature by the Amphawa Canal — learn to care for body and mind in balance, with bonding activities in a warm atmosphere.",
    expDesc: [
      "Learn about your body's elements and blend a personal aromatherapy oil",
      "Recharge body and mind with yoga and meditation by the water",
      "From local ingredients — delicious and good for you",
      "Connect and share in a warm atmosphere",
    ],
    includes: [
      "1-night stay — Amphawa Hideaway Homestay",
      "2 healthy meals",
      "Workshop: body elements & aromatherapy oil",
      "Yoga & Meditation Session",
      "Music & Connection Night",
      "Wellness Facilitator throughout",
    ],
    itinerary: [
      { title: "Workshop & Connection Night", items: ["Welcome Check in", "Workshop: body elements & aromatherapy oil", "Healthy Dinner / Music & Connection Night"] },
      { title: "Recharge & Balance For Corporate", items: ["Yoga & Meditation", "Local Breakfast", "Private Corporate Session — Team Meeting, Team Building, Workshop, Town Hall, Strategic Meeting & more", "Check out"] },
    ],
    venueDesc: "A stay right on the Amphawa Canal, surrounded by nature and the local way of life — calm, simple, and close to nature for a truly wellness experience.",
  },
  "golden-life": {
    location: "Anantara Hua Hin · Prachuap Khiri Khan",
    duration: "3 Days 2 Nights",
    group: "A program preparing you for a quality life after retirement",
    priceUnit: "THB / person (double occupancy)",
    priceNote: "Single occupancy 33,000 THB / person",
    intro: "A program to prepare for a quality life after retirement — care for your health, learn, plan your life, and connect with new friends at a 5-star beachfront resort in Hua Hin.",
    expDesc: [
      "Health check and physical assessment by specialists",
      "Learn nutrition, exercise, sleep, and prevention of chronic diseases",
      "Build flexibility, reduce stress, relax the mind",
      "Rebalance body and mind with Recovery Massage & Sound Healing",
      "Food that's good for the body, based on nutrition and balance",
    ],
    includes: [
      "2-night stay — Anantara Hua Hin Resort & Spa",
      "Healthy meals (Food as Medicine) throughout",
      "Health check & body composition analysis",
      "Consultation with health specialists",
      "Yoga & Meditation / Body & Mind Retreat",
      "Retirement wellness Workshop",
      "Personalized wellness plan + long-term guidance",
      "Wellness Facilitator throughout",
    ],
    itinerary: [
      { title: "Start your wellness journey", items: ["Welcome Check-in", "Initial health check — body composition, blood pressure, health behavior", "Green walk & flexibility activity", "Healthy dinner (Food as Medicine)", "Free time"] },
      { title: "Restore the body & learn wellness", items: ["Yoga & Meditation", "Breakfast", "Retirement wellness Workshop — 50+ nutrition, sleep, NCD prevention", "Lunch", "Body & Mind Retreat — Recovery Massage & Sound Healing", "Dinner", "Music & Connection"] },
      { title: "Plan long-term health", items: ["Morning exercise & breathing practice", "Breakfast / recap & sharing", "Receive long-term health guidance", "Check-out"] },
    ],
    venueDesc: "A 5-star beachfront resort in Hua Hin — quiet, calm, and shaded; perfect for true rest and health restoration.",
  },
  "rebalance": {
    location: "Khwae Noi River · Kanchanaburi",
    duration: "2 Days 1 Night",
    group: "For groups of 10–12",
    priceUnit: "",
    priceNow: "Contact us",
    intro: "Come experience time in nature by the Khwae Noi River, Kanchanaburi — a program designed to promote employee well-being in body and mind, with Wellness activities that build lasting balance.",
    expDesc: [
      "Release built-up tension, restore body and mind",
      "Experience natural food and ingredients for energy that's good for you",
      "Deep relaxation through sound therapy",
      "Learn and practice hands-on to care for employees' health",
    ],
    includes: [
      "1-night stay — Makham Villa Kanchanaburi",
      "Healthy meals (Food as Medicine)",
      "Yoga & Meditation Session",
      "Sound Healing",
      "Wellness Workshop — Office Syndrome Prevention",
      "Wellness Facilitator throughout",
    ],
    itinerary: [
      { title: "Recharge & Recover", items: ["Welcome Check in", "Wellness Workshop — Office Syndrome Prevention", "Sound Healing", "Healthy Dinner (Food as Medicine) / Music & Connection"] },
      { title: "Move & Rebalance", items: ["Move — Yoga & Meditation", "Local Breakfast", "Private Corporate Session / group activities", "Check out"] },
    ],
    venueDesc: "A Modern Tropical resort surrounded by lush nature and calm waters — ideal for rest, health restoration, and group Wellness activities.",
  },
  "golf": {
    location: "Anantara Hua Hin + Black Mountain Golf Club",
    duration: "3 Days 2 Nights",
    group: "For groups of 12–24",
    priceUnit: "THB / person (double occupancy)",
    priceNote: "Single occupancy 37,000 THB / person",
    intro: "A golf experience for physical and mental recovery — play better, recover faster, and rest with quality. Improve Mobility · Enhance Performance · Recover Faster · Sleep Better · Feel Healthier",
    expDesc: [
      "Warm up properly and get ready before the round",
      "Recovery massage to relieve muscle tension and fatigue",
      "Assess fitness and analyze for a recovery plan",
      "Play golf while restoring your health",
      "Healthy food, delicious and well-balanced",
      "Relax the mind and reduce stress with yoga and sound healing",
    ],
    includes: [
      "Anantara Hua Hin — Garden View Room 2 nights",
      "1 round at Black Mountain Golf Club",
      "Healthy Dining 5 Meals",
      "Personal Wellness Assessment",
      "Spot Recovery Massage",
      "Yoga & Sound Healing Meditation",
      "Wellness Workshop + Your Wellness Host",
      "Souvenir from B-Healthy",
    ],
    itinerary: [
      { title: "Health Check up, Mobility & Golf Movement Screening", items: ["Welcome Check in", "Personal Wellness Assessment — Body Composition, muscle check by Thai traditional physician, Mobility & Golf Movement Screening", "Dinner (Food as Medicine)"] },
      { title: "18-Hole Championship & Deep Recovery", items: ["Depart to Black Mountain Golf Club (by Van)", "Healthy Breakfast & Drinks", "Dynamic Warm Up", "Tee Off (18 Holes)", "Lunch at Isara Cafe", "Sport Recovery Massage / Wellness Workshop", "Dinner & Music Connection"] },
      { title: "Tea Connect & Takeaway", items: ["Breakfast (Buffet)", "Tea Connect (Soft drink, gift set)", "Check out"] },
    ],
    venueDesc: "A 5-star Luxury Beachfront Resort paired with a world-recognized Championship golf course — beautiful scenery and professional-standard play.",
  },
};
