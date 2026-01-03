import { apiFetch } from './api'

export type JellyfinItem = {
  Id: string
  Name: string
  Type: string
  ParentId?: string
  ProductionYear?: number
  Overview?: string
  RunTimeTicks?: number
}

export type JellyfinItemsResponse = {
  Items: JellyfinItem[]
  TotalRecordCount?: number
}

export async function fetchLibraries(userId: string) {
  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Views`)
}

export async function fetchItemsByParent(userId: string, parentId: string) {
  const params = new URLSearchParams({
    ParentId: parentId,
    Recursive: 'true',
    IncludeItemTypes: 'Movie,Series,Episode',
    SortBy: 'SortName',
    SortOrder: 'Ascending',
    Limit: '40',
  })

  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items?${params.toString()}`)
}

export async function fetchResume(userId: string) {
  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items/Resume?Limit=12`)
}

export async function fetchLatest(userId: string) {
  return apiFetch<JellyfinItem[]>(
    `/jellyfin/Users/${userId}/Items/Latest?IncludeItemTypes=Movie,Episode&Limit=12`,
  )
}

export async function fetchItem(userId: string, itemId: string) {
  return apiFetch<JellyfinItem>(`/jellyfin/Users/${userId}/Items/${itemId}`)
}

export async function searchItems(userId: string, term: string) {
  const params = new URLSearchParams({
    SearchTerm: term,
    Recursive: 'true',
    IncludeItemTypes: 'Movie,Series,Episode',
    Limit: '40',
  })

  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items?${params.toString()}`)
}

export function imageUrl(itemId: string, width = 320) {
  return `/api/jellyfin/Items/${itemId}/Images/Primary?fillWidth=${width}&quality=80`
}

export function streamUrl(itemId: string) {
  return `/api/stream/${itemId}`
}
