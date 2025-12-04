import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc} from "firebase/firestore";


const emigrantsCollection = collection(db, "emigrants_age");

// CREATE
export async function addEmigrantAge(data) {
  return await addDoc(emigrantsCollection, data);
}

// READ (all)
export async function getEmigrantAges() {
  const snap = await getDocs(emigrantsCollection);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getEmigrantAgeByYear(year) {
  const snap = await getDocs(emigrantsCollection);
  const found = snap.docs.find(d => d.data().year === year);
  return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE (by id)
export async function updateEmigrantAge(id, data) {
  const ref = doc(db, "emigrants_age", id);
  await updateDoc(ref, data);
}

// DELETE (by id)
export async function deleteEmigrantAge(id) {
  const ref = doc(db, "emigrants_age", id);
  await deleteDoc(ref);
}

// DELETE ALL
export async function deleteAllEmigrantAge() {
  const snap = await getDocs(emigrantsCollection);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_age", d.id)));
  await Promise.all(deletePromises);
}

// CSV Structure for Field Mapping
export const CSV_AGE_GROUP_MAP = {
  '14 - Below': 'age_14_below',
  '15 - 19': 'age_15_19',
  '20 - 24': 'age_20_24',
  '25 - 29': 'age_25_29',
  '30 - 34': 'age_30_34',
  '35 - 39': 'age_35_39',
  '40 - 44': 'age_40_44',
  '45 - 49': 'age_45_49',
  '50 - 54': 'age_50_54',
  '55 - 59': 'age_55_59',
  '60 - 64': 'age_60_64',
  '65 - 69': 'age_65_69',
  '70 - Above': 'age_70_above',
  'Not Reported / No Response': 'notReported', // UPDATED: Matches CSV exactly
};