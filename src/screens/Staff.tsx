import { useState } from 'react'
import { getStaff, createStaff, updateStaff, deleteStaff, getWorkstreams } from '../data/dataLayer'
import type { Staff } from '../types'
import { Plus, Edit2, Trash2, X, UserCheck, UserX } from 'lucide-react'

export default function StaffScreen() {
  const [staff, setStaff] = useState(getStaff())
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: '',
    email: '',
    department: '',
    isActive: true,
  })

  const handleOpenModal = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData(staffMember)
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        role: '',
        email: '',
        department: '',
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingStaff(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingStaff) {
      updateStaff(editingStaff.id, formData)
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        name: formData.name!,
        role: formData.role!,
        email: formData.email!,
        department: formData.department!,
        isActive: formData.isActive!,
        createdAt: new Date().toISOString(),
      }
      createStaff(newStaff)
    }

    setStaff(getStaff())
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteStaff(id)
      setStaff(getStaff())
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Staff Management</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: '500' }}>{s.name}</td>
                <td>{s.role}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                <td>{s.department}</td>
                <td>
                  {s.isActive ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                      <UserCheck size={16} />
                      Active
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <UserX size={16} />
                      Inactive
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenModal(s)}
                      style={{ padding: '0.375rem' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id)}
                      style={{ padding: '0.375rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingStaff ? 'Edit Staff Member' : 'New Staff Member'}</h3>
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
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Save Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
