export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type DeliverableStatus = 'Not Started' | 'In Progress' | 'At Risk' | 'Completed' | 'Blocked'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Staff {
  id: string
  name: string
  role: string
  email: string
  department: string
  isActive: boolean
  createdAt: string
}

export interface Workstream {
  id: string
  name: string
  description: string
  lead: string
  color: string
  createdAt: string
}

export interface Deliverable {
  id: string
  title: string
  description: string
  workstreamId: string
  ownerId: string
  status: DeliverableStatus
  priority: Priority
  risk: RiskLevel
  startDate: string
  dueDate: string
  completedDate?: string
  progress: number
  dependencies: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PTORequest {
  id: string
  staffId: string
  startDate: string
  endDate: string
  type: 'Vacation' | 'Sick Leave' | 'Personal' | 'Other'
  status: 'Pending' | 'Approved' | 'Rejected'
  notes?: string
  createdAt: string
}

export interface DashboardStats {
  totalDeliverables: number
  completed: number
  inProgress: number
  atRisk: number
  blocked: number
  completionRate: number
  avgProgress: number
}
