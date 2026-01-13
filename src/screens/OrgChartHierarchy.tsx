import { useMemo } from 'react'
import { getStaff } from '../data/dataLayer'
import { Users } from 'lucide-react'

export default function OrgChartHierarchy() {
  const staff = getStaff().filter((s) => s.isActive)

  const hierarchy = useMemo(() => {
    const buildTree = (supervisorId?: string): any[] => {
      return staff
        .filter((s) => s.supervisorId === supervisorId)
        .sort((a, b) => {
          const titleOrder = ['Partner', 'Director', 'Senior Manager', 'Manager', 'Senior Associate', 'Associate']
          return titleOrder.indexOf(a.title) - titleOrder.indexOf(b.title)
        })
        .map((person) => ({
          ...person,
          subordinates: buildTree(person.id),
        }))
    }

    return buildTree(undefined)
  }, [staff])

  const renderNode = (person: any, level: number = 0) => {
    const hasSubordinates = person.subordinates && person.subordinates.length > 0

    return (
      <div key={person.id} style={{ marginLeft: level > 0 ? '2rem' : 0 }}>
        <div
          style={{
            background: level === 0 ? 'var(--primary)' : 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: level === 0 ? 'white' : 'var(--text-primary)',
                }}
              >
                {person.name}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: level === 0 ? 'rgba(255, 255, 255, 0.9)' : 'var(--primary)',
                  fontWeight: '500',
                  marginBottom: '0.125rem',
                }}
              >
                {person.title}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: level === 0 ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)',
                }}
              >
                {person.role} • {person.department}
              </div>
            </div>

            {hasSubordinates && (
              <div
                style={{
                  background: level === 0 ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-hover)',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: level === 0 ? 'white' : 'var(--text-primary)',
                }}
              >
                <Users size={14} />
                {person.subordinates.length} Direct Report{person.subordinates.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {hasSubordinates && (
          <div style={{ paddingLeft: '1rem', borderLeft: level < 2 ? '2px solid var(--border)' : 'none' }}>
            {person.subordinates.map((sub: any) => renderNode(sub, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Organization Hierarchy
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Reporting structure from Partner to Associate
        </p>
      </div>

      <div>
        {hierarchy.map((person) => renderNode(person))}
      </div>

      {hierarchy.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No organizational hierarchy found</p>
        </div>
      )}
    </div>
  )
}
