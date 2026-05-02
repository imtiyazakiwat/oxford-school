// Real data for New Oxford Coaching Classes
// Uses local images from public/img/ directory
// Falls back to this data when Firebase has no entries

// ========== TYPE DEFINITIONS (self-contained, no external deps) ==========
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_path: string | null;
  category: "Events" | "Academic" | "Admissions" | "Sports" | "Achievements";
  is_featured: boolean;
  is_active: boolean;
  published_at: string;
  created_at: string;
  created_by: string | null;
}

export interface NewsInput {
  title: string;
  description: string;
  content?: string;
  category: "Events" | "Academic" | "Admissions" | "Sports" | "Achievements";
  is_featured?: boolean;
}

export interface Achiever {
  id: string;
  name: string;
  stream: string;
  year: number;
  percentage: string;
  rank: string | null;
  image_path: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  created_by: string | null;
}

export interface AchieverInput {
  name: string;
  stream: string;
  year: number;
  percentage: string;
  rank?: string;
  is_featured?: boolean;
  display_order?: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: "Achievements" | "Events" | "Admissions" | "Press Coverage";
  image_path: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  created_by: string | null;
}

export interface GalleryImageInput {
  title: string;
  category: "Achievements" | "Events" | "Admissions" | "Press Coverage";
  is_featured?: boolean;
  display_order?: number;
}

