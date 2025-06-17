<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar-nav">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div>
          <h1 class="sidebar-title">StudentMatch</h1>
          <p class="sidebar-subtitle">Student Instellingen</p>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="['sidebar-link', $route.path === item.href ? 'active' : '']"
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </router-link>
      </nav>
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div>
          <p class="sidebar-user-name">{{ userData?.name || 'Gebruiker' }}</p>
          <p class="sidebar-user-role">Student</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <header class="dashboard-header">
        <div>
          <h1>Welkom terug, {{ userData?.name || 'Gebruiker' }}!</h1>
          <p>Hier is je instellingen overzicht</p>
        </div>
        <div class="dashboard-header-actions">
          <div class="dashboard-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Zoeken..." />
          </div>
          <button class="dashboard-bell">
            <i class="fas fa-bell"></i>
            <span class="dashboard-bell-dot"></span>
          </button>
          <div class="dashboard-profile-avatar">{{ userData?.name?.[0] || 'G' }}</div>
        </div>
      </header>

      <section class="dashboard-2col">
        <!-- Kaart: Wachtwoord wijzigen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Wachtwoord wijzigen</h3>
            <i class="fas fa-key"></i>
          </div>
          <input
            type="password"
            v-model="currentPassword"
            placeholder="Huidig wachtwoord"
            class="setting-input"
          />
          <input
            type="password"
            v-model="newPassword"
            placeholder="Nieuw wachtwoord"
            class="setting-input"
          />
          <p v-if="passwordError" class="text-error">{{ passwordError }}</p>
          <button class="dashboard-action-btn bg-primary text-white" @click="changePassword">
            <i class="fas fa-save"></i> Wijzig wachtwoord
          </button>
        </div>

        <!-- Kaart: Account verwijderen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Account</h3>
            <i class="fas fa-user-slash"></i>
          </div>
          <button class="dashboard-action-btn bg-accent" @click="deleteAccount">
            <i class="fas fa-trash-alt"></i> Verwijder account
          </button>
        </div>

        <!-- Kaart: Uitloggen -->
        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h3>Uitloggen</h3>
            <i class="fas fa-sign-out-alt"></i>
          </div>
          <button class="dashboard-action-btn bg-accent" @click="logout">
            <i class="fas fa-door-open"></i> Log uit
          </button>
        </div>

        <div v-if="message" class="dashboard-message">{{ message }}</div>
      </section>
    </main>
  </div>
</template>

<script>
import {
  getAuth,
  updatePassword,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';

export default {
  name: 'InstellingenStu',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      message: '',
      passwordError: '',
      userData: {},
      navigation: [
        { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-chart-pie' },
        { name: 'Job Swiping', href: '/swipe', icon: 'fas fa-heart' },
        { name: 'Afspraken', href: '/appointments', icon: 'fas fa-calendar' },
        { name: 'Profiel', href: '/profile', icon: 'fas fa-user' },
        { name: 'Instellingen', href: '/instellingen-student', icon: 'fas fa-cog' }
      ]
    };
  },
  methods: {
    async changePassword() {
      this.passwordError = '';
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user || !user.email) {
          this.passwordError = 'Er is iets misgegaan met je account. Probeer opnieuw in te loggen.';
          return;
        }

        if (user.providerData[0]?.providerId === 'google.com') {
          this.passwordError = 'Je kan je wachtwoord niet wijzigen als je met Google bent ingelogd.';
          return;
        }

        if (!this.currentPassword || !this.newPassword) {
          this.passwordError = 'Vul zowel je huidige als nieuwe wachtwoord in.';
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, this.currentPassword);

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.newPassword);

        this.currentPassword = '';
        this.newPassword = '';
        alert('Je wachtwoord is gewijzigd.');
      } catch (error) {
        if (error.code === 'auth/invalid-credential') {
          this.passwordError = 'Het huidige wachtwoord klopt niet.';
        } else if (error.code === 'auth/too-many-requests') {
          this.passwordError = 'Te veel pogingen. Wacht even en probeer opnieuw.';
        } else if (error.code === 'auth/weak-password') {
          this.passwordError = 'Je nieuwe wachtwoord is te zwak.';
        } else {
          this.passwordError = 'Er is een fout opgetreden. Probeer het opnieuw.';
        }
      }
    },
    async deleteAccount() {
      if (!confirm('Weet je zeker dat je je account wilt verwijderen?')) return;
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        await deleteUser(user);
        this.$router.push('/login');
      } catch (error) {
        this.message = 'Fout bij verwijderen account. Probeer opnieuw.';
      }
    },
    async logout() {
      if (!confirm('Weet je zeker dat je wilt uitloggen?')) return;
      const auth = getAuth();
      await signOut(auth);
      this.$router.push('/login');
    }
  }
};
</script>


