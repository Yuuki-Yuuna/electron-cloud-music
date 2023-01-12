export interface LikeListParams {
  uid: number
}

export interface LikeMusicParams {
  id: number
  like: boolean
}

export interface UserPlayListParams {
  uid: number
}

export interface SubscribePlaylistParams {
  t: 1 | 2//收藏或取消
  id: number
}

export interface OperateUserPlayListParams {
  op: 'add' | 'del'
  pid: number
  tracks: string//多个id逗号隔开
}

export interface NewUserPlayListParams {
  name: string
  privacy?: boolean
  type?: 'NORMAL' | 'VIDEO' | 'SHARED'
}

export interface DeleteUserPlayListParams {
  id: number
}

export interface UpdateUserPlayListParams {
  id: number
  name: string
  desc: string
  tags?: string
}