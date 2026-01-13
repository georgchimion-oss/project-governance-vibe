import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { getDeliverables, updateDeliverable, getStaff, getWorkstreams } from '../data/dataLayer'
import type { DeliverableStatus } from '../types'
import { Clock, User, AlertTriangle } from 'lucide-react'

const STATUSES: DeliverableStatus[] = ['Not Started', 'In Progress', 'At Risk', 'Blocked', 'Completed']

const STATUS_COLORS: Record<DeliverableStatus, string> = {
  'Not Started': '#94a3b8',
  'In Progress': '#3b82f6',
  'At Risk': '#ef4444',
  'Blocked': '#6b7280',
  'Completed': '#10b981',
}

export default function Kanban() {
  const [deliverables, setDeliverables] = useState(getDeliverables())
  const staff = getStaff()
  const workstreams = getWorkstreams()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as DeliverableStatus

    updateDeliverable(draggableId, { status: newStatus })
    setDeliverables(getDeliverables())
  }

  const getColumnDeliverables = (status: DeliverableStatus) => {
    return deliverables.filter((d) => d.status === status)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Project Kanban Board
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Drag and drop deliverables between columns to update their status
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
            height: 'calc(100vh - 250px)',
          }}
        >
          {STATUSES.map((status) => {
            const columnDeliverables = getColumnDeliverables(status)
            return (
              <div key={status} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px 12px 0 0',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: STATUS_COLORS[status],
                      }}
                    />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600' }}>{status}</h3>
                  </div>
                  <span
                    style={{
                      background: 'var(--bg-main)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {columnDeliverables.length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: 1,
                        background: snapshot.isDraggingOver
                          ? 'rgba(59, 130, 246, 0.05)'
                          : 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderTop: 'none',
                        borderRadius: '0 0 12px 12px',
                        padding: '1rem',
                        overflowY: 'auto',
                      }}
                    >
                      {columnDeliverables.map((deliverable, index) => {
                        const owner = staff.find((s) => s.id === deliverable.ownerId)
                        const workstream = workstreams.find((w) => w.id === deliverable.workstreamId)
                        return (
                          <Draggable key={deliverable.id} draggableId={deliverable.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: snapshot.isDragging
                                    ? 'var(--bg-hover)'
                                    : 'var(--bg-card)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  marginBottom: '0.75rem',
                                  cursor: 'grab',
                                  transition: 'box-shadow 0.2s ease',
                                  boxShadow: snapshot.isDragging
                                    ? '0 8px 16px rgba(0, 0, 0, 0.3)'
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <h4
                                    style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '600',
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    {deliverable.title}
                                  </h4>
                                  {workstream && (
                                    <div
                                      style={{
                                        display: 'inline-block',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.6875rem',
                                        background: `${workstream.color}20`,
                                        color: workstream.color,
                                      }}
                                    >
                                      {workstream.name}
                                    </div>
                                  )}
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  <User size={12} />
                                  <span>{owner?.name || 'Unassigned'}</span>
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                  }}
                                >
                                  <Clock size={12} />
                                  <span>{new Date(deliverable.dueDate).toLocaleDateString()}</span>
                                </div>

                                {deliverable.risk !== 'Low' && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: deliverable.risk === 'High' || deliverable.risk === 'Critical' ? '#ef4444' : '#f59e0b',
                                    }}
                                  >
                                    <AlertTriangle size={12} />
                                    <span>{deliverable.risk} Risk</span>
                                  </div>
                                )}

                                <div style={{ marginTop: '0.75rem' }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: '0.6875rem',
                                      marginBottom: '0.25rem',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    <span>Progress</span>
                                    <span>{deliverable.progress}%</span>
                                  </div>
                                  <div className="progress-bar" style={{ height: '4px' }}>
                                    <div
                                      className="progress-fill"
                                      style={{ width: `${deliverable.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
