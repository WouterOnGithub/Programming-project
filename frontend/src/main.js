import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './firebase/config'; // Import Firebase configuration

createApp(App).use(router).mount('#app');
