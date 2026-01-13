import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import Kanban from './screens/Kanban'
import Gantt from './screens/Gantt'
import Deliverables from './screens/Deliverables'
import Staff from './screens/Staff'
import Workstreams from './screens/Workstreams'
import { seedInitialData } from './data/dataLayer'
import './App.css'

export default function App() {
  useEffect(() => {
    seedInitialData()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Dashboard">
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
