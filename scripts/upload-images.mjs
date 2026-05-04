// Upload local images to Firebase Storage & update Firestore docs
// Run: node scripts/upload-images.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

const PUBLIC_DIR = path.resolve("public");
const MAX_BYTES = 500 * 1024; // 500KB

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpeg", ".jpg", ".png", ".webp"].includes(ext)) return null;

  let quality = 80;
  let buf = await sharp(filePath).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality }).toBuffer();

  // Reduce quality until under 500KB
  while (buf.length > MAX_BYTES && quality > 20) {
    quality -= 10;
    buf = await sharp(filePath).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality }).toBuffer();
  }

  // If still too big, resize smaller
  if (buf.length > MAX_BYTES) {
    buf = await sharp(filePath).resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 60 }).toBuffer();
  }

  console.log(`     Compressed: ${(buf.length / 1024).toFixed(0)}KB (q=${quality})`);
  return buf;
}

async function uploadBuffer(buf, storagePath) {
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, buf, { contentType: "image/webp" });
  return storagePath;
}

async function processCollection(collectionName, imageField = "image_path") {
  console.log(`\n📁 Processing "${collectionName}"...`);
  const snap = await getDocs(collection(db, collectionName));
  let uploaded = 0, skipped = 0, failed = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const imagePath = data[imageField];

    // Skip if no image, already a Firebase path, or not a local path
    if (!imagePath || !imagePath.startsWith("/")) {
      skipped++;
      continue;
    }

    const localFile = path.join(PUBLIC_DIR, imagePath);
    if (!fs.existsSync(localFile)) {
      console.log(`   ⚠️  File not found: ${imagePath}`);
      failed++;
      continue;
    }

    try {
      const title = data.title || data.name || docSnap.id;
      console.log(`   📤 ${title.substring(0, 50)}`);
      console.log(`     Local: ${imagePath}`);

      const buf = await compressImage(localFile);
      if (!buf) { skipped++; continue; }

      const storagePath = `${collectionName}/${docSnap.id}_${Date.now()}.webp`;
      await uploadBuffer(buf, storagePath);

      // Update Firestore doc with new storage path
      await updateDoc(doc(db, collectionName, docSnap.id), { [imageField]: storagePath });
      console.log(`     ✅ Uploaded → ${storagePath}`);
      uploaded++;
    } catch (e) {
      console.error(`     ❌ Failed: ${e.message}`);
      failed++;
    }
  }

  console.log(`   Done: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed`);
}

async function main() {
  console.log("🚀 Uploading local images to Firebase Storage (500KB max)...\n");

  await processCollection("news");
  await processCollection("achievers");
  await processCollection("gallery");
  await processCollection("announcements");
  await processCollection("about_images");

  console.log("\n🎉 All done!\n");
  process.exit(0);
}

main();
