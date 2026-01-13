import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserSession } from '../types'
import { logAudit } from '../data/auditLayer'

interface AuthContextType {
  currentUser: UserSession | null
  login: (userId: string) => void
  logout: () => void
  isAdmin: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      logAudit(user.id, user.name, 'App Opened', 'App', undefined, 'User opened the application')
    }
  }, [])

  const login = (userId: string) => {
    const { getStaff } = require('../data/dataLayer')
    const staff = getStaff()
    const user = staff.find((s: any) => s.id === userId)

    if (user) {
      const session: UserSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        userRole: user.userRole,
        supervisorId: user.supervisorId,
        workstreamIds: user.workstreamIds,
      }
      setCurrentUser(session)
      localStorage.setItem('currentUser', JSON.stringify(session))
      logAudit(session.id, session.name, 'Login', 'App', undefined, 'User logged in')
    }
  }

  const logout = () => {
    if (currentUser) {
      logAudit(currentUser.id, currentUser.name, 'Logout', 'App', undefined, 'User logged out')
    }
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const isAdmin = currentUser?.userRole === 'Admin'
  const isManager = currentUser?.userRole === 'Admin' || currentUser?.userRole === 'Manager'

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
