// Mock data voor grondplannen
export const mockGrondplannen = [
  {
    id: 1,
    name: 'Erasmus Hogeschool - Hoofdgebouw Gelijkvloers',
    imageUrl: '/images/grondplannen/erasmus-hoofdgebouw.png',
    thumbnailUrl: '/images/grondplannen/erasmus-hoofdgebouw.png',
    uploadDate: new Date('2024-01-15'),
    fileSize: '2.3 MB',
    description: 'Grondplan van de gelijkvloerse verdieping van het hoofdgebouw van Erasmus Hogeschool Brussel. Inclusief alle lokalen, kantoren, en gemeenschappelijke ruimtes.',
    floors: 'Gelijkvloers',
    building: 'Hoofdgebouw',
    lastUpdated: new Date('2024-01-15'),
    version: '1.0'
  },
  {
    id: 2,
    name: 'Erasmus Hogeschool - Hoofdgebouw Eerste Verdieping',
    imageUrl: '/images/grondplannen/erasmus-hoofdgebouw.png',
    thumbnailUrl: '/images/grondplannen/erasmus-hoofdgebouw.png',
    uploadDate: new Date('2024-01-10'),
    fileSize: '1.8 MB',
    description: 'Grondplan van de eerste verdieping van het hoofdgebouw. Bevat voornamelijk klaslokalen en studieruimtes.',
    floors: 'Eerste Verdieping',
    building: 'Hoofdgebouw',
    lastUpdated: new Date('2024-01-10'),
    version: '1.0'
  }
]

// Functie om mock data te laden
export function loadGrondplannen() {
  return new Promise((resolve) => {
    // Simuleer API call delay
    setTimeout(() => {
      resolve(mockGrondplannen)
    }, 500)
  })
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
    }
    
    mockGrondplannen.unshift(newGrondplan)
    
    setTimeout(() => {
      resolve(newGrondplan)
    }, 1000)
  })
}

// Functie om een grondplan te verwijderen
export function deleteGrondplan(id) {
  return new Promise((resolve) => {
    const index = mockGrondplannen.findIndex(g => g.id === id)
    if (index > -1) {
      mockGrondplannen.splice(index, 1)
    }
    
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
}

// Functie om een grondplan bij te werken
export function updateGrondplan(id, updates) {
  return new Promise((resolve) => {
    const index = mockGrondplannen.findIndex(g => g.id === id)
    if (index > -1) {
      mockGrondplannen[index] = {
        ...mockGrondplannen[index],
        ...updates,
        lastUpdated: new Date()
      }
      resolve(mockGrondplannen[index])
    } else {
      resolve(null)
    }
  }, 500)
}

// Functie om een specifiek grondplan op te halen
export function getGrondplan(id) {
  return new Promise((resolve) => {
    const grondplan = mockGrondplannen.find(g => g.id === parseInt(id))
    setTimeout(() => {
      resolve(grondplan || null)
    }, 300)
  })
}


