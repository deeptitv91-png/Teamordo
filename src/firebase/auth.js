import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './config'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Secondary Firebase app to create users without affecting current session
import app from './config'

const secondaryApp = initializeApp(app.options, 'Secondary')
const secondaryAuth = getAuth(secondaryApp)

export const loginUser = async (userId, password, companyId) => {
  const email = `${userId.toLowerCase()}@${companyId.toLowerCase()}.teamordo.internal`
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const userDoc = await getDoc(doc(db, 'companies', companyId, 'users', userId))
  if (!userDoc.exists()) throw new Error('User profile not found.')
  return { uid: cred.user.uid, ...userDoc.data() }
}

export const logoutUser = () => signOut(auth)

export const createUserAccount = async (userId, password, companyId, profileData) => {
  // Use secondary app so admin session is not affected
  const email = `${userId.toLowerCase()}@${companyId.toLowerCase()}.teamordo.internal`
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)

  await setDoc(doc(db, 'companies', companyId, 'users', userId), {
    ...profileData,
    userId,
    companyId,
    createdAt: new Date().toISOString(),
  })

  // Sign out from secondary app immediately
  await signOut(secondaryAuth)

  return cred.user
}

export const sendVerificationEmail = async (firebaseUser) => {
  const { sendEmailVerification } = await import('firebase/auth')
  await sendEmailVerification(firebaseUser)
}
