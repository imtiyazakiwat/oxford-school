"use client";

/**
 * One-time seed script to push all mock data into Firestore.
 * Access at /admin/seed (or import and call seedAllData).
 * After running, all data lives in Firebase — no more local fallbacks.
 */

import { db, isConfigured } from "@/firebase/firebase";
import { collection, getDocs, addDoc, doc, setDoc, query, limit } from "firebase/firestore";
import {
  MOCK_NEWS, MOCK_NEWS_IMAGES, MOCK_NEWS_IMAGE,
  MOCK_ACHIEVERS, MOCK_ACHIEVER_IMAGES,
  MOCK_GALLERY, MOCK_GALLERY_IMAGES,
  MOCK_MARQUEE_MESSAGES,
  MOCK_ADMISSION_BANNER,
} from "@/data/mockData";

async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  if (!db) return true;
  const q = query(collection(db, collectionName), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function seedAllData(): Promise<{ results: string[]; errors: string[] }> {
  const results: string[] = [];
  const errors: string[] = [];

  if (!isConfigured || !db) {
    errors.push("Firebase not configured");
    return { results, errors };
  }

  // Seed News
  try {
    if (await isCollectionEmpty("news")) {
      for (const item of MOCK_NEWS) {
        const imagePath = item.image_path || MOCK_NEWS_IMAGES[item.id] || MOCK_NEWS_IMAGE;
        await addDoc(collection(db, "news"), {
          title: item.title,
          description: item.description,
          content: item.content,
          image_path: imagePath,
          category: item.category,
          is_featured: item.is_featured,
          is_active: item.is_active,
          published_at: item.published_at,
          created_at: item.created_at,
          created_by: "seed",
        });
      }
      results.push(`Seeded ${MOCK_NEWS.length} news items`);
    } else {
      results.push("News collection already has data — skipped");
    }
  } catch (e) { errors.push(`News: ${e instanceof Error ? e.message : "failed"}`); }

  // Seed Achievers
  try {
    if (await isCollectionEmpty("achievers")) {
      for (const item of MOCK_ACHIEVERS) {
        const imagePath = item.image_path || MOCK_ACHIEVER_IMAGES[item.id] || "";
        await addDoc(collection(db, "achievers"), {
          name: item.name,
          stream: item.stream,
          year: item.year,
          percentage: item.percentage,
          rank: item.rank,
          image_path: imagePath,
          is_featured: item.is_featured,
          display_order: item.display_order,
          created_at: item.created_at,
          created_by: "seed",
        });
      }
      results.push(`Seeded ${MOCK_ACHIEVERS.length} achievers`);
    } else {
      results.push("Achievers collection already has data — skipped");
    }
  } catch (e) { errors.push(`Achievers: ${e instanceof Error ? e.message : "failed"}`); }

  // Seed Gallery
  try {
    if (await isCollectionEmpty("gallery")) {
      for (const item of MOCK_GALLERY) {
        const imagePath = item.image_path || MOCK_GALLERY_IMAGES[item.id] || "";
        await addDoc(collection(db, "gallery"), {
          title: item.title,
          category: item.category,
          image_path: imagePath,
          is_featured: item.is_featured,
          display_order: item.display_order,
          created_at: item.created_at,
          created_by: "seed",
        });
      }
      results.push(`Seeded ${MOCK_GALLERY.length} gallery images`);
    } else {
      results.push("Gallery collection already has data — skipped");
    }
  } catch (e) { errors.push(`Gallery: ${e instanceof Error ? e.message : "failed"}`); }

  // Seed Marquee Messages
  try {
    if (await isCollectionEmpty("marquee_messages")) {
      for (const item of MOCK_MARQUEE_MESSAGES) {
        await addDoc(collection(db, "marquee_messages"), {
          text: item.text,
          icon: item.icon,
          highlight: item.highlight,
          is_active: item.is_active,
          display_order: item.display_order,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: "seed",
        });
      }
      results.push(`Seeded ${MOCK_MARQUEE_MESSAGES.length} marquee messages`);
    } else {
      results.push("Marquee collection already has data — skipped");
    }
  } catch (e) { errors.push(`Marquee: ${e instanceof Error ? e.message : "failed"}`); }

  // Seed Admission Banner
  try {
    if (await isCollectionEmpty("admission_banner")) {
      await setDoc(doc(collection(db, "admission_banner")), {
        text: MOCK_ADMISSION_BANNER.text,
        emoji: MOCK_ADMISSION_BANNER.emoji,
        is_active: MOCK_ADMISSION_BANNER.is_active,
        updated_at: MOCK_ADMISSION_BANNER.updated_at,
        updated_by: "seed",
      });
      results.push("Seeded admission banner");
    } else {
      results.push("Admission banner already has data — skipped");
    }
  } catch (e) { errors.push(`Banner: ${e instanceof Error ? e.message : "failed"}`); }

  return { results, errors };
}
