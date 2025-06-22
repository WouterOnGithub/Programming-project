<template>
  <div class="notification-center">
    <!-- Notification Bell Icon -->
    <div class="notification-bell" @click="toggleNotifications">
      <span class="bell-icon">🔔</span>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </div>

    <!-- Notifications Dropdown -->
    <div v-if="showNotifications" class="notifications-dropdown">
      <div class="notifications-header">
        <h3>Meldingen</h3>
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-read">
          Alles markeren als gelezen
        </button>
      </div>

      <div class="notifications-list">
        <div v-if="notifications.length === 0" class="no-notifications">
          <span class="no-notifications-icon">📭</span>
          <p>Geen meldingen</p>
        </div>

        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
        >
          <div class="notification-main-content" @click="markAsRead(notification.id)">
            <div class="notification-icon">
              <span v-if="notification.type === 'verification_approved'">✅</span>
              <span v-else-if="notification.type === 'verification_rejected'">❌</span>
              <span v-else-if="notification.type === 'location_placement'">📍</span>
              <span v-else-if="notification.type === 'location_change'">🔄</span>
              <span v-else>📢</span>
            </div>
            
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
          <button @click.stop="deleteNotification(notification.id)" class="delete-notification-btn" title="Verwijder melding">
            &times;
          </button>
        </div>
      </div>

      <div v-if="notifications.length > 5" class="notifications-footer">
        <button @click="showAllNotifications" class="view-all-btn">
          Alle meldingen bekijken
        </button>
      </div>
    </div>

    <!-- Overlay to close dropdown -->
    <div v-if="showNotifications" class="notification-overlay" @click="closeNotifications"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { notificationService } from '../services/notificationService'

export default {
  name: 'NotificationCenter',
  props: {
    companyId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const notifications = ref([])
    const showNotifications = ref(false)
    let unsubscribe = null

    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
    }

    const closeNotifications = () => {
      showNotifications.value = false
    }

    const loadNotifications = () => {
      try {
        if (!props.companyId) {
          console.warn('No companyId provided to NotificationCenter')
          return
        }

        unsubscribe = notificationService.subscribeToCompanyNotifications(
          props.companyId,
          (newNotifications) => {
            notifications.value = newNotifications.slice(0, 10) // Show only latest 10
          }
        )
      } catch (error) {
        console.error('Error loading notifications:', error)
        unsubscribe = null
      }
    }

    const markAsRead = async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    const markAllAsRead = async () => {
      try {
        const unreadNotifications = notifications.value.filter(n => !n.read)
        await Promise.all(
          unreadNotifications.map(n => notificationService.markAsRead(n.id))
        )
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      try {
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))
        
        if (diffInMinutes < 1) return 'Nu'
        if (diffInMinutes < 60) return `${diffInMinutes}m geleden`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}u geleden`
        
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d geleden`
        
        return date.toLocaleDateString('nl-NL')
      } catch (error) {
        console.error('Error formatting time:', error)
        return ''
      }
    }

    const showAllNotifications = () => {
      // Navigate to full notifications page
      // This can be implemented later if needed
      console.log('Navigate to all notifications')
    }

    const deleteNotification = async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId)
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    }

    onMounted(() => {
      loadNotifications()
    })

    onUnmounted(() => {
      try {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      } catch (error) {
        console.error('Error during unsubscribe:', error)
      }
      unsubscribe = null
    })

    return {
      notifications,
      showNotifications,
      unreadCount,
      toggleNotifications,
      closeNotifications,
      markAsRead,
      markAllAsRead,
      formatTime,
      showAllNotifications,
      deleteNotification
    }
  }
}
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell:hover {
  background-color: #f0f0f0;
}

.bell-icon {
  font-size: 1.5rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 999;
  max-height: 500px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.notifications-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.mark-all-read {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read:hover {
  background: #e3f2fd;
}

.notifications-list {
  max-height: 350px;
  overflow-y: auto;
}

.no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-notifications-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f8ff;
}

.notification-item.unread:hover {
  background: #e3f2fd;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-time {
  font-size: 0.75rem;
  color: #999;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.notifications-footer {
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  text-align: center;
}

.view-all-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.view-all-btn:hover {
  background: #e3f2fd;
}

.notification-main-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
  cursor: pointer;
}

.delete-notification-btn {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.delete-notification-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-dropdown {
    width: 350px;
    right: -50px;
  }
}

@media (max-width: 480px) {
  .notifications-dropdown {
    width: 300px;
    right: -100px;
  }
}
</style>

