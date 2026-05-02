import { Student } from "@/firebase/students";

export interface StudentData {
    name: string;
    email: string;
    studentId: string;
    class: string;
    section: string;
    rollNo: string;
}

// Extended student data from database
export type StudentRecord = Student | null;
