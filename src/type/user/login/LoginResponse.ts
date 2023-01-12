import { Profile } from "../User"

export interface PhoneLoginResponse {
  code: number
  cookie: string
  profile: Profile
}

export interface QrKeyResponse {
  code: number
  data: {
    code: number
    unikey: string
  }
}

export interface QrLoginResponse {
  code: number
  data: {
    qrimg: string
    qrurl: string
  }
}

export interface QrStatusResponse {
  code: number
  cookie: string
  message: string
}

export interface CapchaSendResponse {
  code: number
  data: boolean
}

export interface LoginStatusResponse {
  data: {
    code: number
    profile: Profile
  }
}

export interface LogoutResponse {
  code: number
}