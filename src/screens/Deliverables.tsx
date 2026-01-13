import { useState } from 'react'
import {
  getDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  getStaff,
  getWorkstreams,
} from '../data/dataLayer'
import type { Deliverable, DeliverableStatus, Priority, RiskLevel } from '../types'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function Deliverables() {
  const [deliverables, setDeliverables] = useState(getDeliverables())
  const [showModal, setShowModal] = useState(false)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const staff = getStaff()
  const workstreams = getWorkstreams()

  const [formData, setFormData] = useState<Partial<Deliverable>>({
    title: '',
    description: '',
    workstreamId: '',
    ownerId: '',
    status: 'Not Started',
    priority: 'Medium',
    risk: 'Low',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    progress: 0,
    dependencies: [],
    tags: [],
  })

  const handleOpenModal = (deliverable?: Deliverable) => {
    if (deliverable) {
      setEditingDeliverable(deliverable)
      setFormData(deliverable)
    } else {
      setEditingDeliverable(null)
      setFormData({
        title: '',
        description: '',
        workstreamId: workstreams[0]?.id || '',
        ownerId: staff[0]?.id || '',
        status: 'Not Started',
        priority: 'Medium',
        risk: 'Low',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        progress: 0,
        dependencies: [],
        tags: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDeliverable(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingDeliverable) {
      updateDeliverable(editingDeliverable.id, formData)
    } else {
      const newDeliverable: Deliverable = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description!,
        workstreamId: formData.workstreamId!,
        ownerId: formData.ownerId!,
        status: formData.status as DeliverableStatus,
        priority: formData.priority as Priority,
        risk: formData.risk as RiskLevel,
        startDate: formData.startDate!,
        dueDate: formData.dueDate!,
        progress: formData.progress!,
        dependencies: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      createDeliverable(newDeliverable)
    }

    setDeliverables(getDeliverables())
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this deliverable?')) {
      deleteDeliverable(id)
      setDeliverables(getDeliverables())
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Deliverables</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Deliverable
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Workstream</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Risk</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((d) => {
              const owner = staff.find((s) => s.id === d.ownerId)
              const workstream = workstreams.find((w) => w.id === d.workstreamId)
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: '500' }}>{d.title}</td>
                  <td>
                    {workstream && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          background: `${workstream.color}20`,
                          color: workstream.color,
                        }}
                      >
                        {workstream.name}
                      </span>
                    )}
                  </td>
                  <td>{owner?.name || 'Unknown'}</td>
                  <td>
                    <span className={`badge badge-${d.status.toLowerCase().replace(' ', '-')}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${d.priority.toLowerCase()}`}>{d.priority}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${d.risk.toLowerCase()}`}>{d.risk}</span>
                  </td>
                  <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ minWidth: '80px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${d.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenModal(d)}
                        style={{ padding: '0.375rem' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(d.id)}
                        style={{ padding: '0.375rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDeliverable ? 'Edit Deliverable' : 'New Deliverable'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Workstream *</label>
                    <select
                      required
                      value={formData.workstreamId}
                      onChange={(e) => setFormData({ ...formData, workstreamId: e.target.value })}
                    >
                      {workstreams.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Owner *</label>
                    <select
                      required
                      value={formData.ownerId}
                      onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    >
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as DeliverableStatus })
                      }
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Risk</label>
                    <select
                      value={formData.risk}
                      onChange={(e) => setFormData({ ...formData, risk: e.target.value as RiskLevel })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) =>
                        setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDeliverable ? 'Save Changes' : 'Create Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
