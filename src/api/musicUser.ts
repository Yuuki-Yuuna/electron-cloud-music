import request from '@/util/request'
import { LikeListParams, LikeMusicParams, SubscribePlaylistParams, UserPlayListParams, OperateUserPlayListParams, NewUserPlayListParams, DeleteUserPlayListParams, UpdateUserPlayListParams } from '@/type/music/user/MusicUserRequest'
import { DeleteUserPlayListResponse, LikeListResponse, LikeMusicResponse, NewUserPlayListResponse, OperateUserPlayListResponse, RecentSongResponse, SubscribePlaylistResponse, UpdateUserPlayListResponse, UserFMResponse, UserPlayListResponse } from '@/type/music/user/MusicUserResponse'
import { Music } from '@/type/music/Music'
import { Response } from '@/type/music/Response'

export const getLikeList = (params: LikeListParams) => {
  return request.get<LikeListResponse>('/likelist', { params })
}

export const likeMusic = (params: LikeMusicParams) => {
  return request.get<LikeMusicResponse>('/like', { params })
}

export const getRencentSong = () => {
  return request.get<RecentSongResponse>('/record/recent/song')
}

export const getUserPlayList = (params: UserPlayListParams) => {
  return request.get<UserPlayListResponse>('/user/playlist', { params })
}

export const subscribePlaylist = (params: SubscribePlaylistParams) => {
  return request.get<SubscribePlaylistResponse>('/playlist/subscribe', { params })
}

export const operateUserPlayList = (params: OperateUserPlayListParams) => {
  return request.get<OperateUserPlayListResponse>('/playlist/tracks', { params })
}

export const createNewUserPlayList = (params: NewUserPlayListParams) => {
  return request.get<NewUserPlayListResponse>('/playlist/create', { params })
}

export const deleteUserPlayList = (params: DeleteUserPlayListParams) => {
  return request.get<DeleteUserPlayListResponse>('/playlist/delete', { params })
}

export const updateUserPlayList = (params: UpdateUserPlayListParams) => {
  return request.get<UpdateUserPlayListResponse>('/playlist/update', { params })
}

export const getUserFM = () => {
  return new Promise<Response<Music[]>>(async (resolve, reject) => {
    try {
      const res = await request.get<UserFMResponse>('/personal_fm')
      const result = res.data
      const data: Music[] = result.data.map(song => ({
        id: song.id,
        name: song.name,
        cover: song.album.picUrl,
        url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`,
        duration: song.duration,
        album: song.album.name,
        aritists: song.artists.map(item => item.name),
        fee: song.fee,
        privilege: {
          dlLevel: song.privilege.dlLevel,
          plLevel: song.privilege.plLevel
        }
      }))
      resolve({ ...res, data: { code: result.code, data } })
    } catch (err) {
      reject(err)
    }
  })
}