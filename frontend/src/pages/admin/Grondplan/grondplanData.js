// Verwijder mock data en gebruik een lege array
export const mockGrondplannen = [];
 
// Functie om mock data te laden
export function loadGrondplannen() {
  return new Promise((resolve) => {
    // Simuleer API call delay
    setTimeout(() => {
      resolve(mockGrondplannen);
    }, 500);
  });
}
 
// Functie om een grondplan toe te voegen
export function addGrondplan(grondplanData) {
  return new Promise((resolve) => {
    const newGrondplan = {
      id: Date.now(),
      ...grondplanData,
      uploadDate: new Date(),
      lastUpdated: new Date(),
      version: '1.0'
    };
   
    mockGrondplannen.unshift(newGrondplan);
   
    setTimeout(() => {
      resolve(newGrondplan);
    }, 1000);
  });
}
 
// Functie om een grondplan te verwijderen
export function deleteGrondplan(id) {
  return new Promise((resolve) => {
    const index = mockGrondplannen.findIndex(g => g.id === id);
    if (index > -1) {
      mockGrondplannen.splice(index, 1);
    }
   
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}
 
// Functie om een grondplan bij te werken
export function updateGrondplan(id, updates) {
  return new Promise((resolve) => {
    const index = mockGrondplannen.findIndex(g => g.id === id);
    if (index > -1) {
      mockGrondplannen[index] = {
        ...mockGrondplannen[index],
        ...updates,
        lastUpdated: new Date()
      };
      resolve(mockGrondplannen[index]);
    } else {
      resolve(null);
    }
  });
}
 
// Functie om een specifiek grondplan op te halen
export function getGrondplan(id) {
  return new Promise((resolve) => {
    const grondplan = mockGrondplannen.find(g => g.id === parseInt(id));
    setTimeout(() => {
      resolve(grondplan || null);
    }, 300);
  });
}