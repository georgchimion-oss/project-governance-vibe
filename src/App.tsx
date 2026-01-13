import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import DashboardEnhanced from './screens/DashboardEnhanced'
import Kanban from './screens/Kanban'
import Gantt from './screens/Gantt'
import Deliverables from './screens/Deliverables'
import Staff from './screens/Staff'
import Workstreams from './screens/Workstreams'
import PTORequests from './screens/PTORequests'
import HoursTracking from './screens/HoursTracking'
import OrgChartHierarchy from './screens/OrgChartHierarchy'
import OrgChartWorkstream from './screens/OrgChartWorkstream'
import AdminAnalytics from './screens/AdminAnalytics'
import { seedInitialData } from './data/dataLayer'
import './App.css'

function AppRoutes() {
  const { currentUser } = useAuth()

  useEffect(() => {
    seedInitialData()
  }, [])

  if (!currentUser) {
    return <Login />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <DashboardEnhanced />
          </>
        }
      />
      <Route
        path="/dashboard-old"
        element={
          <Layout title="My Work">
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/kanban"
        element={
          <Layout title="Kanban Board">
            <Kanban />
          </Layout>
        }
      />
      <Route
        path="/gantt"
        element={
          <Layout title="Gantt Chart">
            <Gantt />
          </Layout>
        }
      />
      <Route
        path="/deliverables"
        element={
          <Layout title="Deliverables">
            <Deliverables />
          </Layout>
        }
      />
      <Route
        path="/staff"
        element={
          <Layout title="Staff Management">
            <Staff />
          </Layout>
        }
      />
      <Route
        path="/workstreams"
        element={
          <Layout title="Workstreams">
            <Workstreams />
          </Layout>
        }
      />
      <Route
        path="/pto"
        element={
          <Layout title="PTO Requests">
            <PTORequests />
          </Layout>
        }
      />
      <Route
        path="/hours"
        element={
          <Layout title="Hours Tracking">
            <HoursTracking />
          </Layout>
        }
      />
      <Route
        path="/org-chart-hierarchy"
        element={
          <Layout title="Org Chart - Hierarchy">
            <OrgChartHierarchy />
          </Layout>
        }
      />
      <Route
        path="/org-chart-workstream"
        element={
          <Layout title="Org Chart - Workstream">
            <OrgChartWorkstream />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout title="Admin Analytics">
            <AdminAnalytics />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
