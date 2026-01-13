import { PublicClientApplication } from '@azure/msal-browser'
import { SHAREPOINT_SITE_URL, SHAREPOINT_LISTS, sharepointScopes } from '../config/sharepointConfig'

// Graph API base URL
const GRAPH_API = 'https://graph.microsoft.com/v1.0'

// Get the site ID dynamically
let cachedSiteId: string | null = null

async function getAccessToken(msalInstance: PublicClientApplication): Promise<string> {
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length === 0) {
    throw new Error('No authenticated user. Please sign in first.')
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: sharepointScopes,
      account: accounts[0],
    })
    return response.accessToken
  } catch (error) {
    // If silent fails, try popup
    const response = await msalInstance.acquireTokenPopup({
      scopes: sharepointScopes,
    })
    return response.accessToken
  }
}

async function getSiteId(accessToken: string): Promise<string> {
  if (cachedSiteId) return cachedSiteId

  // Extract hostname and site path from URL
  const url = new URL(SHAREPOINT_SITE_URL)
  const hostname = url.hostname
  const sitePath = url.pathname

  const response = await fetch(
    `${GRAPH_API}/sites/${hostname}:${sitePath}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get site ID: ${response.statusText}`)
  }

  const data = await response.json()
  cachedSiteId = data.id
  return data.id
}

// Generic function to get list items
export async function getListItems<T>(
  msalInstance: PublicClientApplication,
  listName: keyof typeof SHAREPOINT_LISTS
): Promise<T[]> {
  const accessToken = await getAccessToken(msalInstance)
  const siteId = await getSiteId(accessToken)
  const listId = SHAREPOINT_LISTS[listName]

  const response = await fetch(
    `${GRAPH_API}/sites/${siteId}/lists/${listId}/items?expand=fields`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get ${listName}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.value.map((item: any) => ({
    id: item.id,
    ...item.fields,
  }))
}

// Generic function to create a list item
export async function createListItem<T>(
  msalInstance: PublicClientApplication,
  listName: keyof typeof SHAREPOINT_LISTS,
  fields: Partial<T>
): Promise<T> {
  const accessToken = await getAccessToken(msalInstance)
  const siteId = await getSiteId(accessToken)
  const listId = SHAREPOINT_LISTS[listName]

  const response = await fetch(
    `${GRAPH_API}/sites/${siteId}/lists/${listId}/items`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create item in ${listName}: ${error}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    ...data.fields,
  } as T
}

// Generic function to update a list item
export async function updateListItem<T>(
  msalInstance: PublicClientApplication,
  listName: keyof typeof SHAREPOINT_LISTS,
  itemId: string,
  fields: Partial<T>
): Promise<T> {
  const accessToken = await getAccessToken(msalInstance)
  const siteId = await getSiteId(accessToken)
  const listId = SHAREPOINT_LISTS[listName]

  const response = await fetch(
    `${GRAPH_API}/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update item in ${listName}: ${error}`)
  }

  const data = await response.json()
  return {
    id: itemId,
    ...data,
  } as T
}

// Generic function to delete a list item
export async function deleteListItem(
  msalInstance: PublicClientApplication,
  listName: keyof typeof SHAREPOINT_LISTS,
  itemId: string
): Promise<void> {
  const accessToken = await getAccessToken(msalInstance)
  const siteId = await getSiteId(accessToken)
  const listId = SHAREPOINT_LISTS[listName]

  const response = await fetch(
    `${GRAPH_API}/sites/${siteId}/lists/${listId}/items/${itemId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete item from ${listName}: ${response.statusText}`)
  }
}

// Typed functions for each list
export const SharePointService = {
  // Staff
  getStaff: (msal: PublicClientApplication) => getListItems(msal, 'Staff'),
  createStaff: (msal: PublicClientApplication, data: any) => createListItem(msal, 'Staff', data),
  updateStaff: (msal: PublicClientApplication, id: string, data: any) => updateListItem(msal, 'Staff', id, data),
  deleteStaff: (msal: PublicClientApplication, id: string) => deleteListItem(msal, 'Staff', id),

  // Deliverables
  getDeliverables: (msal: PublicClientApplication) => getListItems(msal, 'Deliverables'),
  createDeliverable: (msal: PublicClientApplication, data: any) => createListItem(msal, 'Deliverables', data),
  updateDeliverable: (msal: PublicClientApplication, id: string, data: any) => updateListItem(msal, 'Deliverables', id, data),
  deleteDeliverable: (msal: PublicClientApplication, id: string) => deleteListItem(msal, 'Deliverables', id),

  // Workstreams
  getWorkstreams: (msal: PublicClientApplication) => getListItems(msal, 'Workstreams'),
  createWorkstream: (msal: PublicClientApplication, data: any) => createListItem(msal, 'Workstreams', data),
  updateWorkstream: (msal: PublicClientApplication, id: string, data: any) => updateListItem(msal, 'Workstreams', id, data),
  deleteWorkstream: (msal: PublicClientApplication, id: string) => deleteListItem(msal, 'Workstreams', id),

  // Weekly Hours
  getWeeklyHours: (msal: PublicClientApplication) => getListItems(msal, 'WeeklyHours'),
  createWeeklyHours: (msal: PublicClientApplication, data: any) => createListItem(msal, 'WeeklyHours', data),
  updateWeeklyHours: (msal: PublicClientApplication, id: string, data: any) => updateListItem(msal, 'WeeklyHours', id, data),
  deleteWeeklyHours: (msal: PublicClientApplication, id: string) => deleteListItem(msal, 'WeeklyHours', id),

  // Time Off Requests
  getTimeOffRequests: (msal: PublicClientApplication) => getListItems(msal, 'TimeOffRequests'),
  createTimeOffRequest: (msal: PublicClientApplication, data: any) => createListItem(msal, 'TimeOffRequests', data),
  updateTimeOffRequest: (msal: PublicClientApplication, id: string, data: any) => updateListItem(msal, 'TimeOffRequests', id, data),
  deleteTimeOffRequest: (msal: PublicClientApplication, id: string) => deleteListItem(msal, 'TimeOffRequests', id),

  // Audit Trail
  getAuditTrail: (msal: PublicClientApplication) => getListItems(msal, 'AuditTrail'),
  createAuditEntry: (msal: PublicClientApplication, data: any) => createListItem(msal, 'AuditTrail', data),
}
