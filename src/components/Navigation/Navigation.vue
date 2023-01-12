<template>
  <div class="navigation" ref="navigationRef">
    <div class="logo">
      <el-image :src="logo" class="logo-img" />
      <h4 class="logo-title">网抑云音乐</h4>
    </div>
    <div class="record">
      <div class="arrow" @click="back">
        <svg class="icon">
          <use xlink:href="#icon-fanhui"></use>
        </svg>
      </div>
      <div class="arrow" style="scale: -1;" @click="forward">
        <svg class="icon">
          <use xlink:href="#icon-fanhui"></use>
        </svg>
      </div>
    </div>
    <div class="search-wrapper">
      <el-input placeholder="搜索歌曲" v-model="keywords">
        <template #prepend>
          <div class="search-icon" @click="search">
            <svg class="icon">
              <use xlink:href="#icon-sousuo"></use>
            </svg>
          </div>
        </template>
      </el-input>
    </div>
    <div class="flex-grow"></div>
    <div v-if="!loginStatus" class="user-profile">
      <el-avatar :src="avatar" :size="32" style="cursor: pointer;" />
      <span class="nickname" @click="showLoginBox">登录</span>
    </div>
    <div v-else class="user-profile">
      <el-avatar :src="userProfile?.avatarUrl" :size="32" style="cursor: pointer;" />
      <el-dropdown popper-class="user-option" trigger="click">
        <span class="nickname">{{ userProfile?.nickname }}</span>
        <template #dropdown>
          <div class="vip">
            <span>会员等级：</span>
            <el-tag effect="dark" size="small" :color="userProfile?.vipType ? '#409EFF' : '#909399'">VIP</el-tag>
          </div>
          <el-dropdown-item @click="toProfile">
            <svg class="icon">
              <use xlink:href="#icon-gerenzhongxin"></use>
            </svg>
            个人主页
          </el-dropdown-item>
          <el-dropdown-item @click="logout">
            <svg class="icon">
              <use xlink:href="#icon-tuichudenglu"></use>
            </svg>
            退出登录
          </el-dropdown-item>
        </template>
      </el-dropdown>
    </div>
    <div class="tools">
      <div class="tool">
        <el-dropdown trigger="click" popper-class="theme-option">
          <svg class="icon" style="width: 20px; height: 20px;">
            <use xlink:href="#icon-gexingzhuangban"></use>
          </svg>
          <template #dropdown>
            <div class="theme-content">
              <h2 class="theme-title">主题</h2>
              <div class="color-blocks">
                <div class="color-block" v-for="(item, index) in color" :key="index"
                  :style="`background-color: var(--theme-background-${item}); border: ${item == 'white' ? '1px solid #cccccc' : 'none'}`"
                  @click="changeThemeColor(item)">
                </div>
              </div>
            </div>
          </template>
        </el-dropdown>
      </div>
      <div class="tool" @click="toOption">
        <svg class="icon">
          <use xlink:href="#icon-shezhimianban"></use>
        </svg>
      </div>
      <div class="divider">
        <svg class="icon">
          <use xlink:href="#icon-vertical_line"></use>
        </svg>
      </div>
      <div class="tool" @click="minimize">
        <svg class="icon" style="width: 30px; height: 30px;">
          <use xlink:href="#icon-zuixiaohua"></use>
        </svg>
      </div>
      <div class="tool" @click="close">
        <svg class="icon" style="width: 30px; height: 30px;">
          <use xlink:href="#icon-shanchu"></use>
        </svg>
      </div>
    </div>
    <el-dialog v-model="userStore.$state.showLoginWindow" class="login-dialog">
      <div class="login-box">
        <el-tabs v-model="activeName">
          <el-tab-pane label="扫码登录" name="first">
            <div class="login-form">
              <el-image :src="qrImgUrl" fit="cover" style="margin-bottom: 5px;" />
              <p v-if="qrStatus == 'loading'">加载中</p>
              <p v-else-if="qrStatus == 'waiting'">等待授权</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="账号登录" name="second">
            <div class="login-form">
              <input type="text" v-model="phone" class="input" placeholder="请输入手机号" />
              <input type="password" v-model="password" class="input" placeholder="请输入密码" />
              <el-button type="primary" round @click="login">登录</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="短信登录" name="third">
            <div class="login-form">
              <input type="text" v-model="phone" class="input" placeholder="请输入手机号">
              <div class="capcha">
                <input type="text" v-model="captcha" class="input" placeholder="请输入验证码" style="width: 120px;">
                <button v-if="showCaptchaButton" class="normal" @click="sendCaptcha">发送验证码</button>
                <button v-else class="disable">重新发送 {{ captchaInterval }}</button>
              </div>
              <el-button type="primary" round @click="login">登录</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo.png'
