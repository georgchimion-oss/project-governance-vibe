import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserSession } from '../types'
import { logAudit } from '../data/auditLayer'
import { getStaff } from '../data/dataLayer'

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
    // Try to detect Windows username from environment
    const detectUser = () => {
      const staff = getStaff()
      if (staff.length === 0) return null

      // Try to get Windows username from environment variable via electron or system
      // In a real PWC environment, this would connect to Active Directory
      // For now, we'll use a combination of approaches:

      // 1. Check if there's a manually set username (for testing)
      const manualUsername = window.localStorage.getItem('manualUsername')
      if (manualUsername) {
        const matchedUser = staff.find((s: any) =>
          s.name.toLowerCase().includes(manualUsername.toLowerCase()) ||
          s.email.toLowerCase().split('@')[0].toLowerCase() === manualUsername.toLowerCase()
        )
        if (matchedUser) return matchedUser
      }

      // 2. In a real corporate environment, you would use:
      // - Active Directory integration
      // - Windows Integrated Authentication
      // - Corporate SSO token
      // For demo: get from environment or prompt once

      console.log('No user detected. In production, this would use Windows credentials/AD.')
      return null // Return null to show login screen
    }

    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      logAudit(user.id, user.name, 'App Opened', 'App', undefined, 'User opened the application')
    } else {
      const detectedUser = detectUser()
      if (detectedUser) {
        const session: UserSession = {
          id: detectedUser.id,
          name: detectedUser.name,
          email: detectedUser.email,
          title: detectedUser.title,
          userRole: detectedUser.userRole,
          supervisorId: detectedUser.supervisorId,
          workstreamIds: detectedUser.workstreamIds,
        }
        setCurrentUser(session)
        localStorage.setItem('currentUser', JSON.stringify(session))
        logAudit(session.id, session.name, 'Auto-Login', 'App', undefined, 'User auto-logged in based on Windows credentials')
      }
      // If no user detected, Login screen will show and user must select once
    }
  }, [])

  const login = (userId: string) => {
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
