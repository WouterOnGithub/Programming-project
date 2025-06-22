import { db } from '../firebase/config';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

class CompanyLocationService {
  constructor() {
    this.collectionRef = collection(db, 'companyLocations');
  }

  async saveLocation(locationId, data) {
    try {
      if (locationId) {
        // Update existing location
        const locationRef = doc(db, 'companyLocations', locationId);
        await updateDoc(locationRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        return { id: locationId, ...data };
      } else {
        // Create new location
        const docRef = await addDoc(this.collectionRef, {
          ...data,
          createdAt: serverTimestamp(),
        });
        return { id: docRef.id, ...data };
      }
    } catch (error) {
      console.error("Error saving company location:", error);
      throw error;
    }
  }

  async deleteLocation(locationId) {
    try {
      const locationRef = doc(db, 'companyLocations', locationId);
      await deleteDoc(locationRef);
    } catch (error) {
      console.error("Error deleting company location:", error);
      throw error;
    }
  }
}

export const companyLocationService = new CompanyLocationService(); 