import avatar from '@/assets/avatar.jpg'
import qrLoading from '@/assets/qrLoading.gif'
import qrWaiting from '@/assets/qrWaiting.gif'
import { phoneLogin, getUserLoginStatus, capchaSend, getQrKey, createQrLogin, checkQrStatus, userLoginout } from '@/api/user'
import useUserStore from '@/store/userStore'

type ThemeColor = 'white' | 'pink-red' | 'pink' | 'purple' | 'blue' | 'classic' | 'green' | 'light-green' | 'orange' | 'red'
type QrStatus = 'loading' | 'waiting' | 'ready'//加载中，等待授权，加载完

const userStore = useUserStore()
const router = useRouter()
const navigationRef = ref<HTMLDivElement | null>(null)
const color: ThemeColor[] = ['white', 'pink-red', 'pink', 'purple', 'blue', 'classic', 'green', 'light-green', 'orange', 'red']
const userProfile = computed(() => userStore.getProfile)
const loginStatus = computed(() => userStore.getLoginStatus)
const keywords = ref('')
const showCaptchaButton = ref(true)
const activeName = ref<'first' | 'second' | 'third'>('first')
const phone = ref('')
const password = ref('')
const captcha = ref('')
const captchaInterval = ref(60)
const qrImgUrl = ref(qrLoading)
const qrStatus = ref<QrStatus>('loading')

//换页清除,关闭清除
watch([activeName, () => userStore.$state.showLoginWindow], async () => {
  phone.value = ''
  password.value = ''
  captcha.value = ''
  if (userStore.$state.showLoginWindow && activeName.value == 'first') {
    try {
      qrImgUrl.value = qrLoading
      qrStatus.value = 'loading'
      const qrKeyRes = await getQrKey()
      const key = qrKeyRes.data.data.unikey
      const createQrLoginRes = await createQrLogin({ key, qrimg: true })
      qrImgUrl.value = createQrLoginRes.data.data.qrimg
      qrStatus.value = 'ready'
      //轮询二维码状态
      const continueCheckQrStatus = async () => {
        const needContinue = userStore.$state.showLoginWindow && activeName.value == 'first'
        if (!needContinue) {
          qrImgUrl.value = qrLoading
          return
        }
        try {
          const qrStatusRes = await checkQrStatus({ key })
          if (qrStatusRes.data.code == 800) {
            ElMessage.error('二维码已过期')
          } else if (qrStatusRes.data.code == 801) {
            setTimeout(continueCheckQrStatus, 1000)
          } else if (qrStatusRes.data.code == 802) {
            if (qrStatus.value != 'waiting') {
              qrImgUrl.value = qrWaiting
              qrStatus.value = 'waiting'
            }
            setTimeout(continueCheckQrStatus, 1000)
          } else if (qrStatusRes.data.code == 803) {
            // console.log('登陆成功', qrStatusRes.data)
            const cookie = qrStatusRes.data.cookie
            localStorage.setItem('cookie', cookie)
            userStore.$state.loginStatus = true
            userStore.$state.showLoginWindow = false
            ElMessage.success('登陆成功')
            const userStatusRes = await getUserLoginStatus()
            const statusResult = userStatusRes.data
            if (statusResult.code == 200) {
              userStore.$state.profile = statusResult.data
            } else {
              ElMessage.error(statusResult.code + ' 获取用户信息失败')
            }
          }
        } catch (err) {
          console.log(err)
        }
      }
      continueCheckQrStatus()
    } catch (err) {
      console.log(err)
      ElMessage.error('请求错误')
    }
  }
})

