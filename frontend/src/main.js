import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


import './firebase/config'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

let app 

const auth = getAuth()
onAuthStateChanged(auth, () => {
  if (!app) {
    app = createApp(App)
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
  }
})
