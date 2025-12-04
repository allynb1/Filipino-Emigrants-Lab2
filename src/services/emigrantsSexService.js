import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const emigrantsCollection = collection(db, "emigrants_sex");

// CREATE
export async function addEmigrantSex(data) {
  return await addDoc(emigrantsCollection, data);
}

// READ (all)
export async function getEmigrantSexes() {
  const snap = await getDocs(emigrantsCollection);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getEmigrantSexByYear(year) {
  const snap = await getDocs(emigrantsCollection);
  const found = snap.docs.find(d => d.data().year === year);
  return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE by id
export async function updateEmigrantSex(id, data) {
  await updateDoc(doc(db, "emigrants_sex", id), data);
}

// DELETE by id
export async function deleteEmigrantSex(id) {
  await deleteDoc(doc(db, "emigrants_sex", id));
}

// DELETE ALL
export async function deleteAllEmigrantSex() {
  const snap = await getDocs(emigrantsCollection);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_sex", d.id)));
  await Promise.all(deletePromises);
}

// CSV Structure for Field Mapping
export const CSV_SEX_MAP = {
  'YEAR': 'year',
  'Male': 'male',
  'Female': 'female',
  'Sex Ratio': 'sex_ratio',
};