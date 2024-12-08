import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  WhereFilterOp,
  DocumentData,
  Query,
  CollectionReference,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FirestoreData } from "../types";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: FirestoreData) =>
  addDoc(collection(db, collectionName), data);

type WhereClause = [string, WhereFilterOp, any];

export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  whereClause?: WhereClause
): Promise<(T & { id: string })[]> => {
  try {
    let q: Query | CollectionReference = collection(db, collectionName);
    
    if (whereClause) {
      const [field, operator, value] = whereClause;
      q = query(q, where(field, operator, value));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (T & { id: string })[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const updateDocument = (
  collectionName: string,
  id: string,
  data: Partial<FirestoreData>
) => updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

export const getDocumentById = async <T extends DocumentData>(
  collectionName: string, 
  documentId: string
): Promise<(T & { id: string }) | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as T & { id: string };
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
