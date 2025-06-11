import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './firebase/config'; // Import Firebase configuration

import '@fortawesome/fontawesome-free/css/all.css'

createApp(App).use(router).mount('#app');