export interface MarqueeMessage {
  id: string;
  text: string;
  icon: string;
  highlight: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface AdmissionBanner {
  id: string;
  text: string;
  emoji: string;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
}

export interface ContactFormInput {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ApplicationData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  religion?: string;
  nationality?: string;
  aadhar_number?: string;
  photo_url?: string;
  father_name: string;
  father_occupation?: string;
  father_phone?: string;
  mother_name: string;
  mother_occupation?: string;
  mother_phone?: string;
  emergency_contact: string;
  applying_for_class: string;
  academic_year: string;
  previous_school?: string;
  previous_class?: string;
  previous_percentage?: string;
  email: string;
  phone: string;
  current_address: string;
  reason_to_join?: string;
  medical_conditions?: string;
}

export interface Application extends ApplicationData {
  id: string;
  application_number: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentData {
  user_id?: string;
  application_id?: string;
  student_id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  religion?: string;
  nationality?: string;
  aadhar_number?: string;
  photo_url?: string;
  father_name?: string;
  father_occupation?: string;
  father_phone?: string;
  mother_name?: string;
  mother_occupation?: string;
  mother_phone?: string;
  emergency_contact?: string;
  class: string;
  section?: string;
  roll_number?: string;
  academic_year?: string;
  admission_date?: string;
  previous_school?: string;
  email: string;
  phone?: string;
  current_address?: string;
  permanent_address?: string;
  medical_conditions?: string;
  total_fees?: string;
  paid_fees?: string;
  due_fees?: string;
  fee_status?: string;
  status?: string;
}

export interface Student extends StudentData {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface OTPVerification {
  id: string;
  email: string;
  otp_code: string;
  expires_at: string;
  verified: boolean;
  attempts: number;
  created_at: string;
}

export interface AboutImage {
  id: string;
  position: number;
  image_path: string;
  alt_text: string;
  created_at: string;
  updated_at: string;
}

// ========== NEWS — Based on actual newspaper coverage ==========
export const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-navodaya-results-2026",
    title: "6 Students Selected for Navodaya — 6th Rank in Belagavi District!",
    description: "In the first round of 2027 Navodaya entrance results, 6 students from New Oxford Coaching Classes have been selected: Basavaraj Valasang, Amara Bhabhanagar, Nagesh Savalagi, Bhagyashri Sindagi, Vishala Mujagoni & Vikas Shinge.",
    content: "New Oxford Coaching Classes students achieve remarkable results in 2026-27 entrance exams. In the Navodaya entrance, 6 students were selected in the first round itself — Basavaraj Valasang (Kannal), Nagesh Savalagi (Hunnur), Amara Bhabhanagar (Honawad), Vishala Mujagoni (Partanahalli), Bhagyashri Sindagi (Telsang) & Vikas Shinge (Tubachi). This is the best result in the region, securing 6th rank in Belagavi district. Covered in Hasiru Kranti and Kannada Prabha newspapers.",
    image_path: null,
    category: "Achievements",
    is_featured: true,
    is_active: true,
    published_at: "2026-03-21T00:00:00.000Z",
    created_at: "2026-03-21T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-sainik-results-2026",
    title: "64 out of 68 Qualify in Sainik School Entrance Exam",
    description: "In the All India Sainik School entrance exam held on 18 January 2026, 68 students appeared from our institution. 64 students qualified with 94 remarkable results — an exceptional success rate of over 94%.",
    content: "Outstanding performance in the Sainik School entrance examination. 68 students from New Oxford Coaching Classes appeared, and 64 qualified — a remarkable 94% success rate. Top scorers include Basavaraj Valasang (258), Nitheesh Benakatti (255), Amara Bhabhanagar (251), Om Sai Lad (251), Nagesh Savalagi (243), Sireesh Kakhandaki (242), Bhagyashri Sindagi (241), and many more. This coverage appeared in multiple Kannada newspapers.",
    image_path: null,
    category: "Achievements",
    is_featured: true,
    is_active: true,
    published_at: "2026-03-20T00:00:00.000Z",
    created_at: "2026-03-20T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-kittur-results-2026",
    title: "3 Students Selected for Kittur Rani Channamma Vasati Shale",
    description: "Poorvi Benade, Anushri Billur & Pratiksha Savant have been selected for Kittur Rani Channamma Vasati Shale in the 2026-27 entrance exams.",
    content: "In the Kittur Rani Channamma Vasati Shale entrance exam for 2026-27, three of our students — Poorvi Benade (Jamkhandi), Anushri Billur (Tubachi) and Pratiksha Savant — secured admission. This continues the tradition of excellent results at New Oxford Coaching Classes.",
    image_path: null,
    category: "Achievements",
    is_featured: true,
    is_active: true,
    published_at: "2026-03-19T00:00:00.000Z",
    created_at: "2026-03-19T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-felicitation-ceremony",
    title: "Felicitation Ceremony for Navodaya Selected Students",
    description: "A grand felicitation ceremony was organized to honour students selected for Navodaya. The event was covered by Udayavani newspaper. Village leaders and parents expressed gratitude for the institution's dedication.",
    content: "Selected students for Navodaya were felicitated at a ceremony attended by village leaders, parents, and well-wishers. Speakers praised the institution's commitment to service, culture and education. The event was covered in Udayavani newspaper under the heading 'Success through Service and Culture'. Sanskriti Seva Foundation's role in supporting the coaching classes was highlighted.",
    image_path: null,
    category: "Events",
    is_featured: false,
    is_active: true,
    published_at: "2026-03-22T00:00:00.000Z",
    created_at: "2026-03-22T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-sharana-sanskriti-utsav",
    title: "Sharana Sanskriti Utsav 2026 — Cultural Event Coverage",
    description: "Udayavani covered the Sharana Sanskriti Utsav 2026, a cultural event organized at Telsang village highlighting the values of education and culture.",
    content: "The Sharana Sanskriti Utsav 2026 was inaugurated at Sri Siddarameshwar Mutt in Telsang. Veereshwara Devaru spoke about the importance of culture and family values. The event runs from April 2 to later dates with evening programs. The coaching institution's role in community development was recognised.",
    image_path: null,
    category: "Events",
    is_featured: false,
    is_active: true,
    published_at: "2026-04-02T00:00:00.000Z",
    created_at: "2026-04-02T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-admissions-2026-27",
    title: "Admissions Open for 2026-27 — Limited Seats!",
    description: "Coaching for Navodaya, Sainik School, Adarsha Vidyalaya, Kittur, Murarji & R.M.S. entrance exams. Classes for 4th and 5th standard students in English & Kannada medium. Summer batch from April, regular from June.",
    content: "New Oxford Coaching Classes is accepting admissions for 2026-27. Summer batch starts April 5, regular classes from June 7. Available for 4th and 5th class students. English and Kannada medium. Hostel (vasati) and day-scholar (vasati rahita) options available at both Jamkhandi and Athani branches. Contact: 9590483488, 9740412339.",
    image_path: null,
    category: "Admissions",
    is_featured: false,
    is_active: true,
    published_at: "2026-03-25T00:00:00.000Z",
    created_at: "2026-03-25T00:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-smartwatch-savadi-2026",
    title: "MLA Laxman Savadi Honors Achievers with Smartwatches",
    description: "Athani MLA Laxman Savadi distributed smartwatches to students selected for Navodaya, praising the institution's commitment to quality education in rural areas.",
    content: "ಅಥಣಿ: ಗ್ರಾಮೀಣ ಭಾಗದ ವಿದ್ಯಾರ್ಥಿಗಳು ಇಂದು ಸ್ಪರ್ಧಾತ್ಮಕ ಯುಗದಲ್ಲಿ ರಾಷ್ಟ್ರ ಮಟ್ಟದ ಶಾಲೆಗಳಿಗೆ ಆಯ್ಕೆಯಾಗುತ್ತಿರುವುದು ಹೆಮ್ಮೆಯ ವಿಷಯ ಎಂದು ಅಥಣಿ ಶಾಸಕ ಲಕ್ಷö್ಮಣ ಸವದಿ ಹೇಳಿದರು. ತಾಲೂಕಿನ ತೆಲಸಂಗ ಗ್ರಾಮದ ಸಂಸ್ಕೃತಿ ಸೇವಾ ಫೌಂಡೇಶನ್ನ ಇದರ ನ್ಯೂ ಆಕ್ಸ್ಫರ್ಡ್ ಕೋಚಿಂಗ್ ಕ್ಲಾಸ್ನಲ್ಲಿ ತರಬೇತಿ ಪಡೆದ ಆರು ವಿದ್ಯಾರ್ಥಿಗಳು ಜವಾಹರ ನವೋದಯ ವಿದ್ಯಾಲಯಕ್ಕೆ ಆಯ್ಕೆಯಾದ ಈ ಸಾಧಕ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ಮಾರ್ಟ್ ವಾಚ್ ನೀಡಿ ಗೌರವಿಸಿ, ಶುಭ ಹಾರೈಸಿ ಅವರು ಮಾತನಾಡಿದರು.",
    image_path: null,
    category: "Events",
    is_featured: true,
    is_active: true,
    published_at: "2026-05-02T13:00:00.000Z",
    created_at: "2026-05-02T13:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-navodaya-felicitation-hiremath",
    title: "Felicitation Ceremony at Telsang Hiremath for Navodaya Achievers",
    description: "A grand felicitation ceremony was held at Telsang Hiremath to celebrate the success of students selected for various residential schools. Sri Veereshwara Devaru highlighted the importance of dedication.",
    content: "ತೆಲಸಂಗ: ಶಿಕ್ಷಕರ ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ಮಕ್ಕಳ ಪ್ರತಿಭೆ ಎರಡರಲ್ಲಿ ಒಂದು ಕೊರತೆಯಾದರೂ ಉತ್ತಮ ಫಲಿತಾಂಶ ನಿರೀಕ್ಷಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ ಸೇವೆ ಮತ್ತು ಸಂಸ್ಕಾರ ಎಲ್ಲಿರುತ್ತದೆಯೋ ಅಲ್ಲಿ ಯಶಸ್ಸು ಕಟ್ಟಿಟ್ಟ ಬುತ್ತಿ ಎಂದು ಹಿರೇಮಠದ ವೀರೇಶ್ವರದೇವರು ಹೇಳಿದರು. ಗ್ರಾಮದ ಹಿರೇಮಠದಲ್ಲಿ ಶ್ರೀಮಠದಿಂದ ಹಾಗೂ ಸೇವಾ ಸಂಸ್ಕೃತಿ ಪೌಂಡೇಶನ್ ವತಿಯಿಂದ ಹಮ್ಮಿಕೊಂಡ ನ್ಯೂ ಆಕ್ಸ್ಫರ್ಡ್‌ನಿಂದ ತರಬೇತಿ ಪಡೆದು ನವೋದಯ ಶಾಲೆಗೆ ಆಯ್ಕೆಯಾದ ವಿದ್ಯಾರ್ಥಿಗಳ ಸನ್ಮಾನ ಸಮಾರಂಭದಲ್ಲಿ ಅವರು ಮಾತನಾಡಿದರು.",
    image_path: null,
    category: "Achievements",
    is_featured: true,
    is_active: true,
    published_at: "2026-05-01T10:00:00.000Z",
    created_at: "2026-05-01T10:00:00.000Z",
    created_by: null,
  },
  {
    id: "news-sainik-results-detailed-2026",
    title: "94% Success Rate in Sainik School Entrance Exam — Detailed Results",
    description: "64 out of 68 students qualified in the All India Sainik School entrance exam. Top scorers include Basavaraj Valasang (258), Nitish Benakatti (255), and more.",
    content: "ಇತ್ತೀಚೆಗೆ ನಡೆದ ಅಖಿಲ ಭಾರತ ಸೈನಿಕ ಶಾಲಾ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಸಂಸ್ಥೆಯ ಒಟ್ಟು ೬೮ ವಿದ್ಯಾರ್ಥಿಗಳು ಪಾಲ್ಗೊಂಡಿದ್ದು, ಅದರಲ್ಲಿ ೬೪ ವಿದ್ಯಾರ್ಥಿಗಳು ಅರ್ಹತೆ ಪಡೆಯುವ ಮೂಲಕ ಶೇ. ೯೪ ರಷ್ಟು ಫಲಿತಾಂಶ ದಾಖಲಿಸಿದ್ದಾರೆ. ಗಮನಾರ್ಹ ಅಂಕ ಪಡೆದವರು: ಬಸವರಾಜ ವಳಸಂಗ(೨೫೮), ನಿತೀಶ ಬೆನಕಟ್ಟಿ(೨೫೫), ಅಮರ ಬಾಬಾನಗರ(೨೫೧), ಓಂ ಸಾಯಿ ಲಾಡ್(೨೫೧), ನಾಗೇಶ ಸಾವಳಗಿ(೨೪೩), ಸಿರೀಶ ಕಾಖಂಡಕಿ(೨೪೨), ಭಾಗ್ಯಶ್ರೀ ಸಿಂದಗಿ(೨೪೧), ಅನುಶ್ರೀ ಬಿಳ್ಳೂರು(೨೩೦) ಬಾಲಕೃಷ್ಣ ಸುತಾರ(೨೩೦), ಸಂಗಮೇಶ ವಾಂಗಿ(೨೨೬), ಸಮೃದ್ಧ ಗಣಿ(೨೧೬), ವಿಶಾಲ ಮುಜಗೋಣಿ(೨೧೦), ನವೀನ ಮಾಣಿಕಶೆಟ್ಟಿ(೨೦೬), ಪ್ರತಿಕ್ಷಾ ಸಾವಂತ(೨೦೪), ಅಮೃತಾ ಮುಜಗಣ್ಣವರ(೨೦೨).",
    image_path: null,
    category: "Achievements",
    is_featured: false,
    is_active: true,
    published_at: "2026-04-30T09:00:00.000Z",
    created_at: "2026-04-30T09:00:00.000Z",
    created_by: null,
  },
];

// Mock image for news — maps to local images matching actual content
export const MOCK_NEWS_IMAGES: Record<string, string> = {
  "news-navodaya-results-2026": "/img/congactulations/congracts2.jpeg",       // Navodaya + Kittur selections poster
  "news-sainik-results-2026": "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg", // Sainik 68→64 results poster
  "news-kittur-results-2026": "/img/congactulations/congracts5.jpeg",         // Felicitation with Kittur selections
  "news-felicitation-ceremony": "/img/newspaper/news1.jpeg",                  // Udayavani felicitation coverage
  "news-sharana-sanskriti-utsav": "/img/newspaper/news7.jpeg",                // Udayavani cultural event coverage
  "news-admissions-2026-27": "/img/admissions/admission3.jpeg",               // 2026-27 admissions poster
  "news-smartwatch-savadi-2026": "/img/congactulations/congracts6.jpeg",
  "news-navodaya-felicitation-hiremath": "/img/congactulations/congracts5.jpeg",
  "news-sainik-results-detailed-2026": "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg",
};

// Default fallback news image
export const MOCK_NEWS_IMAGE = "/img/newspaper/news4.jpeg";

// ========== ACHIEVERS — Real selected students ==========
export const MOCK_ACHIEVERS: Achiever[] = [
  {
    id: "ach-basavaraj",
    name: "Basavaraj Valasang",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "258 marks",
    rank: "Navodaya Selected — 1st in Institution",
    image_path: "",
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-nitheesh",
    name: "Nitheesh Benakatti",
    stream: "Sainik School",
    year: 2026,
    percentage: "255 marks",
    rank: "Sainik School Qualified",
    image_path: "",
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-amara",
    name: "Amara Bhabhanagar",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "251 marks",
    rank: "Navodaya Selected",
    image_path: "",
    is_featured: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-nagesh",
    name: "Nagesh Savalagi",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "243 marks",
    rank: "Navodaya Selected",
    image_path: "",
    is_featured: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-bhagyashri",
    name: "Bhagyashri Sindagi",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "241 marks",
    rank: "Navodaya Selected",
    image_path: "",
    is_featured: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-vishala",
    name: "Vishala Mujagoni",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "210 marks",
    rank: "Navodaya Selected",
    image_path: "",
    is_featured: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-vikas",
    name: "Vikas Shinge",
    stream: "Navodaya & Sainik",
    year: 2026,
    percentage: "Selected",
    rank: "Navodaya Selected",
    image_path: "",
    is_featured: true,
    display_order: 7,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-poorvi",
    name: "Poorvi Benade",
    stream: "Kittur Vasati Shale",
    year: 2026,
    percentage: "Selected",
    rank: "Kittur Selected",
    image_path: "",
    is_featured: true,
    display_order: 8,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-anushri",
    name: "Anushri Billur",
    stream: "Kittur Vasati Shale",
    year: 2026,
    percentage: "230 marks",
    rank: "Kittur Selected",
    image_path: "",
    is_featured: false,
    display_order: 9,
    created_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "ach-pratiksha",
    name: "Pratiksha Savant",
    stream: "Kittur Vasati Shale",
    year: 2026,
    percentage: "204 marks",
    rank: "Kittur Selected",
    image_path: "",
    is_featured: false,
    display_order: 10,
    created_at: new Date().toISOString(),
    created_by: null,
  },
];

// Mock achiever images — mapped to congratulations folder (student achievement posters)
export const MOCK_ACHIEVER_IMAGES: Record<string, string> = {
  "ach-basavaraj": "/img/congactulations/congracts2.jpeg",    // Navodaya + Kittur poster with student photos
  "ach-nitheesh": "/img/congactulations/congracts3.jpeg",     // All results compilation poster
  "ach-amara": "/img/congactulations/congracts4.jpeg",        // All results with detailed student list
  "ach-nagesh": "/img/congactulations/congracts5.jpeg",       // Felicitation with DCM poster
  "ach-bhagyashri": "/img/congactulations/congracts6.jpeg",   // Felicitation event + smart watch distribution
  "ach-vishala": "/img/congactulations/congracts7.jpeg",      // Navodaya + Kittur results (blue)
  "ach-vikas": "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg", // Sainik results poster
  "ach-poorvi": "/img/congactulations/congracts2.jpeg",       // Navodaya + Kittur poster
  "ach-anushri": "/img/congactulations/congracts3.jpeg",
  "ach-pratiksha": "/img/congactulations/congracts4.jpeg",
};

// ========== GALLERY — Organized by actual image folders ==========
export const MOCK_GALLERY: GalleryImage[] = [
  // Events — felicitation ceremonies & events (congactulations/ + newspaper/)
  { id: "gal-event-1", title: "Student Felicitation with DCM", category: "Events", image_path: "", is_featured: true, display_order: 1, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-2", title: "Smart Watch Distribution Ceremony", category: "Events", image_path: "", is_featured: true, display_order: 2, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-3", title: "Felicitation Coverage — Udayavani", category: "Events", image_path: "", is_featured: true, display_order: 3, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-4", title: "Felicitation Poster — Udayavani", category: "Events", image_path: "", is_featured: true, display_order: 4, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-5", title: "Sharana Sanskriti Utsav Coverage", category: "Events", image_path: "", is_featured: true, display_order: 5, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-6", title: "Sainik School Results Poster", category: "Events", image_path: "", is_featured: true, display_order: 6, created_at: new Date().toISOString(), created_by: null },
  // Achievements — student results (congactulations/)
  { id: "gal-achieve-1", title: "Navodaya + Kittur Selections 2026-27", category: "Achievements", image_path: "", is_featured: false, display_order: 7, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-achieve-2", title: "All Results Compilation", category: "Achievements", image_path: "", is_featured: false, display_order: 8, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-achieve-3", title: "Detailed Student Results", category: "Achievements", image_path: "", is_featured: false, display_order: 9, created_at: new Date().toISOString(), created_by: null },
  // Admissions — admission posters (admissions/)
  { id: "gal-campus-1", title: "Full Results + Admissions Poster", category: "Admissions", image_path: "", is_featured: false, display_order: 10, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-campus-2", title: "2026-27 Admissions Poster", category: "Admissions", image_path: "", is_featured: false, display_order: 11, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-campus-3", title: "Admission Open Banner", category: "Admissions", image_path: "", is_featured: false, display_order: 12, created_at: new Date().toISOString(), created_by: null },
  // Press Coverage — newspaper clippings (newspaper/)
  { id: "gal-press-1", title: "Hasiru Kranti Coverage", category: "Press Coverage", image_path: "", is_featured: false, display_order: 13, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-press-2", title: "Kannada Prabha Coverage", category: "Press Coverage", image_path: "", is_featured: false, display_order: 14, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-press-3", title: "Newspaper Results Article", category: "Press Coverage", image_path: "", is_featured: false, display_order: 15, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-event-7", title: "MLA Laxman Savadi Smartwatch Distribution", category: "Events", image_path: "", is_featured: true, display_order: 16, created_at: new Date().toISOString(), created_by: null },
  { id: "gal-achieve-4", title: "Sainik School Entrance Exam - 94% Result", category: "Achievements", image_path: "", is_featured: true, display_order: 17, created_at: new Date().toISOString(), created_by: null },
];

// Mock gallery images — properly categorized by folder
export const MOCK_GALLERY_IMAGES: Record<string, string> = {
  // Events — felicitation & ceremony photos from congactulations/
  "gal-event-1": "/img/congactulations/congracts5.jpeg",     // Felicitation with DCM
  "gal-event-2": "/img/congactulations/congracts6.jpeg",     // Felicitation + smart watch distribution
  "gal-event-3": "/img/newspaper/news1.jpeg",                // Udayavani felicitation coverage
  "gal-event-4": "/img/newspaper/news5.jpeg",                // Udayavani felicitation poster
  "gal-event-5": "/img/newspaper/news7.jpeg",                // Udayavani cultural event
  "gal-event-6": "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg", // Sainik results poster
  // Achievements — student results from congactulations/
  "gal-achieve-1": "/img/congactulations/congracts2.jpeg",    // Navodaya + Kittur selections
  "gal-achieve-2": "/img/congactulations/congracts3.jpeg",    // All results compilation
  "gal-achieve-3": "/img/congactulations/congracts4.jpeg",    // Detailed results poster
  // Campus — admission/campus images from admissions/
  "gal-campus-1": "/img/admissions/admission1.jpeg",          // Full results + admissions poster
  "gal-campus-2": "/img/admissions/admission3.jpeg",          // 2026-27 admissions poster
  "gal-campus-3": "/img/admissions/admission4.jpeg",          // Admissions open (English)
  // Press — newspaper clippings from newspaper/
  "gal-press-1": "/img/newspaper/news4.jpeg",                 // Hasiru Kranti coverage
  "gal-press-2": "/img/newspaper/news8.jpeg",                 // Kannada Prabha coverage
  "gal-press-3": "/img/newspaper/news2.jpeg",                 // Newspaper results article
  "gal-event-7": "/img/congactulations/congracts6.jpeg",
  "gal-achieve-4": "/img/congactulations/WhatsApp Image 2026-04-22 at 17.09.37.jpeg",
};

// ========== MARQUEE ==========
export const MOCK_MARQUEE_MESSAGES: MarqueeMessage[] = [
  {
    id: "msg-1",
    text: "Admissions Open for 2026-27 — Navodaya, Sainik School & Adarsha Vidyalaya Coaching!",
    icon: "megaphone",
    highlight: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "msg-2",
    text: "64 out of 68 selections — 6th Rank in Belagavi District!",
    icon: "trophy",
    highlight: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "msg-3",
    text: "6 students selected for Navodaya in first round — Basavaraj, Amara, Nagesh, Bhagyashri, Vishala & Vikas!",
    icon: "trophy",
    highlight: false,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "msg-4",
    text: "Historic Achievement: 64 out of 68 students qualified in All India Sainik School Entrance Exam (94% result)!",
    icon: "award",
    highlight: true,
    is_active: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  },
  {
    id: "msg-5",
    text: "MLA Laxman Savadi distributed smartwatches to our Navodaya & Kittur achievers — Congratulations to all!",
    icon: "gift",
    highlight: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  },
];

// ========== ADMISSION BANNER ==========
export const MOCK_ADMISSION_BANNER: AdmissionBanner = {
  id: "banner-1",
  text: "Admissions Open for 2026-27 — Navodaya, Sainik School & Adarsha Vidyalaya Coaching — Limited Seats!",
  emoji: "🎓",
  is_active: true,
  updated_at: new Date().toISOString(),
  updated_by: null,
};
