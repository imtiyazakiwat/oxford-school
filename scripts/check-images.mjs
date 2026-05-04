// Check what image_path values are in Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC0xcKxHBNDP9kWhMfFaNqd2B-aaZZieOA",
  authDomain: "oxford-school-b9c15.firebaseapp.com",
  projectId: "oxford-school-b9c15",
  storageBucket: "oxford-school-b9c15.firebasestorage.app",
  messagingSenderId: "800618786995",
  appId: "1:800618786995:web:8746fbbe469d2f5e6440c6",
});
const db = getFirestore(app);

for (const col of ["news", "achievers", "gallery"]) {
  console.log(`\n=== ${col} ===`);
  const snap = await getDocs(collection(db, col));
  snap.docs.forEach(d => {
    const data = d.data();
    const img = data.image_path || "(none)";
    const isLocal = img.startsWith("/");
    console.log(`  ${isLocal ? "❌ LOCAL" : "✅ FB"} | ${img.substring(0, 60)} | ${(data.title || data.name || "").substring(0, 40)}`);
  });
}
process.exit(0);
