import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { getStaff } from '../data/dataLayer'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showDemoLogin, setShowDemoLogin] = useState(false)
  const staff = getStaff()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUserId) {
      const user = staff.find(s => s.id === selectedUserId)
      if (user) {
        // Save the username for auto-detection next time
        window.localStorage.setItem('manualUsername', user.name.split(' ')[0].toLowerCase())
        login(selectedUserId)
      }
    }
  }

  const handleGoogleSuccess = (response: any) => {
    if (response.credential) {
      loginWithGoogle(response.credential)
    }
  }

  const handleGoogleError = () => {
    console.error('Google login failed')
    alert('Google login failed. Please try again or use the demo login.')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #E88D14, #DB4E18)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            ProjectGov
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Project Governance Dashboard
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="300"
          />
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ padding: '0 1rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Demo Login Toggle */}
        {!showDemoLogin ? (
          <button
            type="button"
            onClick={() => setShowDemoLogin(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '500',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            Use Demo Account
          </button>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Select Demo User *</label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ fontSize: '0.9375rem' }}
              >
                <option value="">-- Choose your account --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.title})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #E88D14, #DB4E18)',
                border: 'none',
              }}
            >
              Sign In as Demo User
            </button>

            <button
              type="button"
              onClick={() => setShowDemoLogin(false)}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.5rem',
                fontSize: '0.8125rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          Sign in with your Google account for SSO, or use a demo account for testing.
        </p>
      </div>
    </div>
  )
}
