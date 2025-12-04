import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Collections
const provinceCollection = collection(db, "emigrants_origin_province");
const regionCollection = collection(db, "emigrants_origin_region");

// --- PROVINCE ---

// CREATE
export async function addOriginProvince(data) {
    return await addDoc(provinceCollection, data);
}

// READ (all)
export async function getOriginProvinces() {
    const snap = await getDocs(provinceCollection);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getOriginProvinceByYear(year) {
    const snap = await getDocs(provinceCollection);
    const found = snap.docs.find(d => d.data().year === year);
    return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE (by id)
export async function updateOriginProvince(id, data) {
    const ref = doc(db, "emigrants_origin_province", id);
    await updateDoc(ref, data);
}

// DELETE (by id)
export async function deleteOriginProvince(id) {
    const ref = doc(db, "emigrants_origin_province", id);
    await deleteDoc(ref);
}

// DELETE ALL
export async function deleteAllOriginProvinces() {
    const snap = await getDocs(provinceCollection);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_origin_province", d.id)));
    await Promise.all(deletePromises);
}


// --- REGION ---

// CREATE
export async function addOriginRegion(data) {
    return await addDoc(regionCollection, data);
}

// READ (all)
export async function getOriginRegions() {
    const snap = await getDocs(regionCollection);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// READ by year
export async function getOriginRegionByYear(year) {
    const snap = await getDocs(regionCollection);
    const found = snap.docs.find(d => d.data().year === year);
    return found ? { id: found.id, ...found.data() } : null;
}

// UPDATE (by id)
export async function updateOriginRegion(id, data) {
    const ref = doc(db, "emigrants_origin_region", id);
    await updateDoc(ref, data);
}

// DELETE (by id)
export async function deleteOriginRegion(id) {
    const ref = doc(db, "emigrants_origin_region", id);
    await deleteDoc(ref);
}

// DELETE ALL
export async function deleteAllOriginRegions() {
    const snap = await getDocs(regionCollection);
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, "emigrants_origin_region", d.id)));
    await Promise.all(deletePromises);
}
