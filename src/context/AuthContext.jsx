import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUser } from '../firebase/firestore'
import { detectRoleFromId } from '../utils/roleDetector'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)   // full profile from Firestore
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Extract companyId and userId from email
        // format: userid@companyid.teamordo.internal
        const [userPart, domainPart] = firebaseUser.email.split('@')
        const companyId = domainPart.replace('.teamordo.internal', '')
        const userId    = userPart.toUpperCase()
        const profile   = await getUser(companyId, userId)
        setUser(profile ? { ...profile, firebaseUid: firebaseUser.uid } : null)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = async () => {
    const { logoutUser } = await import('../firebase/auth')
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
