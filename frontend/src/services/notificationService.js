// Notification service for handling company verification notifications

export class NotificationService {
  constructor() {
    this.listeners = new Map()
  }

  /**
   * Get Firebase services dynamically
   */
  async getFirebaseServices() {
    try {
      const { db } = await import('../firebase/config')
      const { 
        collection, 
        onSnapshot, 
        query, 
        where, 
        orderBy, 
        doc, 
        updateDoc,
        addDoc,
        serverTimestamp,
        deleteDoc
      } = await import('firebase/firestore')
      
      return { db, collection, onSnapshot, query, where, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc }
    } catch (error) {
      console.error('Error loading Firebase services:', error)
      throw error
    }
  }

  /**
   * Subscribe to notifications for a specific company
   */
  async subscribeToCompanyNotifications(companyId, callback) {
    try {
      if (!companyId) {
        console.warn('No companyId provided to subscribeToCompanyNotifications')
        return () => {} // Return empty unsubscribe function
      }

      const { db, collection, onSnapshot, query, where, orderBy } = await this.getFirebaseServices()
      
      const notificationsRef = query(
        collection(db, 'notifications'),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        try {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          callback(notifications)
        } catch (error) {
          console.error('Error processing notification snapshot:', error)
        }
      }, (error) => {
        console.error('Error in notification subscription:', error)
      })

      this.listeners.set(companyId, unsubscribe)
      return unsubscribe
    } catch (error) {
      console.error('Error setting up notification subscription:', error)
      return () => {} // Return empty unsubscribe function
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      if (!notificationId) {
        console.warn('No notificationId provided to markAsRead')
        return
      }

      const { db, doc, updateDoc } = await this.getFirebaseServices()
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
      if (!companyId || !companyName) {
        console.warn('Missing required parameters for createApprovalNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
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
      if (!companyId || !companyName) {
        console.warn('Missing required parameters for createRejectionNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
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
    try {
      this.listeners.forEach((unsubscribe, companyId) => {
        try {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe()
          }
        } catch (error) {
          console.error(`Error cleaning up listener for company ${companyId}:`, error)
        }
      })
      this.listeners.clear()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  // Nieuwe functie om een notificatie te verwijderen
  async deleteNotification(notificationId) {
    const { db, deleteDoc } = await this.getFirebaseServices()
    const notificationRef = doc(db, 'notifications', notificationId)
    await deleteDoc(notificationRef)
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