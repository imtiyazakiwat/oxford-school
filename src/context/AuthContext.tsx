"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  getIdTokenResult
} from "firebase/auth";
import { auth } from "@/firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: string | null; needsVerification: boolean }>;
  fetchUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  signOut: async () => {},
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null, needsVerification: false }),
  fetchUserRole: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const tokenResult = await getIdTokenResult(user);
        const userRole = (tokenResult.claims.role as string) || null;
        setRole(userRole);
        
        const token = await user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        setRole(null);
        document.cookie = "firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth!, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: fullName });
      }
      return { user: result.user, error: null, needsVerification: false };
    } catch (error: any) {
      return { user: null, error: error.message, needsVerification: false };
    }
  };

  const fetchUserRole = async () => {
    if (!auth?.currentUser) return null;
    const tokenResult = await getIdTokenResult(auth.currentUser, true);
    const userRole = (tokenResult.claims.role as string) || null;
    setRole(userRole);
    return userRole;
  };

  const signOut = async () => {
    await firebaseSignOut(auth!);
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, signOut, signIn, signUp, fetchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
