import axios from 'axios'

//使用github开源项目网易云nodejs后端，项目文档https://binaryify.github.io/NeteaseCloudMusicApi/#/
const instance = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: 'https://cloudmusicapi.altria-caster.top',//https://github.com/Binaryify/NeteaseCloudMusicApi
  timeout: 10000,
  //由于新版本chrmoe的samesite=lax设置的鬼才操作，后端不设置已经无法自动注入cookie，本项目该设置废了
  // withCredentials: true//跨域需要带上cookie
})

instance.interceptors.request.use(config => {
  const timestamp = Date.now()//防止请求被缓存需要添加时间戳(post无效，仍会缓存)
  const cookie = localStorage.getItem('cookie')//请手动注入cookie
  if (config.method == 'post') {
    config.data = { ...config.data, timestamp }
    if (cookie) {
      config.data.cookie = cookie
    }
  } else if (config.method == 'get') {
    config.params = { ...config.params, timestamp }
    if (cookie) {
      config.params.cookie = cookie
    }
  }
  return config
}, error => {
  Promise.reject(error)
})

instance.interceptors.response.use(response => {
  return response
}, error => {
  return Promise.reject(error)
})

export default instance