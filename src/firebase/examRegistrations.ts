import { db } from "./firebase";
import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { compressImage } from "@/utils/imageUtils";

export interface ExamRegistration {
  id: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  mobile_number: string;
  school_name: string;
  sts_number: string;
  current_class: string;
  exam_medium: string;
  caste_category: string;
  village_address: string;
  district_taluk: string;
  photo_url: string;
  hall_ticket_number: string;
  payment_verified: boolean;
  created_at: string;
}

export interface ExamRegistrationInput {
  full_name: string;
  gender: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  mobile_number: string;
  school_name: string;
  sts_number: string;
  current_class: string;
  exam_medium: string;
  caste_category: string;
  village_address: string;
  district_taluk: string;
}

const COLLECTION = "exam_registrations";

function generateHallTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `OXF${year}${random}`;
}

// Convert photo to base64 data URL (no Firebase Storage needed)
export async function photoToDataUrl(file: File): Promise<string> {
  const compressed = await compressImage(file, 512, 0.8);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
}

export async function submitExamRegistration(
  data: ExamRegistrationInput,
  photoUrl: string
): Promise<{ data: ExamRegistration | null; error: string | null }> {
  if (!db) return { data: null, error: "Database not configured" };
  try {
    const hallTicket = generateHallTicketNumber();
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data, photo_url: photoUrl, hall_ticket_number: hallTicket,
      payment_verified: false, created_at: new Date().toISOString(),
    });
    return {
      data: {
        id: docRef.id, ...data, photo_url: photoUrl,
        hall_ticket_number: hallTicket, payment_verified: false,
        created_at: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Submit failed" };
  }
}

export async function getAllExamRegistrations(): Promise<{ data: ExamRegistration[]; error: string | null }> {
  if (!db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return {
      data: snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          full_name: (data.full_name as string) || "",
          gender: (data.gender as string) || "",
          date_of_birth: (data.date_of_birth as string) || "",
          father_name: (data.father_name as string) || "",
          mother_name: (data.mother_name as string) || "",
          mobile_number: (data.mobile_number as string) || "",
          school_name: (data.school_name as string) || "",
          sts_number: (data.sts_number as string) || "",
          current_class: (data.current_class as string) || "",
          exam_medium: (data.exam_medium as string) || "",
          caste_category: (data.caste_category as string) || "",
          village_address: (data.village_address as string) || "",
          district_taluk: (data.district_taluk as string) || "",
          photo_url: (data.photo_url as string) || "",
          hall_ticket_number: (data.hall_ticket_number as string) || "",
          payment_verified: (data.payment_verified as boolean) || false,
          created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || "",
        } as ExamRegistration;
      }),
      error: null,
    };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Fetch failed" };
  }
}

export async function togglePaymentVerification(id: string, verified: boolean): Promise<{ error: string | null }> {
  if (!db) return { error: "Database not configured" };
  try {
    await updateDoc(doc(db, COLLECTION, id), { payment_verified: verified });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }
}
