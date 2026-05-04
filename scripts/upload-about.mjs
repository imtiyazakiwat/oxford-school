// Upload about images to Firebase Storage & seed about_images collection
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const app = initializeApp({
  apiKey: "AIzaSyC0xcKxHBNDP9kWhMfFaNqd2B-aaZZieOA",
  authDomain: "oxford-school-b9c15.firebaseapp.com",
  projectId: "oxford-school-b9c15",
  storageBucket: "oxford-school-b9c15.firebasestorage.app",
  messagingSenderId: "800618786995",
  appId: "1:800618786995:web:8746fbbe469d2f5e6440c6",
});
const db = getFirestore(app);
const storage = getStorage(app);

const ABOUT_IMAGES = [
  { position: 1, file: "public/img/congactulations/congracts5.jpeg", alt: "Student Felicitation" },
  { position: 2, file: "public/img/congactulations/congracts6.jpeg", alt: "Achievement Ceremony" },
  { position: 3, file: "public/img/admissions/admission4.jpeg", alt: "Campus & Students" },
  { position: 4, file: "public/img/congactulations/congracts7.jpeg", alt: "Results Celebration" },
];

async function main() {
  const now = new Date().toISOString();
  for (const img of ABOUT_IMAGES) {
    const filePath = path.resolve(img.file);
    console.log(`📤 Position ${img.position}: ${img.alt}`);
    const buf = await sharp(filePath).resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    console.log(`   Compressed: ${(buf.length / 1024).toFixed(0)}KB`);
    const storagePath = `about/position_${img.position}_${Date.now()}.webp`;
    await uploadBytes(ref(storage, storagePath), buf, { contentType: "image/webp" });
    await setDoc(doc(db, "about_images", `position_${img.position}`), {
      position: img.position, image_path: storagePath, alt_text: img.alt, created_at: now, updated_at: now,
    });
    console.log(`   ✅ ${storagePath}`);
  }
  console.log("\n🎉 Done!");
  process.exit(0);
}
main();
