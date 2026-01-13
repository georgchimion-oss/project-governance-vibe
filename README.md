# Project Governance Dashboard - Code App

A modern React + TypeScript implementation of the TD Bank Project Governance system, designed to work with SharePoint lists.

## Features

### 📊 Dashboards
- **My Dashboard** - Personal tasks, PTO status, recent deliverables
- **Executive Dashboard** - High-level KPIs, workstream progress, risk metrics
- **All Deliverables** - Searchable/filterable deliverable list

### 📋 Views
- **Kanban Board** - Drag-and-drop deliverables by Status/Owner/Risk/Workstream
- **Gantt Chart** - Timeline view of deliverables with dependencies
- **Deliverable Details** - Full form with all fields

### 👥 Management
- **Staff Management** - Add/edit staff, assign roles
- **Workstream Management** - Create/manage workstreams and leaders
- **PTO Management** - Request PTO, approve/reject requests

### ⚙️ Admin
- **Settings** - Configure app behavior
- **Onboarding** - Setup wizard for new users

## SharePoint Integration

This app connects to SharePoint lists:

### Required Lists

1. **Deliverables**
   - DeliverableName (Single line of text)
   - Status (Choice: Not Started, In Progress, Completed, On Hold, Cancelled)
   - Owner (Person)
   - Workstream (Lookup to Workstreams)
   - TargetDate (Date)
   - StartDate (Date)
   - Risk (Choice: Low, Medium, High, Critical)
   - Priority (Choice: Low, Medium, High)
   - PercentComplete (Number)
   - Description (Multiple lines of text)
   - Notes (Multiple lines of text)

2. **Staff**
   - FullName (Single line of text)
   - Email (Single line of text)
   - Role (Choice: Admin, Workstream Leader, Team Member)
   - Department (Single line of text)
   - Active (Yes/No)

3. **Workstreams**
   - WorkstreamName (Single line of text)
   - Leader (Person or Person Group - multiple)
   - Description (Multiple lines of text)
   - Status (Choice: Active, On Hold, Completed)

4. **PTORequests**
   - RequestedBy (Person)
   - StartDate (Date)
   - EndDate (Date)
   - TotalDays (Number)
   - Reason (Multiple lines of text)
   - Status (Choice: Pending, Approved, Rejected)
   - ApprovedBy (Person)
   - ApprovalDate (Date)

5. **AppUsageLog** (optional for analytics)
   - UserEmail (Single line of text)
   - LogDate (Date)
   - Title (Single line of text - "AppOpened", "DeliverableCreated", etc.)

## Local Development (Offline Mode)

```bash
# Install dependencies
npm install

# Run locally with mock data
npm run dev
```

Opens at http://localhost:5173 with localStorage-based mock data.

## Connecting to SharePoint

### Option 1: Microsoft Graph API (Recommended)

Uses Microsoft Graph to access SharePoint lists. Requires:
- Azure AD App Registration
- Delegated permissions: `Sites.ReadWrite.All`
- MSAL authentication

### Option 2: SharePoint REST API

Direct REST API calls to SharePoint. Requires:
- SharePoint site URL
- Either:
  - Cookie-based auth (same domain)
  - Or OAuth token

### Option 3: Power Platform Connector (Hybrid)

Use Power Apps as a middleware:
- Deploy this as a Code App
- Use Power Apps connectors for SharePoint
- Pass data via component props

## Configuration

Create `.env.local`:

```env
# SharePoint Site
VITE_SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/ProjectGovernance

# Azure AD (for Graph API)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id

# Development mode (uses mock data)
VITE_USE_MOCK_DATA=true
```

## Project Structure

```
project_governance_vibe/
├── src/
│   ├── screens/          # Main views (Dashboard, Kanban, Gantt, etc.)
│   ├── components/       # Reusable UI components
│   ├── services/         # SharePoint API integration
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Helpers and utilities
│   └── data/             # Mock data for development
├── public/               # Static assets
└── docs/                 # Documentation
```

## Building & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (see DEPLOYMENT.md for details)
```

## SharePoint Setup Steps

1. Create the 5 SharePoint lists (see above)
2. Add sample data
3. Register Azure AD app (for Graph API)
4. Configure permissions
5. Update `.env.local` with credentials
6. Run `npm run dev` to test locally
7. Build and deploy

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Navigation
- **TanStack Query** - Data fetching/caching
- **MSAL** - Microsoft authentication
- **Chart.js** - Data visualization
- **date-fns** - Date manipulation
- **React DnD** - Drag and drop for Kanban

## Development Workflow

```bash
# Start with mock data
VITE_USE_MOCK_DATA=true npm run dev

# Connect to real SharePoint
VITE_USE_MOCK_DATA=false npm run dev

# Build for production
npm run build
```

## Documentation

- [SharePoint Integration Guide](docs/SHAREPOINT_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Component Reference](docs/COMPONENTS.md)

## License

MIT
