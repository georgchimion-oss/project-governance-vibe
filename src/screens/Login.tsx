import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStaff } from '../data/dataLayer'

export default function Login() {
  const { login } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState('')
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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select User *</label>
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
            Sign In
          </button>
        </form>

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          First-time setup: Select your account once. The app will remember you on next launch.
        </p>
      </div>
    </div>
  )
}
