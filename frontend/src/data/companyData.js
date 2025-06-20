// Verwijder alle mock data en bijbehorende comments.

export const companies = [
  {
    id: 1,
    name: 'Tech Solutions BV',
    industry: 'IT & Software',
    size: '50-100',
    location: 'Gent',
    website: 'https://techsolutions.be',
    email: 'contact@techsolutions.be',
    phone: '+32 9 123 45 67',
    logo: null,
    description: 'Innovatieve IT-oplossingen voor bedrijven van alle groottes. Gespecialiseerd in web development, cloud services en digitale transformatie.',
    opportunities: [
      {
        type: 'Stage',
        title: 'Frontend Developer Intern',
        description: 'We zoeken een gemotiveerde stagiair voor frontend development met Vue.js en React.',
        requirements: [
          'Kennis van HTML, CSS en JavaScript',
          'Ervaring met Vue.js of React',
          'Goede communicatieve vaardigheden'
        ],
        startDate: '2024-09-01',
        duration: '3 maanden',
        compensation: '€1000 per maand'
      },
      {
        type: 'Voltijdse job',
        title: 'Senior Backend Developer',
        description: 'We zoeken een ervaren backend developer voor het ontwikkelen van schaalbare applicaties.',
        requirements: [
          '5+ jaar ervaring met Node.js',
          'Ervaring met microservices architectuur',
          'Kennis van cloud platforms (AWS/Azure)'
        ],
        startDate: '2024-07-01',
        compensation: '€4000-5000 per maand'
      }
    ],
    benefits: [
      'Flexibele werkuren',
      'Thuiswerk mogelijk',
      'Trainingsbudget',
      'Gezondheidsverzekering',
      'Fietsvergoeding'
    ],
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techsolutions',
      twitter: 'https://twitter.com/techsolutions',
      facebook: 'https://facebook.com/techsolutions'
    },
    contactPerson: {
      name: 'Jan De Vries',
      position: 'HR Manager',
      email: 'jan.devries@techsolutions.be',
      phone: '+32 9 123 45 68'
    }
  },
  {
    id: 2,
    name: 'Digital Marketing Agency',
    industry: 'Marketing & Communicatie',
    size: '20-50',
    location: 'Antwerpen',
    website: 'https://digitalmarketing.be',
    email: 'info@digitalmarketing.be',
    phone: '+32 3 456 78 90',
    logo: null,
    description: 'Full-service digital marketing agency gespecialiseerd in SEO, content marketing en social media management.',
    opportunities: [
      {
        type: 'Studentenjob',
        title: 'Social Media Assistant',
        description: 'Part-time functie voor het beheren van social media accounts voor verschillende klanten.',
        requirements: [
          'Ervaring met social media platforms',
          'Creatief schrijven',
          'Basis kennis van marketing'
        ],
        startDate: '2024-06-15',
        duration: 'Flexibel',
        compensation: '€15 per uur'
      }
    ],
    benefits: [
      'Dynamische werkomgeving',
      'Mogelijkheid tot doorgroei',
      'Netwerk events',
      'Kantoor in het centrum'
    ],
    socialMedia: {
      linkedin: 'https://linkedin.com/company/digitalmarketing',
      instagram: 'https://instagram.com/digitalmarketing',
      twitter: 'https://twitter.com/digitalmarketing'
    },
    contactPerson: {
      name: 'Lisa Janssens',
      position: 'Recruitment Specialist',
      email: 'lisa.janssens@digitalmarketing.be',
      phone: '+32 3 456 78 91'
    }
  },
  {
    id: 3,
    name: 'Creative Design Studio',
    industry: 'Design & Creatief',
    size: '10-20',
    location: 'Brussel',
    website: 'https://creativedesign.be',
    email: 'hello@creativedesign.be',
    phone: '+32 2 789 01 23',
    logo: null,
    description: 'Boutique design studio gespecialiseerd in branding, UI/UX design en digitale producten.',
    opportunities: [
      {
        type: 'Stage',
        title: 'UI/UX Design Intern',
        description: 'Stage voor het ontwikkelen van digitale interfaces en gebruikerservaringen.',
        requirements: [
          'Kennis van design tools (Figma, Adobe XD)',
          'Begrip van UI/UX principes',
          'Portfolio met relevante projecten'
        ],
        startDate: '2024-09-01',
        duration: '3-6 maanden',
        compensation: '€800 per maand'
      }
    ],
    benefits: [
      'Creatieve vrijheid',
      'Moderne werkomgeving',
      'Design events en workshops',
      'Flexibele uren'
    ],
    socialMedia: {
      linkedin: 'https://linkedin.com/company/creativedesign',
      behance: 'https://behance.net/creativedesign',
      instagram: 'https://instagram.com/creativedesign'
    },
    contactPerson: {
      name: 'Thomas Peeters',
      position: 'Creative Director',
      email: 'thomas.peeters@creativedesign.be',
      phone: '+32 2 789 01 24'
    }
  }
];

export const getCompanyById = (id) => {
  return companies.find(company => company.id === id);
};

export const getAllCompanies = () => {
  return [...companies];
}; 