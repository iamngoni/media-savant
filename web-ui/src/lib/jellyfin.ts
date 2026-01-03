import { apiFetch } from './api'

export type JellyfinPerson = {
  Id?: string
  Name: string
  Role?: string
  Type?: string
  PrimaryImageTag?: string
}

export type JellyfinItem = {
  Id: string
  Name: string
  Type: string
  ParentId?: string
  ProductionYear?: number
  Overview?: string
  RunTimeTicks?: number
  OfficialRating?: string
  CommunityRating?: number
  Genres?: string[]
  Studios?: Array<{ Name: string }>
  People?: JellyfinPerson[]
  SeriesName?: string
  SeasonName?: string
  IndexNumber?: number
  ParentIndexNumber?: number
  DateCreated?: string
  PremiereDate?: string
  UserData?: {
    PlayedPercentage?: number
    PlaybackPositionTicks?: number
    Played?: boolean
    IsFavorite?: boolean
  }
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
  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items/Resume?Limit=12&Fields=Overview,Genres,CommunityRating`)
}

export async function fetchLatest(userId: string) {
  return apiFetch<JellyfinItem[]>(
    `/jellyfin/Users/${userId}/Items/Latest?IncludeItemTypes=Movie,Episode&Limit=12&Fields=Overview,Genres,CommunityRating,DateCreated`,
  )
}

export async function fetchItem(userId: string, itemId: string) {
  return apiFetch<JellyfinItem>(
    `/jellyfin/Users/${userId}/Items/${itemId}?Fields=Overview,Genres,People,CommunityRating,Studios,Tags,OfficialRating`
  )
}

export async function fetchItemDetails(userId: string, itemId: string) {
  return apiFetch<JellyfinItem>(
    `/jellyfin/Users/${userId}/Items/${itemId}?Fields=Overview,Genres,People,CommunityRating,Studios,Tags,OfficialRating,ChildCount,SeasonCount`
  )
}

export async function fetchEpisodes(userId: string, seriesId: string, seasonId?: string) {
  const params = new URLSearchParams({
    ParentId: seasonId || seriesId,
    IncludeItemTypes: 'Episode',
    SortBy: 'IndexNumber',
    SortOrder: 'Ascending',
    Limit: '100',
    Fields: 'Overview,RunTimeTicks',
  })
  return apiFetch<JellyfinItemsResponse>(
    `/jellyfin/Users/${userId}/Items?${params.toString()}`
  )
}

export async function fetchSeasons(userId: string, seriesId: string) {
  return apiFetch<JellyfinItemsResponse>(
    `/jellyfin/Shows/${seriesId}/Seasons?UserId=${userId}`
  )
}

export async function fetchSimilar(userId: string, itemId: string) {
  return apiFetch<JellyfinItemsResponse>(
    `/jellyfin/Items/${itemId}/Similar?UserId=${userId}&Limit=12&Fields=Overview,Genres,CommunityRating`
  )
}

export async function fetchPopular(userId: string) {
  const params = new URLSearchParams({
    Recursive: 'true',
    IncludeItemTypes: 'Series',
    SortBy: 'CommunityRating',
    SortOrder: 'Descending',
    Limit: '12',
    Fields: 'Overview,Genres,CommunityRating',
  })
  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items?${params.toString()}`)
}

export async function fetchRecommended(userId: string) {
  const params = new URLSearchParams({
    Recursive: 'true',
    IncludeItemTypes: 'Movie',
    SortBy: 'Random',
    Limit: '12',
    Fields: 'Overview,Genres,CommunityRating',
  })
  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items?${params.toString()}`)
}

export async function searchItems(userId: string, term: string) {
  const params = new URLSearchParams({
    SearchTerm: term,
    Recursive: 'true',
    IncludeItemTypes: 'Movie,Series,Episode',
    Limit: '40',
    Fields: 'Overview,Genres,CommunityRating',
  })

  return apiFetch<JellyfinItemsResponse>(`/jellyfin/Users/${userId}/Items?${params.toString()}`)
}

export function imageUrl(itemId: string, width = 320) {
  return `/api/jellyfin/Items/${itemId}/Images/Primary?fillWidth=${width}&quality=80`
}

export function backdropUrl(itemId: string, width = 1920) {
  return `/api/jellyfin/Items/${itemId}/Images/Backdrop?fillWidth=${width}&quality=80`
}

export function streamUrl(itemId: string) {
  return `/api/stream/${itemId}`
}
