export interface PhoneLoginParams {
  phone: string
  password: string
  captcha?: string
}

export interface QrLoginParams {
  key: string
  qrimg: boolean
}

export interface QrStatusParams {
  key: string
}