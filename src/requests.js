// src/requests.js
import { db } from "./firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { setItemStatus } from "./items";

/**
 * Create a swap request for an item.
 */
export async function createRequest({ itemId, itemOwnerId, requesterId }) {
  const ref = await addDoc(collection(db, "requests"), {
    itemId,
    itemOwnerId,
    requesterId,
    status: "pending", // pending | accepted | rejected
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Watch incoming requests (for the owner of items)
 */
export function watchIncomingRequests(itemOwnerId, callback) {
  const q = query(
    collection(db, "requests"),
    where("itemOwnerId", "==", itemOwnerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const reqs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reqs);
  });
}

/**
 * Watch outgoing requests (for the requester)
 */
export function watchMyRequests(requesterId, callback) {
  const q = query(
    collection(db, "requests"),
    where("requesterId", "==", requesterId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const reqs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reqs);
  });
}

/**
 * Accept a request and set the item status to pending.
 * (Owner-only allowed by rules for requests and items)
 */
export async function acceptRequest(requestId, itemId) {
  await updateDoc(doc(db, "requests", requestId), {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });

  // also update item status
  await setItemStatus(itemId, "pending");
}

export async function rejectRequest(requestId) {
  await updateDoc(doc(db, "requests", requestId), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}
