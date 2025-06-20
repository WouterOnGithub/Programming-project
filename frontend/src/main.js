import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Firebase configuration to ensure it's initialized
import './firebase/config'

// ✅ Toast plugin import
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 1500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: false
})

app.mount('#app')
