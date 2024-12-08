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
  QueryConstraint,
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

export const getDocuments = async <T>(
  path: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, path);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${path}:`, error);
    throw new Error(`Failed to fetch documents from ${path}`);
  }
};

export const updateDocument = (
  collectionName: string,
  id: string,
  data: Partial<FirestoreData>
) => updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

export const getDocumentById = async <T>(
  collection: string,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  } catch (error) {
    console.error(`Error fetching document from ${collection}:`, error);
    throw new Error(`Failed to fetch document from ${collection}`);
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
