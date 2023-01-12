import { AxiosResponse } from "axios"

export interface Response<T = any> extends AxiosResponse {
  data: {
    code: number
    data: T
  }
}