import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const emigrantsCollection = collection(db, "emigrants_education");

// CREATE
export async function addEmigrantEdu(data) {
  return await addDoc(emigrantsCollection, data);
}

// READ (all)
export async function getEmigrantEdus() {
  const snap = await getDocs(emigrantsCollection);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getEmigrantEduByYear(year) {
  const snap = await getDocs(emigrantsCollection);
  const found = snap.docs.find(d => d.data().year === year);
  return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE by id
export async function updateEmigrantEdu(id, data) {
  await updateDoc(doc(db, "emigrants_education", id), data);
}

// DELETE by id
export async function deleteEmigrantEdu(id) {
  await deleteDoc(doc(db, "emigrants_education", id));
}

// DELETE ALL
export async function deleteAllEmigrantEdu() {
  const snap = await getDocs(emigrantsCollection);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_education", d.id)));
  await Promise.all(deletePromises);
}

// CSV Structure for Field Mapping
export const CSV_EDUCATION_MAP = {
  'Not of Schooling Age': 'not_of_schooling_age',
  'No Formal Education': 'no_formal_education',
  'Elementary Level': 'elementary_level',
  'Elementary Graduate': 'elementary_graduate',
  'High School Level': 'high_school_level',
  'High School Graduate': 'high_school_graduate',
  'Vocational Level': 'vocational_level',
  'Vocational Graduate': 'vocational_graduate',
  'College Level': 'college_level',
  'College Graduate': 'college_graduate',
  'Post Graduate Level': 'post_graduate_level',
  'Post Graduate': 'post_graduate',
  'Non-Formal Education': 'non_formal_education',
  'Not Reported / No Response': 'not_reported_no_response',
};