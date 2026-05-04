// Seed script — run with: node scripts/seed-firebase.mjs
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0xcKxHBNDP9kWhMfFaNqd2B-aaZZieOA",
  authDomain: "oxford-school-b9c15.firebaseapp.com",
  projectId: "oxford-school-b9c15",
  storageBucket: "oxford-school-b9c15.firebasestorage.app",
  messagingSenderId: "800618786995",
  appId: "1:800618786995:web:8746fbbe469d2f5e6440c6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function isEmpty(name) {
  const q = query(collection(db, name), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

// ===== DATA =====

const NEWS = [
  {
    title: "6 Students Selected for Navodaya — 6th Rank in Belagavi District!",
    description: "In the first round of 2027 Navodaya entrance results, 6 students from New Oxford Coaching Classes have been selected: Basavaraj Valasang, Amara Bhabhanagar, Nagesh Savalagi, Bhagyashri Sindagi, Vishala Mujagoni & Vikas Shinge.",
    content: "New Oxford Coaching Classes students achieve remarkable results in 2026-27 entrance exams. In the Navodaya entrance, 6 students were selected in the first round itself — Basavaraj Valasang (Kannal), Nagesh Savalagi (Hunnur), Amara Bhabhanagar (Honawad), Vishala Mujagoni (Partanahalli), Bhagyashri Sindagi (Telsang) & Vikas Shinge (Tubachi). This is the best result in the region, securing 6th rank in Belagavi district.",
    image_path: "/img/congactulations/congracts2.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-03-21T00:00:00.000Z", created_at: "2026-03-21T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "64 out of 68 Qualify in Sainik School Entrance Exam",
    description: "In the All India Sainik School entrance exam held on 18 January 2026, 68 students appeared from our institution. 64 students qualified — an exceptional success rate of over 94%.",
    content: "Outstanding performance in the Sainik School entrance examination. 68 students from New Oxford Coaching Classes appeared, and 64 qualified — a remarkable 94% success rate. Top scorers include Basavaraj Valasang (258), Nitheesh Benakatti (255), Amara Bhabhanagar (251), Om Sai Lad (251), Nagesh Savalagi (243), Sireesh Kakhandaki (242), Bhagyashri Sindagi (241), and many more.",
    image_path: "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-03-20T00:00:00.000Z", created_at: "2026-03-20T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "3 Students Selected for Kittur Rani Channamma Vasati Shale",
    description: "Poorvi Benade, Anushri Billur & Pratiksha Savant have been selected for Kittur Rani Channamma Vasati Shale in the 2026-27 entrance exams.",
    content: "In the Kittur Rani Channamma Vasati Shale entrance exam for 2026-27, three of our students — Poorvi Benade (Jamkhandi), Anushri Billur (Tubachi) and Pratiksha Savant — secured admission.",
    image_path: "/img/congactulations/congracts5.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-03-19T00:00:00.000Z", created_at: "2026-03-19T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "Felicitation Ceremony for Navodaya Selected Students",
    description: "A grand felicitation ceremony was organized to honour students selected for Navodaya. The event was covered by Udayavani newspaper.",
    content: "Selected students for Navodaya were felicitated at a ceremony attended by village leaders, parents, and well-wishers. Speakers praised the institution's commitment to service, culture and education. The event was covered in Udayavani newspaper.",
    image_path: "/img/newspaper/news1.jpeg",
    category: "Events", is_featured: false, is_active: true,
    published_at: "2026-03-22T00:00:00.000Z", created_at: "2026-03-22T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "Admissions Open for 2026-27 — Limited Seats!",
    description: "Coaching for Navodaya, Sainik School, Adarsha Vidyalaya, Kittur, Murarji & R.M.S. entrance exams. Classes for 4th and 5th standard students in English & Kannada medium.",
    content: "New Oxford Coaching Classes is accepting admissions for 2026-27. Summer batch starts April 5, regular classes from June 7. Available for 4th and 5th class students. English and Kannada medium. Hostel and day-scholar options available at both Jamkhandi and Athani branches. Contact: 9590483488, 9740412339.",
    image_path: "/img/admissions/admission3.jpeg",
    category: "Admissions", is_featured: false, is_active: true,
    published_at: "2026-03-25T00:00:00.000Z", created_at: "2026-03-25T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "MLA Laxman Savadi Honors Navodaya Selected Students",
    description: "Athani MLA Laxman Savadi distributed smartwatches to students selected for Navodaya from New Oxford Coaching Classes.",
    content: "During a grand ceremony at Telsang, Athani MLA Laxman Savadi honored six students who secured admission to Jawahar Navodaya Vidyalaya. He emphasized that education is the foundation for life and praised the institution's commitment to excellence.",
    image_path: "/img/newspaper/news1.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-05-02T00:00:00.000Z", created_at: "2026-05-02T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "Record-Breaking Results: 6 Navodaya, 3 Kittur, and 64 Sainik School Selections",
    description: "New Oxford Coaching Classes records its best results yet with 94% qualification in Sainik School entrance and multiple selections in Navodaya and Kittur schools.",
    content: "The 2026-27 entrance results for various residential schools are out. Our students have achieved remarkable success: 6 selections for Navodaya, 3 for Kittur Rani Chennamma, and an astounding 64 out of 68 students qualified for Sainik School.",
    image_path: "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-05-02T00:00:00.000Z", created_at: "2026-05-02T00:00:00.000Z", created_by: "seed",
  },
];

const ACHIEVERS = [
  { name: "Basavaraj Valasang", stream: "Navodaya & Sainik", year: 2026, percentage: "258 marks", rank: "Navodaya Selected — 1st in Institution", image_path: "/img/congactulations/congracts2.jpeg", is_featured: true, display_order: 1 },
  { name: "Nitheesh Benakatti", stream: "Sainik School", year: 2026, percentage: "255 marks", rank: "Sainik School Qualified", image_path: "/img/congactulations/congracts3.jpeg", is_featured: true, display_order: 2 },
  { name: "Amara Bhabhanagar", stream: "Navodaya & Sainik", year: 2026, percentage: "251 marks", rank: "Navodaya Selected", image_path: "/img/congactulations/congracts4.jpeg", is_featured: true, display_order: 3 },
  { name: "Nagesh Savalagi", stream: "Navodaya & Sainik", year: 2026, percentage: "243 marks", rank: "Navodaya Selected", image_path: "/img/congactulations/congracts5.jpeg", is_featured: true, display_order: 4 },
  { name: "Bhagyashri Sindagi", stream: "Navodaya & Sainik", year: 2026, percentage: "241 marks", rank: "Navodaya Selected", image_path: "/img/congactulations/congracts6.jpeg", is_featured: true, display_order: 5 },
  { name: "Vishala Mujagoni", stream: "Navodaya & Sainik", year: 2026, percentage: "210 marks", rank: "Navodaya Selected", image_path: "/img/congactulations/congracts7.jpeg", is_featured: true, display_order: 6 },
  { name: "Vikas Shinge", stream: "Navodaya & Sainik", year: 2026, percentage: "Selected", rank: "Navodaya Selected", image_path: "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg", is_featured: true, display_order: 7 },
  { name: "Poorvi Benade", stream: "Kittur Vasati Shale", year: 2026, percentage: "Selected", rank: "Kittur Selected", image_path: "/img/congactulations/congracts2.jpeg", is_featured: true, display_order: 8 },
];

const GALLERY = [
  { title: "Student Felicitation with DCM", category: "Events", image_path: "/img/congactulations/congracts5.jpeg", is_featured: true, display_order: 1 },
  { title: "Smart Watch Distribution Ceremony", category: "Events", image_path: "/img/congactulations/congracts6.jpeg", is_featured: true, display_order: 2 },
  { title: "Felicitation Coverage — Udayavani", category: "Events", image_path: "/img/newspaper/news1.jpeg", is_featured: true, display_order: 3 },
  { title: "Felicitation Poster — Udayavani", category: "Events", image_path: "/img/newspaper/news5.jpeg", is_featured: true, display_order: 4 },
  { title: "Sainik School Results Poster", category: "Events", image_path: "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg", is_featured: true, display_order: 6 },
  { title: "Navodaya + Kittur Selections 2026-27", category: "Achievements", image_path: "/img/congactulations/congracts2.jpeg", is_featured: false, display_order: 7 },
  { title: "All Results Compilation", category: "Achievements", image_path: "/img/congactulations/congracts3.jpeg", is_featured: false, display_order: 8 },
  { title: "Detailed Student Results", category: "Achievements", image_path: "/img/congactulations/congracts4.jpeg", is_featured: false, display_order: 9 },
  { title: "Full Results + Admissions Poster", category: "Admissions", image_path: "/img/admissions/admission1.jpeg", is_featured: false, display_order: 10 },
  { title: "2026-27 Admissions Poster", category: "Admissions", image_path: "/img/admissions/admission3.jpeg", is_featured: false, display_order: 11 },
  { title: "Admission Open Banner", category: "Admissions", image_path: "/img/admissions/admission4.jpeg", is_featured: false, display_order: 12 },
  { title: "Hasiru Kranti Coverage", category: "Press Coverage", image_path: "/img/newspaper/news4.jpeg", is_featured: false, display_order: 13 },
  { title: "Kannada Prabha Coverage", category: "Press Coverage", image_path: "/img/newspaper/news8.jpeg", is_featured: false, display_order: 14 },
  { title: "Newspaper Results Article", category: "Press Coverage", image_path: "/img/newspaper/news2.jpeg", is_featured: false, display_order: 15 },
];

const MARQUEE = [
  { text: "Admissions Open for 2026-27 — Navodaya, Sainik School & Adarsha Vidyalaya Coaching!", icon: "megaphone", highlight: true, is_active: true, display_order: 1 },
  { text: "64 out of 68 selections — 6th Rank in Belagavi District!", icon: "trophy", highlight: true, is_active: true, display_order: 2 },
  { text: "6 students selected for Navodaya in first round — Basavaraj, Amara, Nagesh, Bhagyashri, Vishala & Vikas!", icon: "trophy", highlight: false, is_active: true, display_order: 3 },
];

const BANNER = {
  text: "Admissions Open for 2026-27 — Navodaya, Sainik School & Adarsha Vidyalaya Coaching — Limited Seats!",
  emoji: "🎓",
  is_active: true,
};

// ===== SEED =====

async function seed() {
  const now = new Date().toISOString();
  let total = 0;

  // News — force seed (delete existing first if any)
  console.log("\n📰 Seeding news...");
  try {
    const existing = await getDocs(collection(db, "news"));
    if (!existing.empty) {
      console.log(`   Found ${existing.size} existing news — skipping (delete manually in Firebase console to re-seed)`);
    } else {
      for (const item of NEWS) {
        await addDoc(collection(db, "news"), item);
      }
      console.log(`   ✅ Seeded ${NEWS.length} news items`);
      total += NEWS.length;
    }
  } catch (e) { console.error("   ❌ News failed:", e.message); }

  // Achievers
  console.log("🏆 Seeding achievers...");
  try {
    if (await isEmpty("achievers")) {
      for (const item of ACHIEVERS) {
        await addDoc(collection(db, "achievers"), { ...item, created_at: now, created_by: "seed" });
      }
      console.log(`   ✅ Seeded ${ACHIEVERS.length} achievers`);
      total += ACHIEVERS.length;
    } else { console.log("   Skipped — already has data"); }
  } catch (e) { console.error("   ❌ Achievers failed:", e.message); }

  // Gallery
  console.log("🖼️  Seeding gallery...");
  try {
    if (await isEmpty("gallery")) {
      for (const item of GALLERY) {
        await addDoc(collection(db, "gallery"), { ...item, created_at: now, created_by: "seed" });
      }
      console.log(`   ✅ Seeded ${GALLERY.length} gallery images`);
      total += GALLERY.length;
    } else { console.log("   Skipped — already has data"); }
  } catch (e) { console.error("   ❌ Gallery failed:", e.message); }

  // Marquee
  console.log("📢 Seeding marquee messages...");
  try {
    if (await isEmpty("marquee_messages")) {
      for (const item of MARQUEE) {
        await addDoc(collection(db, "marquee_messages"), { ...item, created_at: now, updated_at: now, created_by: "seed" });
      }
      console.log(`   ✅ Seeded ${MARQUEE.length} marquee messages`);
      total += MARQUEE.length;
    } else { console.log("   Skipped — already has data"); }
  } catch (e) { console.error("   ❌ Marquee failed:", e.message); }

  // Admission Banner
  console.log("🎓 Seeding admission banner...");
  try {
    if (await isEmpty("admission_banner")) {
      await addDoc(collection(db, "admission_banner"), { ...BANNER, updated_at: now, updated_by: "seed" });
      console.log("   ✅ Seeded admission banner");
      total += 1;
    } else { console.log("   Skipped — already has data"); }
  } catch (e) { console.error("   ❌ Banner failed:", e.message); }

  console.log(`\n🎉 Done! Seeded ${total} total documents.\n`);
  process.exit(0);
}

seed();
