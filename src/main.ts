import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import './assets/fontIcon/iconfont'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

app.mount('#app')