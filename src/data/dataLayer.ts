import type { Staff, Workstream, Deliverable, PTORequest } from '../types'

const STAFF_KEY = 'gov_staff'
const WORKSTREAMS_KEY = 'gov_workstreams'
const DELIVERABLES_KEY = 'gov_deliverables'
const PTO_KEY = 'gov_pto'

// Staff CRUD
export function getStaff(): Staff[] {
  const data = localStorage.getItem(STAFF_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setStaff(staff: Staff[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff))
}

export function createStaff(staff: Staff): void {
  const allStaff = getStaff()
  allStaff.push(staff)
  setStaff(allStaff)
}

export function updateStaff(id: string, updates: Partial<Staff>): void {
  const allStaff = getStaff()
  const index = allStaff.findIndex((s) => s.id === id)
  if (index !== -1) {
    allStaff[index] = { ...allStaff[index], ...updates }
    setStaff(allStaff)
  }
}

export function deleteStaff(id: string): void {
  const allStaff = getStaff()
  setStaff(allStaff.filter((s) => s.id !== id))
}

// Workstreams CRUD
export function getWorkstreams(): Workstream[] {
  const data = localStorage.getItem(WORKSTREAMS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setWorkstreams(workstreams: Workstream[]): void {
  localStorage.setItem(WORKSTREAMS_KEY, JSON.stringify(workstreams))
}

export function createWorkstream(workstream: Workstream): void {
  const allWorkstreams = getWorkstreams()
  allWorkstreams.push(workstream)
  setWorkstreams(allWorkstreams)
}

export function updateWorkstream(id: string, updates: Partial<Workstream>): void {
  const allWorkstreams = getWorkstreams()
  const index = allWorkstreams.findIndex((w) => w.id === id)
  if (index !== -1) {
    allWorkstreams[index] = { ...allWorkstreams[index], ...updates }
    setWorkstreams(allWorkstreams)
  }
}

export function deleteWorkstream(id: string): void {
  const allWorkstreams = getWorkstreams()
  setWorkstreams(allWorkstreams.filter((w) => w.id !== id))
}

// Deliverables CRUD
export function getDeliverables(): Deliverable[] {
  const data = localStorage.getItem(DELIVERABLES_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setDeliverables(deliverables: Deliverable[]): void {
  localStorage.setItem(DELIVERABLES_KEY, JSON.stringify(deliverables))
}

export function createDeliverable(deliverable: Deliverable): void {
  const allDeliverables = getDeliverables()
  allDeliverables.push(deliverable)
  setDeliverables(allDeliverables)
}

export function updateDeliverable(id: string, updates: Partial<Deliverable>): void {
  const allDeliverables = getDeliverables()
  const index = allDeliverables.findIndex((d) => d.id === id)
  if (index !== -1) {
    allDeliverables[index] = { ...allDeliverables[index], ...updates, updatedAt: new Date().toISOString() }
    setDeliverables(allDeliverables)
  }
}

export function deleteDeliverable(id: string): void {
  const allDeliverables = getDeliverables()
  setDeliverables(allDeliverables.filter((d) => d.id !== id))
}

// PTO CRUD
export function getPTORequests(): PTORequest[] {
  const data = localStorage.getItem(PTO_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function setPTORequests(requests: PTORequest[]): void {
  localStorage.setItem(PTO_KEY, JSON.stringify(requests))
}

export function createPTORequest(request: PTORequest): void {
  const allRequests = getPTORequests()
  allRequests.push(request)
  setPTORequests(allRequests)
}

export function updatePTORequest(id: string, updates: Partial<PTORequest>): void {
  const allRequests = getPTORequests()
  const index = allRequests.findIndex((r) => r.id === id)
  if (index !== -1) {
    allRequests[index] = { ...allRequests[index], ...updates }
    setPTORequests(allRequests)
  }
}

export function deletePTORequest(id: string): void {
  const allRequests = getPTORequests()
  setPTORequests(allRequests.filter((r) => r.id !== id))
}

// Seed data function
export function seedInitialData(): void {
  if (getStaff().length === 0) {
    const sampleStaff: Staff[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Project Manager',
        email: 'sarah.j@company.com',
        department: 'PMO',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Michael Chen',
        role: 'Senior Developer',
        email: 'michael.c@company.com',
        department: 'Engineering',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Emma Wilson',
        role: 'Business Analyst',
        email: 'emma.w@company.com',
        department: 'Business',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]
    setStaff(sampleStaff)
  }

  if (getWorkstreams().length === 0) {
    const sampleWorkstreams: Workstream[] = [
      {
        id: '1',
        name: 'Digital Transformation',
        description: 'Core platform modernization initiative',
        lead: '1',
        color: '#3b82f6',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Data Analytics',
        description: 'Business intelligence and reporting',
        lead: '3',
        color: '#10b981',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Infrastructure',
        description: 'Cloud migration and DevOps',
        lead: '2',
        color: '#f59e0b',
        createdAt: new Date().toISOString(),
      },
    ]
    setWorkstreams(sampleWorkstreams)
  }

  if (getDeliverables().length === 0) {
    const sampleDeliverables: Deliverable[] = [
      {
        id: '1',
        title: 'API Gateway Implementation',
        description: 'Deploy and configure new API gateway for microservices',
        workstreamId: '1',
        ownerId: '2',
        status: 'In Progress',
        priority: 'High',
        risk: 'Medium',
        startDate: '2026-01-06',
        dueDate: '2026-02-15',
        progress: 45,
        dependencies: [],
        tags: ['backend', 'infrastructure'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'User Dashboard Redesign',
        description: 'Modernize user dashboard with new analytics widgets',
        workstreamId: '2',
        ownerId: '3',
        status: 'Not Started',
        priority: 'Medium',
        risk: 'Low',
        startDate: '2026-02-01',
        dueDate: '2026-03-15',
        progress: 0,
        dependencies: ['1'],
        tags: ['frontend', 'ux'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Database Migration',
        description: 'Migrate legacy database to cloud-native solution',
        workstreamId: '3',
        ownerId: '2',
        status: 'At Risk',
        priority: 'Critical',
        risk: 'High',
        startDate: '2026-01-01',
        dueDate: '2026-01-31',
        progress: 65,
        dependencies: [],
        tags: ['database', 'migration'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Security Audit',
        description: 'Comprehensive security review of all systems',
        workstreamId: '3',
        ownerId: '1',
        status: 'Completed',
        priority: 'High',
        risk: 'Low',
        startDate: '2025-12-01',
        dueDate: '2025-12-31',
        completedDate: '2025-12-28',
        progress: 100,
        dependencies: [],
        tags: ['security', 'compliance'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    setDeliverables(sampleDeliverables)
  }
}
