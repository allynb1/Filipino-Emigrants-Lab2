import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const emigrantsCollection = collection(db, "emigrants_occupation");

// CREATE
export async function addEmigrantOccupation(data) {
  return await addDoc(emigrantsCollection, data);
}

// READ (all)
export async function getEmigrantOccupations() {
  const snap = await getDocs(emigrantsCollection);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getEmigrantOccupationByYear(year) {
  const snap = await getDocs(emigrantsCollection);
  const found = snap.docs.find(d => d.data().year === year);
  return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE by id
export async function updateEmigrantOccupation(id, data) {
  await updateDoc(doc(db, "emigrants_occupation", id), data);
}

// DELETE by id
export async function deleteEmigrantOccupation(id) {
  await deleteDoc(doc(db, "emigrants_occupation", id));
}

// DELETE ALL
export async function deleteAllEmigrantOccupation() {
  const snap = await getDocs(emigrantsCollection);
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_occupation", d.id)));
  await Promise.all(deletePromises);
}

// CSV structure: Occupation as rows, years as columns (transposed)
export const CSV_OCCUPATION_MAP = {
  "Prof'l": 'professional_technical_related',
  'Managerial': 'managerial_executive_administrative',
  'Clerical': 'clerical',
  'Sales': 'sales',
  'Service': 'service',
  'Agriculture': 'agri_animal_forestry_fishery',
  'Production': 'production_transport_laborers',
  'Armed Forces': 'armed_forces',
  'Housewives': 'housewives',
  'Retirees': 'retirees',
  'Students': 'students',
  'Minors': 'minors_below_7', 
  'Out of School Youth': 'out_of_school_youth',
  'Refugees': 'refugees',
  'No Occupation Reported': 'no_occupation_reported',
};