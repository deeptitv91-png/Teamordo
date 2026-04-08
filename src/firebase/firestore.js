import {
  collection, doc, getDoc, getDocs, setDoc,
  updateDoc, query, where, orderBy, serverTimestamp, addDoc
} from 'firebase/firestore'
import { db } from './config'

// ─── COMPANY ───────────────────────────────────────────────
export const createCompany = async (companyId, data) => {
  await setDoc(doc(db, 'companies', companyId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export const getCompany = async (companyId) => {
  const snap = await getDoc(doc(db, 'companies', companyId))
  return snap.exists() ? snap.data() : null
}

// ─── DEPARTMENTS ────────────────────────────────────────────
export const createDepartment = async (companyId, deptId, data) => {
  await setDoc(doc(db, 'companies', companyId, 'departments', deptId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export const getDepartments = async (companyId) => {
  const snap = await getDocs(collection(db, 'companies', companyId, 'departments'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── USERS (admin / dept head / member all live here) ───────
export const createUser = async (companyId, userId, data) => {
  await setDoc(doc(db, 'companies', companyId, 'users', userId), {
    ...data,
    userId,
    companyId,
    createdAt: serverTimestamp(),
  })
}

export const getUser = async (companyId, userId) => {
  const snap = await getDoc(doc(db, 'companies', companyId, 'users', userId))
  return snap.exists() ? snap.data() : null
}

export const getMembersByDept = async (companyId, deptId) => {
  const q = query(
    collection(db, 'companies', companyId, 'users'),
    where('deptId', '==', deptId),
    where('role', '==', 'member')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// ─── TASKS ──────────────────────────────────────────────────
export const createTask = async (companyId, taskData) => {
  const ref = await addDoc(collection(db, 'companies', companyId, 'tasks'), {
    ...taskData,
    status: 'todo',
    l1By: null,
    l2By: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateTask = async (companyId, taskId, updates) => {
  await updateDoc(doc(db, 'companies', companyId, 'tasks', taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export const getTasksByDept = async (companyId, deptId) => {
  const q = query(
    collection(db, 'companies', companyId, 'tasks'),
    where('deptId', '==', deptId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getTasksByAssignee = async (companyId, assigneeId) => {
  const q = query(
    collection(db, 'companies', companyId, 'tasks'),
    where('assignedTo', '==', assigneeId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── UPLOADS ────────────────────────────────────────────────
export const createUpload = async (companyId, uploadData) => {
  const ref = await addDoc(collection(db, 'companies', companyId, 'uploads'), {
    ...uploadData,
    status: 'review',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const updateUpload = async (companyId, uploadId, updates) => {
  await updateDoc(doc(db, 'companies', companyId, 'uploads', uploadId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export const getUploadsByMember = async (companyId, memberId) => {
  const q = query(
    collection(db, 'companies', companyId, 'uploads'),
    where('submittedBy', '==', memberId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
