// Force-seed news — run with: node scripts/seed-news.mjs
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC0xcKxHBNDP9kWhMfFaNqd2B-aaZZieOA",
  authDomain: "oxford-school-b9c15.firebaseapp.com",
  projectId: "oxford-school-b9c15",
  storageBucket: "oxford-school-b9c15.firebasestorage.app",
  messagingSenderId: "800618786995",
  appId: "1:800618786995:web:8746fbbe469d2f5e6440c6",
});
const db = getFirestore(app);

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
    content: "Outstanding performance in the Sainik School entrance examination. 68 students from New Oxford Coaching Classes appeared, and 64 qualified — a remarkable 94% success rate.",
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
    content: "Selected students for Navodaya were felicitated at a ceremony attended by village leaders, parents, and well-wishers.",
    image_path: "/img/newspaper/news1.jpeg",
    category: "Events", is_featured: false, is_active: true,
    published_at: "2026-03-22T00:00:00.000Z", created_at: "2026-03-22T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "Admissions Open for 2026-27 — Limited Seats!",
    description: "Coaching for Navodaya, Sainik School, Adarsha Vidyalaya, Kittur, Murarji & R.M.S. entrance exams. Classes for 4th and 5th standard students.",
    content: "New Oxford Coaching Classes is accepting admissions for 2026-27. Summer batch starts April 5, regular classes from June 7. Contact: 9590483488, 9740412339.",
    image_path: "/img/admissions/admission3.jpeg",
    category: "Admissions", is_featured: false, is_active: true,
    published_at: "2026-03-25T00:00:00.000Z", created_at: "2026-03-25T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "MLA Laxman Savadi Honors Navodaya Selected Students",
    description: "Athani MLA Laxman Savadi distributed smartwatches to students selected for Navodaya from New Oxford Coaching Classes.",
    content: "During a grand ceremony at Telsang, Athani MLA Laxman Savadi honored six students who secured admission to Jawahar Navodaya Vidyalaya.",
    image_path: "/img/newspaper/news1.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-05-02T00:00:00.000Z", created_at: "2026-05-02T00:00:00.000Z", created_by: "seed",
  },
  {
    title: "Record-Breaking Results: 6 Navodaya, 3 Kittur, and 64 Sainik School Selections",
    description: "New Oxford Coaching Classes records its best results yet with 94% qualification in Sainik School entrance and multiple selections.",
    content: "The 2026-27 entrance results: 6 selections for Navodaya, 3 for Kittur Rani Chennamma, and 64 out of 68 students qualified for Sainik School.",
    image_path: "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg",
    category: "Achievements", is_featured: true, is_active: true,
    published_at: "2026-05-02T00:00:00.000Z", created_at: "2026-05-02T00:00:00.000Z", created_by: "seed",
  },
];

async function seedNews() {
  console.log("📰 Force-seeding news...");
  let count = 0;
  for (const item of NEWS) {
    await addDoc(collection(db, "news"), item);
    count++;
    console.log(`   ✅ ${count}/${NEWS.length} — ${item.title.substring(0, 50)}...`);
  }
  console.log(`\n🎉 Done! Added ${count} news items.\n`);
  process.exit(0);
}

seedNews();
