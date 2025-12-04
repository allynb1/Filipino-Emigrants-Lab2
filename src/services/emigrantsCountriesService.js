import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Collections
const allCountriesCollection = collection(db, "emigrants_countries_all");
const majorCountriesCollection = collection(db, "emigrants_countries_major");

// --- ALL COUNTRIES ---

// CREATE
export async function addCountryAll(data) {
    return await addDoc(allCountriesCollection, data);
}

// READ (all)
export async function getCountriesAll() {
    const snap = await getDocs(allCountriesCollection);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getCountryAllByYear(year) {
    const snap = await getDocs(allCountriesCollection);
    const found = snap.docs.find(d => d.data().year === year);
    return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE (by id)
export async function updateCountryAll(id, data) {
    const ref = doc(db, "emigrants_countries_all", id);
    await updateDoc(ref, data);
}

// DELETE (by id)
export async function deleteCountryAll(id) {
    const ref = doc(db, "emigrants_countries_all", id);
    await deleteDoc(ref);
}

// DELETE ALL
export async function deleteAllCountriesAll() {
    const snap = await getDocs(allCountriesCollection);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_countries_all", d.id)));
    await Promise.all(deletePromises);
}


// --- MAJOR COUNTRIES ---

// CREATE
export async function addCountryMajor(data) {
    return await addDoc(majorCountriesCollection, data);
}

// READ (all)
export async function getCountriesMajor() {
    const snap = await getDocs(majorCountriesCollection);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getCountryMajorByYear(year) {
    const snap = await getDocs(majorCountriesCollection);
    const found = snap.docs.find(d => d.data().year === year);
    return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE (by id)
export async function updateCountryMajor(id, data) {
    const ref = doc(db, "emigrants_countries_major", id);
    await updateDoc(ref, data);
}

// DELETE (by id)
export async function deleteCountryMajor(id) {
    const ref = doc(db, "emigrants_countries_major", id);
    await deleteDoc(ref);
}

// DELETE ALL
export async function deleteAllCountriesMajor() {
    const snap = await getDocs(majorCountriesCollection);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_countries_major", d.id)));
    await Promise.all(deletePromises);
}
