// src/items.js
import { db } from "./firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

/**
 * Create an item listing (no images for Option A).
 */
export async function createItem({
  ownerId,
  title,
  description,
  category,
  condition,
  locationText,
}) {
  const docRef = await addDoc(collection(db, "items"), {
    ownerId,
    title: title.trim(),
    description: description.trim(),
    category,
    condition,
    locationText: locationText.trim(),
    status: "available",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Live subscribe to available items (marketplace feed)
 */
export function watchAvailableItems(callback) {
  const q = query(
    collection(db, "items"),
    where("status", "==", "available"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/**
 * Live subscribe to my items (owner dashboard)
 */
export function watchMyItems(ownerId, callback) {
  const q = query(
    collection(db, "items"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/**
 * Delete an item (only owner allowed by rules)
 */
export async function deleteItem(itemId) {
  await deleteDoc(doc(db, "items", itemId));
}

/**
 * Update item status: available | pending | swapped
 */
export async function setItemStatus(itemId, status) {
  await updateDoc(doc(db, "items", itemId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
