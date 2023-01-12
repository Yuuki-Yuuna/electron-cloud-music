import { Song } from "../Music"

export interface SearchResultResponse {
  code: number
  result: {
    songCount: number
    songs: Song[]
  }
}