const close = () => {
  window.electronWindowApi.closeWindow()
}
const minimize = () => {
  window.electronWindowApi.minimizeWindow()
}
const changeThemeColor = (themeColor: ThemeColor) => {
  if (navigationRef.value) {
    const style = navigationRef.value.style
    const logoColor = themeColor == 'white' ? '#000000' : '#fff'
    style.setProperty('--theme-background-color', `var(--theme-background-${themeColor})`)
    style.setProperty('--theme-element-color', `var(--theme-element-${themeColor})`)
    style.setProperty('--theme-text-color', `var(--theme-text-${themeColor})`)
    style.setProperty('--theme-logo-color', logoColor)
  }
}
const toOption = () => {
  router.push('/option')
}
const back = () => {
  router.back()
}
const forward = () => {
  router.forward()
}
const showLoginBox = () => {
  userStore.$state.showLoginWindow = true
}
const sendCaptcha = async () => {
  const regular = /^1[3-9]\d{9}$/
  if (!regular.test(phone.value)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  try {
    showCaptchaButton.value = false
    captchaInterval.value = 60
    let time = setInterval(() => {
      // console.log('定时器'+time+' 触发', captchaInterval.value)
      if (captchaInterval.value <= 0) {
        clearInterval(time)
        //限制一下速度，防止点太快定时器多开了  
        setTimeout(() => {
          showCaptchaButton.value = true
        }, 200)
      } else {
        captchaInterval.value--
      }
    }, 1000)
    await capchaSend(phone.value)
  } catch (err) {
    console.log(err)
  }
}
const login = async () => {
  userStore.$state.showLoginWindow = false
  try {
    if (activeName.value == 'second' || activeName.value == 'third') {
      const regular = /^1[3-9]\d{9}$/
      if (!regular.test(phone.value)) {
        ElMessage.error('请输入正确的手机号')
        return
      }
      const data: any = { phone: phone.value, password: password.value }
      if (activeName.value == 'third') {
        data.captcha = captcha.value
      }
      const res = await phoneLogin(data)
      const result = res.data
      // console.log(result)
      if (result.code == 200) {
        if (result.code == 200) {
          ElMessage.success('登录成功')
          localStorage.setItem('cookie', result.cookie)
          userStore.$state.profile = result.profile
          userStore.$state.loginStatus = true
        } else {
          ElMessage.error(result.code + ' 请求失败')
        }
      }
    }
  } catch (err) {
    console.log(err)
    ElMessage.error('请求错误')
  }
}
const logout = async () => {
  try {
    const res = await userLoginout()
    const result = res.data
    if(result.code == 200) {
      userStore.$state.profile = null
      userStore.$state.loginStatus = false
      localStorage.removeItem('cookie')
      ElMessage.success('成功退出登录')
    } else {
      ElMessage.error(result.code+ ' 请求失败')
    }
  } catch (err) {
    console.log(err)
  }
}
const toProfile = () => {
  router.push('/profile')
}
const search = () => {
  if (keywords.value) {
    router.push(`/search?keywords=${keywords.value}`)
  }
}

onBeforeMount(async () => {
  userStore.$state.loginStatus = localStorage.getItem('cookie') ? true : false
  if (loginStatus) {
    try {
      const res = await getUserLoginStatus()
      const result = res.data
      if (result.code == 200) {
        // console.log(result.data)
        userStore.$state.profile = result.data
      } else {
        ElMessage.error(result.code + ' 获取用户信息失败')
      }
    } catch (err) {
      console.log(err)
    }
  }
})
</script>

<style lang="scss">
.navigation {
  display: flex;
  align-items: center;
  height: 60px;
  background-color: var(--theme-background-color);

  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    padding: 0 20px;
    cursor: pointer;

    .logo-img {
      width: 36px;
      border-radius: 50%;
    }

    .logo-title {
      font-size: 18px;
      font-weight: 600;
      padding: 0 12px;
      color: var(--theme-logo-color);
    }
  }

  .record {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    margin-left: 20px;

    .arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--theme-element-color);
      border-radius: 50%;
      margin: 0 5px;
      width: 24px;
      height: 24px;
      cursor: pointer;

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  svg {
    width: 24px;
    height: 24px;
    fill: var(--theme-text-color);

    &:hover {
      fill: var(--theme-logo-color);
    }
  }

  .search-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;

    .el-input {
      margin: 0 15px;
      border-radius: 16px;
      overflow: hidden;
      color: #fff;

      .el-input-group__prepend {
        border: none;
        background-color: var(--theme-element-color);
        box-shadow: none;
        padding: 0 0 0 8px;

        .search-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
      }

      .el-input__wrapper {
        background-color: var(--theme-element-color);
        border: none;
        box-shadow: none;

        .el-input__inner {
          font-size: 12px;
          color: var(--theme-text-color);

          &::placeholder {
            color: var(--theme-text-color);
          }
        }
      }
    }
  }

  .user-profile {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 60px;
    color: var(--theme-text-color);

    .nickname {
      display: inline-block;
      font-size: 12px;
      font-weight: 500;
      padding: 0 12px;
      cursor: pointer;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--theme-text-color);
    }
  }

  .flex-grow {
    flex: 1;
  }

  .tools {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 12px;

    .tool {
      padding: 0 5px;
      cursor: pointer;
    }

    .divider {
      fill: var(--theme-text-color);

      svg:hover {
        fill: var(--theme-text-color);
      }
    }
  }
}

