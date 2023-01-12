import request from '@/util/request'
import { PhoneLoginParams, QrLoginParams, QrStatusParams } from '@/type/user/login/LoginRequest'
import { CapchaSendResponse, LoginStatusResponse, LogoutResponse, PhoneLoginResponse, QrKeyResponse, QrLoginResponse, QrStatusResponse } from '@/type/user/login/LoginResponse'
import { Profile } from '@/type/user/User'
import { Response } from '@/type/music/Response'

export const phoneLogin = (params: PhoneLoginParams) => {
  return request.post<PhoneLoginResponse>('/login/cellphone', params)
}

//生成二维码key
export const getQrKey = () => {
  return request.get<QrKeyResponse>('/login/qr/key')
}

//登录二维码
export const createQrLogin = (params: QrLoginParams) => {
  return request.get<QrLoginResponse>('/login/qr/create', { params })
}

//查询二维码状态
export const checkQrStatus = (params: QrStatusParams) => {
  return request.get<QrStatusResponse>('/login/qr/check', { params })
}

export const capchaSend = (phone: string) => {
  return request.post<CapchaSendResponse>('/captcha/sent', { phone: phone })
}

export const userLoginout = () => {
  return request.post<LogoutResponse>('/logout')
}

export const getUserLoginStatus = () => {
  return new Promise<Response<Profile>>(async (resolve, reject) => {
    try {
      const res = await request.get<LoginStatusResponse>('/login/status')
      const result = res.data.data
      resolve({ ...res, data: { code: result.code, data: result.profile } })
    } catch (err) {
      reject(err)
    }
  })
}