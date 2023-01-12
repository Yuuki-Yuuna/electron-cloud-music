export interface TopPLayListParams {
  order?: 'new' | 'hot'
  cat?: string
  limit?: number
  offset?: number
}

export interface HighqualityPlayListParams {
  cat: string
  limit?: number
  before?: number
}

export interface PlayListDetailParams {
  id: number
}

export interface PlayListAllParams {
  id: number
  limit?: number
  offset?: number
}