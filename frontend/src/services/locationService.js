// Location service for managing location names in Firebase

export class LocationService {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Get Firebase services dynamically
   */
  async getFirebaseServices() {
    try {
      const { db } = await import('../firebase/config')
      const { 
        collection, 
        doc,
        getDoc,
        setDoc,
        updateDoc,
        arrayUnion,
        arrayRemove,
        onSnapshot
      } = await import('firebase/firestore')
      
      return { db, collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot }
    } catch (error) {
      console.error('Error loading Firebase services:', error)
      throw error
    }
  }

  /**
   * Get all location names for a specific grondplan
   */
  async getLocationNames(grondplanId) {
    try {
      if (!grondplanId) {
        console.warn('No grondplanId provided to getLocationNames')
        return []
      }

      const { db, doc, getDoc } = await this.getFirebaseServices()
      const locationDoc = await getDoc(doc(db, 'locationNames', grondplanId))
      
      if (locationDoc.exists()) {
        return locationDoc.data().names || []
      }
      
      return []
    } catch (error) {
      console.error('Error getting location names:', error)
      return []
    }
  }

  /**
   * Add a new location name to a grondplan
   */
  async addLocationName(grondplanId, locationName) {
    try {
      if (!grondplanId || !locationName) {
        console.warn('Missing required parameters for addLocationName')
        return false
      }

      const { db, doc, getDoc, setDoc, updateDoc, arrayUnion } = await this.getFirebaseServices()
      const locationDocRef = doc(db, 'locationNames', grondplanId)
      const locationDoc = await getDoc(locationDocRef)

      const trimmedName = locationName.trim()
      
      if (locationDoc.exists()) {
        const existingNames = locationDoc.data().names || []
        
        // Check if location name already exists (case insensitive)
        const nameExists = existingNames.some(name => 
          name.toLowerCase() === trimmedName.toLowerCase()
        )
        
        if (nameExists) {
          console.warn('Location name already exists:', trimmedName)
          return false
        }
        
        // Add new location name to existing array
        await updateDoc(locationDocRef, {
          names: arrayUnion(trimmedName)
        })
      } else {
        // Create new document with first location name
        await setDoc(locationDocRef, {
          names: [trimmedName],
          grondplanId: grondplanId,
          createdAt: new Date()
        })
      }

      // Update cache
      const currentNames = this.cache.get(grondplanId) || []
      this.cache.set(grondplanId, [...currentNames, trimmedName])
      
      return true
    } catch (error) {
      console.error('Error adding location name:', error)
      return false
    }
  }

  /**
   * Remove a location name from a grondplan
   */
  async removeLocationName(grondplanId, locationName) {
    try {
      if (!grondplanId || !locationName) {
        console.warn('Missing required parameters for removeLocationName')
        return false
      }

      const { db, doc, updateDoc, arrayRemove } = await this.getFirebaseServices()
      const locationDocRef = doc(db, 'locationNames', grondplanId)
      
      await updateDoc(locationDocRef, {
        names: arrayRemove(locationName.trim())
      })

      // Update cache
      const currentNames = this.cache.get(grondplanId) || []
      this.cache.set(grondplanId, currentNames.filter(name => name !== locationName.trim()))
      
      return true
    } catch (error) {
      console.error('Error removing location name:', error)
      return false
    }
  }

  /**
   * Subscribe to location names changes for a grondplan
   */
  async subscribeToLocationNames(grondplanId, callback) {
    try {
      if (!grondplanId) {
        console.warn('No grondplanId provided to subscribeToLocationNames')
        return () => {}
      }

      const { db, doc, onSnapshot } = await this.getFirebaseServices()
      const locationDocRef = doc(db, 'locationNames', grondplanId)

      const unsubscribe = onSnapshot(locationDocRef, (docSnapshot) => {
        try {
          const names = docSnapshot.exists() ? (docSnapshot.data().names || []) : []
          this.cache.set(grondplanId, names)
          callback(names)
        } catch (error) {
          console.error('Error processing location names snapshot:', error)
        }
      }, (error) => {
        console.error('Error in location names subscription:', error)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error setting up location names subscription:', error)
      return () => {}
    }
  }

  /**
   * Get cached location names (for performance)
   */
  getCachedLocationNames(grondplanId) {
    return this.cache.get(grondplanId) || []
  }

  /**
   * Clear cache for a specific grondplan
   */
  clearCache(grondplanId) {
    if (grondplanId) {
      this.cache.delete(grondplanId)
    } else {
      this.cache.clear()
    }
  }
}

// Export a singleton instance
export const locationService = new LocationService()

