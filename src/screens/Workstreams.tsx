import { useState } from 'react'
import { getWorkstreams, createWorkstream, updateWorkstream, deleteWorkstream, getStaff } from '../data/dataLayer'
import type { Workstream } from '../types'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const PRESET_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

export default function Workstreams() {
  const [workstreams, setWorkstreams] = useState(getWorkstreams())
  const [showModal, setShowModal] = useState(false)
  const [editingWorkstream, setEditingWorkstream] = useState<Workstream | null>(null)
  const staff = getStaff()

  const [formData, setFormData] = useState<Partial<Workstream>>({
    name: '',
    description: '',
    lead: '',
    color: '#3b82f6',
  })

  const handleOpenModal = (workstream?: Workstream) => {
    if (workstream) {
      setEditingWorkstream(workstream)
      setFormData(workstream)
    } else {
      setEditingWorkstream(null)
      setFormData({
        name: '',
        description: '',
        lead: staff[0]?.id || '',
        color: '#3b82f6',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingWorkstream(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingWorkstream) {
      updateWorkstream(editingWorkstream.id, formData)
    } else {
      const newWorkstream: Workstream = {
        id: Date.now().toString(),
        name: formData.name!,
        description: formData.description!,
        lead: formData.lead!,
        color: formData.color!,
        createdAt: new Date().toISOString(),
      }
      createWorkstream(newWorkstream)
    }

    setWorkstreams(getWorkstreams())
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workstream?')) {
      deleteWorkstream(id)
      setWorkstreams(getWorkstreams())
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Workstream Management</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Workstream
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
          {workstreams.map((w) => {
            const lead = staff.find((s) => s.id === w.lead)
            return (
              <div
                key={w.id}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: w.color,
                    borderRadius: '9999px',
                    marginBottom: '1rem',
                  }}
                />
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {w.name}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {w.description}
                </p>
                <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lead: </span>
                  <span style={{ fontWeight: '500' }}>{lead?.name || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenModal(w)}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(w.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingWorkstream ? 'Edit Workstream' : 'New Workstream'}
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
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                <div className="form-group">
                  <label className="form-label">Workstream Lead *</label>
                  <select
                    required
                    value={formData.lead}
                    onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: color,
                          border: formData.color === color ? '3px solid white' : '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWorkstream ? 'Save Changes' : 'Create Workstream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
