import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const emigrantsCollection = collection(db, "emigrants_civilstatus");

// CREATE
export const addEmigrantCivilStatus = async (data) => {
  await addDoc(emigrantsCollection, data);
};

// READ
export const getEmigrantCivilStatuses = async () => {
  const snapshot = await getDocs(emigrantsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// READ by year
export const getEmigrantCivilStatusByYear = async (year) => {
  const snapshot = await getDocs(emigrantsCollection);
  const found = snapshot.docs.find(doc => doc.data().year === year);
  return found ? { id: found.id, ...found.data() } : null;
};

// UPDATE
export const updateEmigrantCivilStatus = async (id, data) => {
  const docRef = doc(db, "emigrants_civilstatus", id);
  await updateDoc(docRef, data);
};

// DELETE
export const deleteEmigrantCivilStatus = async (id) => {
  const docRef = doc(db, "emigrants_civilstatus", id);
  await deleteDoc(docRef);
};

// DELETE ALL
export const deleteAllEmigrantCivilStatus = async () => {
  const snap = await getDocs(emigrantsCollection);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_civilstatus", d.id)));
  await Promise.all(deletePromises);
};

// CSV Structure for Field Mapping
export const CSV_CIVIL_STATUS_MAP = {
  'YEAR': 'year',
  'Single': 'single',
  'Married': 'married',
  'Widower': 'widower',
  'Separated': 'separated',
  'Divorced': 'divorced',
  'Not Reported': 'notReported',
};