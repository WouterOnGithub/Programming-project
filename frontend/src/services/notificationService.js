// Notification service for handling company verification notifications

import { doc } from 'firebase/firestore'

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

      const { db, collection, onSnapshot, query, where } = await this.getFirebaseServices()
      
      const notificationsRef = query(
        collection(db, 'notifications'),
        where('companyId', '==', companyId)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        try {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Sort notifications client-side for now
          notifications.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          })
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
   * Subscribe to notifications for a specific student
   */
  async subscribeToStudentNotifications(studentId, callback) {
    try {
      if (!studentId) {
        console.warn('No studentId provided to subscribeToStudentNotifications')
        return () => {} // Return empty unsubscribe function
      }

      const { db, collection, onSnapshot, query, where } = await this.getFirebaseServices()
      
      const notificationsRef = query(
        collection(db, 'notifications'),
        where('studentId', '==', studentId)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        try {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Sort notifications client-side for now
          notifications.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          })
          callback(notifications)
        } catch (error) {
          console.error('Error processing notification snapshot:', error)
        }
      }, (error) => {
        console.error('Error in notification subscription:', error)
      })

      this.listeners.set(studentId, unsubscribe)
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
   * Create a student match accepted notification
   */
  async createStudentMatchAcceptedNotification(studentId, companyName) {
    try {
      if (!studentId || !companyName) {
        console.warn('Missing required parameters for createStudentMatchAcceptedNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        studentId,
        type: 'match_accepted',
        title: 'Match Geaccepteerd! 🎉',
        message: `Het bedrijf "${companyName}" heeft uw profiel geaccepteerd! U kunt nu een gesprek inplannen.`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating student match accepted notification:', error)
      throw error
    }
  }

  /**
   * Create a student match rejected notification
   */
  async createStudentMatchRejectedNotification(studentId, companyName) {
    try {
      if (!studentId || !companyName) {
        console.warn('Missing required parameters for createStudentMatchRejectedNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        studentId,
        type: 'match_rejected',
        title: 'Match Afgewezen',
        message: `Het bedrijf "${companyName}" heeft uw profiel afgewezen. Geen zorgen, er zijn nog veel andere kansen!`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating student match rejected notification:', error)
      throw error
    }
  }

  /**
   * Create a company new match notification
   */
  async createCompanyNewMatchNotification(companyId, studentName) {
    try {
      if (!companyId || !studentName) {
        console.warn('Missing required parameters for createCompanyNewMatchNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'new_match',
        title: 'Nieuwe Match! 👋',
        message: `Student "${studentName}" heeft interesse getoond in uw bedrijf. Bekijk het profiel en beslis of u een gesprek wilt.`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating company new match notification:', error)
      throw error
    }
  }

  /**
   * Create an appointment cancellation notification for student
   */
  async createStudentAppointmentCancelledNotification(studentId, companyName, reason) {
    try {
      if (!studentId || !companyName) {
        console.warn('Missing required parameters for createStudentAppointmentCancelledNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        studentId,
        type: 'appointment_cancelled',
        title: 'Afspraak Geannuleerd',
        message: `Uw afspraak met "${companyName}" is geannuleerd. Reden: ${reason}`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating student appointment cancelled notification:', error)
      throw error
    }
  }

  /**
   * Create an appointment cancellation notification for company
   */
  async createCompanyAppointmentCancelledNotification(companyId, studentName, reason) {
    try {
      if (!companyId || !studentName) {
        console.warn('Missing required parameters for createCompanyAppointmentCancelledNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'appointment_cancelled',
        title: 'Afspraak Geannuleerd',
        message: `De afspraak met student "${studentName}" is geannuleerd. Reden: ${reason}`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating company appointment cancelled notification:', error)
      throw error
    }
  }

  /**
   * Create an appointment scheduled notification for student
   */
  async createStudentAppointmentScheduledNotification(studentId, companyName, time) {
    try {
      if (!studentId || !companyName) {
        console.warn('Missing required parameters for createStudentAppointmentScheduledNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        studentId,
        type: 'appointment_scheduled',
        title: 'Afspraak Ingepland! 📅',
        message: `Uw afspraak met "${companyName}" is ingepland voor ${time}.`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating student appointment scheduled notification:', error)
      throw error
    }
  }

  /**
   * Create an appointment scheduled notification for company
   */
  async createCompanyAppointmentScheduledNotification(companyId, studentName, time) {
    try {
      if (!companyId || !studentName) {
        console.warn('Missing required parameters for createCompanyAppointmentScheduledNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'appointment_scheduled',
        title: 'Nieuwe Afspraak Ingepland! 📅',
        message: `Een afspraak met student "${studentName}" is ingepland voor ${time}.`,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating company appointment scheduled notification:', error)
      throw error
    }
  }

  /**
   * Create a notification for a student when a company's location is set/updated.
   */
  async createStudentAppointmentLocationSetNotification(studentId, companyName, locationName, floorName) {
    try {
      if (!studentId || !companyName || !locationName || !floorName) {
        console.warn('Missing required parameters for createStudentAppointmentLocationSetNotification');
        return;
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices();
      await addDoc(collection(db, 'notifications'), {
        studentId,
        type: 'location_set',
        title: 'Locatie van je afspraak is bekend!',
        message: `De locatie voor je afspraak met "${companyName}" is nu bekend: ${locationName} (op ${floorName}).`,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating student location set notification:', error);
      throw error;
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

  /**
   * Create a location placement notification
   */
  async createLocationPlacementNotification(companyId, companyName, locationName, grondplanName) {
    try {
      if (!companyId || !companyName || !locationName) {
        console.warn('Missing required parameters for createLocationPlacementNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'location_placement',
        title: 'Locatie Toegewezen',
        message: `Uw bedrijf "${companyName}" is geplaatst op locatie "${locationName}"${grondplanName ? ` in ${grondplanName}` : ''}.`,
        locationName,
        grondplanName: grondplanName || '',
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating location placement notification:', error)
      throw error
    }
  }

  /**
   * Create a location change notification
   */
  async createLocationChangeNotification(companyId, companyName, oldLocationName, newLocationName, grondplanName) {
    try {
      if (!companyId || !companyName || !newLocationName) {
        console.warn('Missing required parameters for createLocationChangeNotification')
        return
      }

      const { db, collection, addDoc, serverTimestamp } = await this.getFirebaseServices()
      const message = oldLocationName 
        ? `Uw bedrijf "${companyName}" is verplaatst van "${oldLocationName}" naar "${newLocationName}"${grondplanName ? ` in ${grondplanName}` : ''}.`
        : `Uw bedrijf "${companyName}" is verplaatst naar locatie "${newLocationName}"${grondplanName ? ` in ${grondplanName}` : ''}.`

      await addDoc(collection(db, 'notifications'), {
        companyId,
        type: 'location_change',
        title: 'Locatie Gewijzigd',
        message,
        oldLocationName: oldLocationName || '',
        newLocationName,
        grondplanName: grondplanName || '',
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating location change notification:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService()

// Export constants
export const NOTIFICATION_TYPES = {
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  LOCATION_PLACEMENT: 'location_placement',
  LOCATION_CHANGE: 'location_change',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  NEW_MATCH: 'new_match',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled'
}

export const VERIFICATION_STATUS = {
  PENDING: 'wachtend op verificatie',
  APPROVED: 'goedgekeurd',
  REJECTED: 'geweigerd'
}