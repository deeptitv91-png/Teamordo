import { createContext, useContext, useState, useEffect } from 'react'
import { getCompany, getDepartments } from '../firebase/firestore'
import { useAuth } from './AuthContext'

const CompanyContext = createContext(null)

export const CompanyProvider = ({ children }) => {
  const { user } = useAuth()
  const [company, setCompany]   = useState(null)
  const [departments, setDepts] = useState([])

  useEffect(() => {
    if (!user?.companyId) return
    getCompany(user.companyId).then(setCompany)
    getDepartments(user.companyId).then(setDepts)
  }, [user?.companyId])

  return (
    <CompanyContext.Provider value={{ company, departments, setDepts }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => useContext(CompanyContext)
