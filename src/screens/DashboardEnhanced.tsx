import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { getDeliverables, getWorkstreams, getStaff, updateDeliverable } from '../data/dataLayer'
import { AlertCircle, TrendingUp, CheckCircle2, Clock, MessageSquare, AlertTriangle, Plus } from 'lucide-react'
import type { DashboardStats } from '../types'
import { useAuth } from '../context/AuthContext'
import ViewSwitcher, { type ViewType } from '../components/ViewSwitcher'
import TableView from '../components/TableView'
import KanbanView from '../components/KanbanView'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

type ThemeType = 'glassmorphism' | 'monday' | 'mondayPro' | 'notion' | 'linear'

const THEMES = {
  glassmorphism: {
    name: 'Glassmorphism Dark',
    bgMain: 'linear-gradient(135deg, #0f1117 0%, #1a1d29 50%, #0f1117 100%)',
    cardBg: 'rgba(26, 29, 41, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    primary: '#E88D14',
  },
  monday: {
    name: 'Monday Vibrant',
    bgMain: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #74b9ff 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(108, 92, 231, 0.2)',
    textPrimary: '#2d3436',
    textSecondary: '#636e72',
    primary: '#6c5ce7',
  },
  mondayPro: {
    name: 'Monday.com Pro',
    bgMain: '#F6F7FB',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#323338',
    textSecondary: '#676879',
    primary: '#0073EA',
    accent1: '#00CA72',
    accent2: '#FDAB3D',
    accent3: '#FF5AC4',
    accent4: '#9CD326',
    statusColors: {
      completed: '#00CA72',
      inProgress: '#0073EA',
      atRisk: '#E44258',
      blocked: '#C4C4C4',
      notStarted: '#C4C4C4',
    }
  },
  notion: {
    name: 'Notion Clean',
    bgMain: 'linear-gradient(135deg, #f7f6f3 0%, #ffffff 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#37352f',
    textSecondary: '#787774',
    primary: '#2eaadc',
  },
  linear: {
    name: 'Linear Purple',
    bgMain: 'linear-gradient(135deg, #1a1625 0%, #2d1b69 50%, #1a1625 100%)',
    cardBg: 'rgba(45, 27, 105, 0.4)',
    cardBorder: 'rgba(138, 93, 255, 0.3)',
    textPrimary: '#e6e6e6',
    textSecondary: '#a6a6a6',
    primary: '#8a5dff',
  },
}

