import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

// All Teamordo users sign in with email (their ID@company.teamordo.com) + password
// The ID prefix tells the system what role they have

export const loginUser = async (userId, password, companyId) => {
  // Convert userId to firebase email format
  const email = `${userId.toLowerCase()}@${companyId.toLowerCase()}.teamordo.internal`
  const cred = await signInWithEmailAndPassword(auth, email, password)

  // Fetch user profile from Firestore
  const userDoc = await getDoc(doc(db, 'companies', companyId, 'users', userId))
  if (!userDoc.exists()) throw new Error('User profile not found.')

  return { uid: cred.user.uid, ...userDoc.data() }
}

export const logoutUser = () => signOut(auth)

export const createUserAccount = async (userId, password, companyId, profileData) => {
  const email = `${userId.toLowerCase()}@${companyId.toLowerCase()}.teamordo.internal`
  const cred = await createUserWithEmailAndPassword(auth, email, password)

  // Save profile to Firestore
  await setDoc(doc(db, 'companies', companyId, 'users', userId), {
    ...profileData,
    userId,
    companyId,
    createdAt: new Date().toISOString(),
  })

  return cred.user
}

export const sendVerificationEmail = async (firebaseUser) => {
  const { sendEmailVerification } = await import('firebase/auth')
  await sendEmailVerification(firebaseUser)
}
