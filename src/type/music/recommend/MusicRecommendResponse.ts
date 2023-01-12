import { PersonalizedSong, Song, StyleTag } from '../Music'

export interface StyleListResponse {
  code: number
  data: StyleTag[]
}

export interface StyleSongResponse{
  code: number
  data: {
    page: {
      cursor: number
      more: boolean
      size: number
      total: number
    },
    songs: Song[]
  }
}

export interface PersonalizedNewSongResponse {
  code: number
  category: number
  result: PersonalizedSong[]
}