export default function DashboardEnhanced() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [theme, setTheme] = useState<ThemeType>('glassmorphism')
  const [currentView, setCurrentView] = useState<ViewType>('cards')
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskDeliverableId, setRiskDeliverableId] = useState<string | null>(null)

  const allDeliverables = getDeliverables()
  const workstreams = getWorkstreams()
  const staff = getStaff()

  const currentTheme = THEMES[theme]

  // Helper function to get status colors based on theme
  const getStatusColor = (status: string) => {
    if (theme === 'mondayPro' && currentTheme.statusColors) {
      const statusMap: Record<string, string> = {
        'Completed': currentTheme.statusColors.completed,
        'In Progress': currentTheme.statusColors.inProgress,
        'At Risk': currentTheme.statusColors.atRisk,
        'Blocked': currentTheme.statusColors.blocked,
        'Not Started': currentTheme.statusColors.notStarted,
      }
      return statusMap[status] || '#C4C4C4'
    }
    // Default colors for other themes
    return status === 'Completed' ? '#10b981' :
           status === 'In Progress' ? '#3b82f6' :
           status === 'At Risk' ? '#ef4444' :
           status === 'Blocked' ? '#6b7280' : '#94a3b8'
  }

  // Filter deliverables to show those assigned to current user OR their supervisor
  const deliverables = useMemo(() => {
    return allDeliverables.filter(d =>
      d.ownerId === currentUser?.id ||
      d.ownerId === currentUser?.supervisorId
    )
  }, [allDeliverables, currentUser?.id, currentUser?.supervisorId])

  const stats: DashboardStats = useMemo(() => {
    const total = deliverables.length
    const completed = deliverables.filter((d) => d.status === 'Completed').length
    const inProgress = deliverables.filter((d) => d.status === 'In Progress').length
    const atRisk = deliverables.filter((d) => d.status === 'At Risk').length
    const blocked = deliverables.filter((d) => d.status === 'Blocked').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgProgress = total > 0 ? Math.round(deliverables.reduce((sum, d) => sum + d.progress, 0) / total) : 0

    return { totalDeliverables: total, completed, inProgress, atRisk, blocked, completionRate, avgProgress }
  }, [deliverables])

  const handleAddComment = (deliverableId: string) => {
    if (commentText.trim()) {
      // In a real app, this would save to a comments collection
      console.log(`Adding comment to ${deliverableId}:`, commentText)
      alert(`Comment added: "${commentText}"`)
      setCommentText('')
      setCommentingOn(null)
    }
  }

  const handleCreateRisk = (deliverableId: string) => {
    setRiskDeliverableId(deliverableId)
    setShowRiskModal(true)
  }

  const handleSaveRisk = () => {
    if (riskDeliverableId) {
      updateDeliverable(riskDeliverableId, { status: 'At Risk' as any })
      alert('Risk created and deliverable marked as At Risk')
      setShowRiskModal(false)
      setRiskDeliverableId(null)
      window.location.reload()
    }
  }

  return (
    <div style={{
      background: currentTheme.bgMain,
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 260,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      padding: '2rem',
    }}>
      {/* Theme Switcher */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.5rem' }}>
            My Work
          </h1>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
            Showing {deliverables.length} deliverables assigned to you or your supervisor
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: currentTheme.textSecondary }}>Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.cardBorder}`,
              background: currentTheme.cardBg,
              color: currentTheme.textPrimary,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {Object.entries(THEMES).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View Switcher */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: `4px solid ${currentTheme.primary}`,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>My Deliverables</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.totalDeliverables}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>Assigned to you</div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: '4px solid #10b981',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Completion Rate</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.completionRate}%</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.completed} completed
          </div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: '4px solid #3b82f6',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.avgProgress}% avg progress
          </div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: `4px solid ${stats.atRisk > 0 ? '#ef4444' : '#10b981'}`,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>At Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.atRisk > 0 ? '#ef4444' : '#10b981', marginBottom: '0.25rem' }}>{stats.atRisk}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
            {stats.atRisk > 0 ? (
              <>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Needs attention
              </>
            ) : (
              <>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                On track
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deliverable Cards */}
      <div style={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '1.5rem' }}>
          All My Deliverables
        </h3>

        {deliverables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: currentTheme.textSecondary }}>
            <p>No deliverables assigned to you yet.</p>
          </div>
        ) : (
          <>
            {currentView === 'table' && <TableView deliverables={deliverables} />}
            {currentView === 'kanban' && <KanbanView deliverables={deliverables} onUpdate={() => window.location.reload()} />}
            {currentView === 'timeline' && (
              <div style={{ textAlign: 'center', padding: '3rem', color: currentTheme.textSecondary }}>
                <p>Timeline view coming soon...</p>
              </div>
            )}
            {currentView === 'cards' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {deliverables.map((d) => {
              const owner = staff.find((s) => s.id === d.ownerId)
              const workstream = workstreams.find((w) => w.id === d.workstreamId)
              const isCommenting = commentingOn === d.id

              return (
                <div
                  key={d.id}
                  style={{
                    background: theme === 'mondayPro' ? '#FFFFFF' :
                               theme === 'notion' || theme === 'monday' ? 'rgba(255, 255, 255, 0.8)' :
                               'rgba(255, 255, 255, 0.05)',
                    border: theme === 'mondayPro' ? '1px solid #E6E9EF' : `1px solid ${currentTheme.cardBorder}`,
                    borderRadius: theme === 'mondayPro' ? '8px' : '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: theme === 'mondayPro' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = theme === 'mondayPro' ?
                      '0 4px 12px rgba(0, 0, 0, 0.12)' :
                      '0 8px 24px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = theme === 'mondayPro' ?
                      '0 1px 3px rgba(0, 0, 0, 0.08)' :
                      'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '0.5rem' }}>
                        {d.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.75rem' }}>
                        {d.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Owner:</strong> {owner?.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Workstream:</strong> {workstream?.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Due:</strong> {new Date(d.dueDate).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{
                            padding: theme === 'mondayPro' ? '0.375rem 1rem' : '0.25rem 0.75rem',
                            borderRadius: theme === 'mondayPro' ? '4px' : '9999px',
                            fontSize: '0.75rem',
                            fontWeight: theme === 'mondayPro' ? '600' : '500',
                            background: theme === 'mondayPro' ? getStatusColor(d.status) :
                                       d.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' :
                                       d.status === 'In Progress' ? 'rgba(59, 130, 246, 0.2)' :
                                       d.status === 'At Risk' ? 'rgba(239, 68, 68, 0.2)' :
                                       d.status === 'Blocked' ? 'rgba(107, 114, 128, 0.2)' :
                                       'rgba(148, 163, 184, 0.2)',
                            color: theme === 'mondayPro' ? '#FFFFFF' :
                                  d.status === 'Completed' ? '#10b981' :
                                  d.status === 'In Progress' ? '#3b82f6' :
                                  d.status === 'At Risk' ? '#ef4444' :
                                  d.status === 'Blocked' ? '#6b7280' :
                                  '#94a3b8',
                          }}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCommentingOn(isCommenting ? null : d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: isCommenting ? currentTheme.primary : currentTheme.cardBg,
                          color: isCommenting ? 'white' : currentTheme.textPrimary,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <MessageSquare size={16} />
                        Update
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateRisk(d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <AlertTriangle size={16} />
                        Risk
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: currentTheme.textSecondary }}>
                      <span>Progress</span>
                      <span>{d.progress}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: theme === 'notion' || theme === 'monday' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${d.progress}%`,
                        background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {/* Comment Input */}
                  {isCommenting && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: theme === 'notion' || theme === 'monday' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                    }}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add an update or comment..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: currentTheme.cardBg,
                          color: currentTheme.textPrimary,
                          fontSize: '0.875rem',
                          minHeight: '80px',
                          resize: 'vertical',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleAddComment(d.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: currentTheme.primary,
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                          }}
                        >
                          Post Update
                        </button>
                        <button
                          onClick={() => {
                            setCommentingOn(null)
                            setCommentText('')
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: `1px solid ${currentTheme.cardBorder}`,
                            background: 'transparent',
                            color: currentTheme.textSecondary,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
            )}
          </>
        )}
      </div>

      {/* Risk Modal */}
      {showRiskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowRiskModal(false)}>
          <div style={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '1rem' }}>
              Create Risk
            </h3>
            <p style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '1.5rem' }}>
              This will mark the deliverable as "At Risk" and notify relevant stakeholders.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveRisk}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Create Risk
              </button>
              <button
                onClick={() => setShowRiskModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.cardBorder}`,
                  background: 'transparent',
                  color: currentTheme.textPrimary,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
