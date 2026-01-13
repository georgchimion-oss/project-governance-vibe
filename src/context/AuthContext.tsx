import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { AccountInfo } from '@azure/msal-browser'
import type { UserSession } from '../types'
import { logAudit } from '../data/auditLayer'
import { getStaff } from '../data/dataLayer'
import { loginRequest, isMsalConfigured } from '../config/msalConfig'

interface AuthContextType {
  currentUser: UserSession | null
  login: (userId: string) => void
  loginWithMicrosoft: () => Promise<void>
  logout: () => void
  isAdmin: boolean
  isManager: boolean
  isSsoEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const isSsoEnabled = isMsalConfigured()

  // Handle Microsoft SSO authentication
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0 && !currentUser) {
      const account = accounts[0]
      handleMicrosoftAccount(account)
    }
  }, [isAuthenticated, accounts])

  const handleMicrosoftAccount = (account: AccountInfo) => {
    const email = account.username || ''
    const name = account.name || email.split('@')[0]

    // Find matching staff by email
    const staff = getStaff()
    const matchedUser = staff.find((s: any) => s.email.toLowerCase() === email.toLowerCase())

    let session: UserSession

    if (matchedUser) {
      // Existing user - use their role and info
      session = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        title: matchedUser.title,
        userRole: matchedUser.userRole,
        supervisorId: matchedUser.supervisorId,
        workstreamIds: matchedUser.workstreamIds,
      }
    } else {
      // New user from SSO - create session with default "User" role
      session = {
        id: `sso-${email}`,
        name: name,
        email: email,
        title: 'Associate',
        userRole: 'User',
        workstreamIds: [],
      }
    }

    setCurrentUser(session)
    localStorage.setItem('currentUser', JSON.stringify(session))
    logAudit(session.id, session.name, 'SSO-Login', 'App', undefined, 'User logged in via Microsoft SSO')
  }

  // Fallback: Load from localStorage or auto-detect demo user
  useEffect(() => {
    if (currentUser) return // Already logged in

    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      logAudit(user.id, user.name, 'App Opened', 'App', undefined, 'User opened the application')
      return
    }

    // If SSO is enabled, don't auto-login - let user click Sign In
    if (isSsoEnabled) return

    // Demo mode: auto-detect user
    const detectUser = () => {
      const staff = getStaff()
      if (staff.length === 0) return null

      const manualUsername = window.localStorage.getItem('manualUsername')
      if (manualUsername) {
        const matchedUser = staff.find((s: any) =>
          s.name.toLowerCase().includes(manualUsername.toLowerCase()) ||
          s.email.toLowerCase().split('@')[0].toLowerCase() === manualUsername.toLowerCase()
        )
        if (matchedUser) return matchedUser
      }

      const georgUser = staff.find((s: any) =>
        s.name.toLowerCase().includes('georg') && s.name.toLowerCase().includes('chimion')
      )
      if (georgUser) return georgUser

      return staff.find((s: any) => s.userRole === 'Admin') || staff[0]
    }

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
      logAudit(session.id, session.name, 'Auto-Login', 'App', undefined, 'User auto-logged in (demo mode)')
    }
  }, [isSsoEnabled])

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

  const loginWithMicrosoft = async () => {
    try {
      await instance.loginPopup(loginRequest)
      // The useEffect will handle the account once authenticated
    } catch (error) {
      console.error('Microsoft login failed:', error)
      throw error
    }
  }

  const logout = () => {
    if (currentUser) {
      logAudit(currentUser.id, currentUser.name, 'Logout', 'App', undefined, 'User logged out')
    }
    setCurrentUser(null)
    localStorage.removeItem('currentUser')

    // Also logout from Microsoft if SSO was used
    if (isAuthenticated) {
      instance.logoutPopup()
    }
  }

  const isAdmin = currentUser?.userRole === 'Admin'
  const isManager = currentUser?.userRole === 'Admin' || currentUser?.userRole === 'Manager'

  return (
    <AuthContext.Provider value={{ currentUser, login, loginWithMicrosoft, logout, isAdmin, isManager, isSsoEnabled }}>
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