.user-option {
  top: 60px !important;
  cursor: default;
  width: 120px;
  font-size: 14px;

  .vip {
    display: flex;
    justify-content: center;
    align-content: center;
    padding: 6px 4px;
    font-size: 12px;

    .el-tag {
      border-color: transparent;
    }
  }

  .icon {
    margin-right: 6px;
  }

  .el-popper__arrow::before {
    display: none;
  }
}

.theme-option {
  top: 60px !important;

  .theme-content {
    width: 240px;
    height: 150px;

    .theme-title {
      font-size: 14px;
      font-weight: 700;
      padding: 5px 12px;
      margin-bottom: 10px;
      cursor: default;
    }

    .color-blocks {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      padding: 6px 12px;

      .color-block {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background-color: aqua;
        cursor: pointer;
        margin: 6px 5px;
      }
    }
  }

  .el-popper__arrow::before {
    display: none;
  }
}

.login-dialog {
  width: 450px;
  height: 360px;
  border-radius: 30px;
  box-shadow: 0 5px 16px rgb(0 0 0 / 10%);
  background-image: url(@/assets/login.png);
  background-size: 150px;
  background-repeat: no-repeat;
  background-position: bottom left;

  .login-box {
    padding: 0 50px;

    .login-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 16px;

      img {
        max-height: 180px;
      }

      .input {
        width: 240px;
        height: 35px;
        margin: 10px 0px;
        border: 1px solid #D4D7DE;
        border-radius: 10px;
        padding-left: 10px;
        outline: 0;

        & :active {
          box-shadow: 0 5px 16px rgb(0 0 0 / 10%);
          border-color: #CDD0D6;
        }

        &::placeholder {
          color: #A8ABB2;
          font-size: 15px;
          font-weight: 500;
        }
      }

      .capcha {
        display: flex;
        justify-content: center;

        button {
          border: none;
          padding: 8px 20px;
          width: 110px;
          height: 35px;
          margin-top: 10px;
          font-size: 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: 0.3s;
          white-space: nowrap;
          margin-left: 10px;
        }

        .normal {
          background-color: #79bbff;
          color: #fff;
        }

        .disable {
          background-color: #EBEDF0;
          color: #909399;
        }
      }

      .el-button {
        margin-top: 10px;
      }
    }
  }
}
</style>