<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}
.sidebar-nav {
  width: 16rem;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-logo {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
}
.sidebar-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.sidebar-link.active, .sidebar-link:hover {
  background: #f3f4f6;
  color: #c20000;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.sidebar-user-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.sidebar-user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}
.sidebar-user-role {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-main {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem 1.5rem 2rem;
}
.dashboard-header h1 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #c20000;
}
.dashboard-header p {
  color: #6b7280;
  font-size: 0.95rem;
}
.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.dashboard-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.2rem 0.7rem;
}
.dashboard-search i {
  color: #6b7280;
  margin-right: 0.5rem;
}
.dashboard-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  color: #111827;
  width: 8rem;
}
.dashboard-bell {
  background: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  position: relative;
  cursor: pointer;
}
.dashboard-bell-dot {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 0.6rem;
  height: 0.6rem;
  background: #ef4444;
  border-radius: 50%;
}
.dashboard-profile-avatar {
  width: 2rem;
  height: 2rem;
  background: #c20000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .dashboard-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
.stat-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}
.stat-icon {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.7rem;
  font-size: 1.2rem;
}
.text-blue-600 { color: #2563eb; }
.text-green-600 { color: #16a34a; }
.text-purple-600 { color: #7c3aed; }
.text-orange-600 { color: #ea580c; }
.stat-card-bottom {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}
.text-muted { color: #9ca3af; }
.dashboard-2col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin: 2rem 2rem 0 2rem;
}
@media (min-width: 1024px) {
  .dashboard-2col {
    grid-template-columns: 1fr 1fr;
  }
}
.dashboard-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 1.5rem;
}
.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dashboard-activity .activity-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.activity-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
}
.activity-dot.match { background: #16a34a; }
.activity-dot.view { background: #2563eb; }
.activity-dot.appointment { background: #7c3aed; }
.activity-dot.like { background: #ea580c; }
.activity-action {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}
.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}
.dashboard-actions {
  margin: 2rem 2rem 0 2rem;
}
.dashboard-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .dashboard-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.dashboard-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  height: 3rem;
  width: 100%;
  text-align: center;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  transition: background 0.2s, color 0.2s;
}

.dashboard-action-btn i {
  display: flex;
  align-items: center;
  justify-content: center;
}


.dashboard-action-btn.bg-primary {
  background: #c20000;
  color: #fff;
  margin-top: 1.5rem;;
}
.dashboard-action-btn.bg-accent {
  background: #f3f4f6;
  color: #374151;
}
.dashboard-action-btn:hover {
  background: #e5e7eb;
}
.dashboard-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #c20000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.dashboard-error {
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}
.no-data {
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  padding: 1rem;
}

.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.popup-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 90%;
  width: 320px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  text-align: center;
}
.popup-button {
  margin-top: 1rem;
  background: #c20000; 
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.popup-button:hover {
  background: #a80000; 
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.popup-box {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  max-width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.popup-box p {
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
}
.popup-ok-button {
  background-color: #c20000;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
}
.popup-ok-button:hover {
  background-color: #a40000;
}

.text-error {
  color: #dc2626; 
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.setting-input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #111827;
  background-color: #f9fafb;
  transition: border-color 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #c20000;
  background-color: #fff;
}

</style> 