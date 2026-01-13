import { useMemo } from 'react'
import { getDeliverables, getStaff } from '../data/dataLayer'
import { getAuditLogs, getActivityStats } from '../data/auditLayer'
import { BarChart, Activity, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'

export default function AdminAnalytics() {
  const deliverables = getDeliverables()
  const staff = getStaff()
  const auditLogs = getAuditLogs()
  const activityStats = getActivityStats()

  const staleDeliverables = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return deliverables.filter((d) => {
      if (d.status === 'Completed') return false
      const lastUpdated = new Date(d.updatedAt)
      return lastUpdated < sevenDaysAgo
    })
  }, [deliverables])

  const userActivity = useMemo(() => {
    const userMap = new Map<string, { name: string; actions: number; lastActive: string }>()

    staff.forEach((s) => {
      userMap.set(s.id, {
        name: s.name,
        actions: 0,
        lastActive: 'Never',
      })
    })

    auditLogs.forEach((log) => {
      const user = userMap.get(log.userId)
      if (user) {
        user.actions += 1
        user.lastActive = log.timestamp
      }
    })

    return Array.from(userMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.actions - a.actions)
  }, [staff, auditLogs])

  const recentActivity = useMemo(() => {
    return auditLogs.slice(-20).reverse()
  }, [auditLogs])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Admin Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          System usage, audit trail, and performance metrics
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Actions</div>
          <div className="stat-value">{activityStats.totalActions}</div>
          <div className="stat-change">{activityStats.actionsLast7Days} in last 7 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Users (7d)</div>
          <div className="stat-value">{activityStats.uniqueUsersLast7Days}</div>
          <div className="stat-change">of {staff.filter((s) => s.isActive).length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stale Deliverables</div>
          <div className="stat-value" style={{ color: staleDeliverables.length > 0 ? 'var(--danger)' : 'var(--secondary)' }}>
            {staleDeliverables.length}
          </div>
          <div className={`stat-change ${staleDeliverables.length > 0 ? 'negative' : ''}`}>
            Not updated in 7+ days
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{deliverables.filter((d) => d.status !== 'Completed').length}</div>
          <div className="stat-change">
            {deliverables.filter((d) => d.status === 'In Progress').length} in progress
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Activity</h3>
            <Activity size={20} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Actions</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '500' }}>{user.name}</td>
                    <td>
                      <span
                        style={{
                          background: user.actions > 10 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                          color: user.actions > 10 ? '#10b981' : '#94a3b8',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.8125rem',
                          fontWeight: '500',
                        }}
                      >
                        {user.actions}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {user.lastActive === 'Never'
                        ? 'Never'
                        : new Date(user.lastActive).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Stale Deliverables</h3>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {staleDeliverables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <TrendingUp size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--secondary)' }} />
                <p>All deliverables are up to date!</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {staleDeliverables.map((d) => {
                    const owner = staff.find((s) => s.id === d.ownerId)
                    const daysStale = Math.floor(
                      (new Date().getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontWeight: '500', marginBottom: '0.125rem' }}>{d.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Owner: {owner?.name}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${d.status.toLowerCase().replace(' ', '-')}`}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>
                          {daysStale} days ago
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '500' }}>{log.userName}</td>
                  <td>
                    <span
                      style={{
                        background: 'var(--bg-hover)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '4px',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-low">{log.entityType}</span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                    {log.details}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
