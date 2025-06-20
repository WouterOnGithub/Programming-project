// Notification service for handling company verification notifications
import { db } from '../firebase/config'
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore'

export class NotificationService {
  constructor() {
    this.listeners = new Map()
  }

  /**
   * Subscribe to notifications for a specific company
   */
  subscribeToCompanyNotifications(companyId, callback) {
    const notificationsRef = query(
      collection(db, 'notifications'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(notifications)
    })

    this.listeners.set(companyId, unsubscribe)
    return unsubscribe
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Create a verification approved notification
   */
  async createApprovalNotification(companyId, companyName) {
    try {
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'verification_approved',
        title: 'Verificatie Goedgekeurd',
        message: `Uw bedrijf "${companyName}" is succesvol geverifieerd. U heeft nu toegang tot alle functies van het platform.`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating approval notification:', error)
      throw error
    }
  }

  /**
   * Create a verification rejected notification
   */
  async createRejectionNotification(companyId, companyName, reason) {
    try {
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'verification_rejected',
        title: 'Verificatie Geweigerd',
        message: `Uw bedrijf "${companyName}" is geweigerd voor verificatie. Reden: ${reason}`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating rejection notification:', error)
      throw error
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}

// Export a singleton instance
export const notificationService = new NotificationService()

// Export constants
export const NOTIFICATION_TYPES = {
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected'
}

export const VERIFICATION_STATUS = {
  PENDING: 'wachtend op verificatie',
  APPROVED: 'goedgekeurd',
  REJECTED: 'geweigerd'
}