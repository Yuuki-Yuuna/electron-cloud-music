import { createRouter, createWebHashHistory, RouteLocationNormalized } from 'vue-router'
import useUserStore from '@/store/userStore'

const checkLoginStatus = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const userStore = useUserStore()
  userStore.$state.loginStatus = localStorage.getItem('cookie') ? true : false
  if(!userStore.getLoginStatus) {
    userStore.$state.showLoginWindow = true
    return false
  }
}

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/sheet',
      component: () => import('@/views/Sheet.vue'),
    },
    {
      path: '/interest',
      component: () => import('@/views/Interest.vue'),
      beforeEnter: [checkLoginStatus]
    },
    {
      path: '/sheet/detail/:id',
      component: () => import('@/views/SheetDetail.vue')
    },
    {
      path: '/search',
      component: () => import('@/views/Search.vue')
    },
    {
      path: '/favorite',
      component: () => import('@/views/Favorite.vue'),
      beforeEnter: [checkLoginStatus]
    },
    {
      path: '/rencently',
      component: () => import('@/views/Rencently.vue'),
      beforeEnter: [checkLoginStatus]
    },
    {
      path: '/profile',
      component: () => import('@/views/Profile.vue'),
      beforeEnter: [checkLoginStatus]
    },
    {
      path: '/list/:id',
      component: () => import('@/views/UserList.vue'),
      beforeEnter: [checkLoginStatus]
    },
    {
      path: '/download',
      component: () => import('@/views/Download.vue')
    },
    {
      path: '/option',
      component: () => import('@/views/Option.vue')
    }
  ]
})