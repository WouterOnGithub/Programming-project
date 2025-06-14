// Mock data for students
export const students = [
  {
    id: 1,
    firstName: 'Emma',
    lastName: 'van der Berg',
    email: 'emma.vandenberg@email.com',
    phone: '+32 478 12 34 56',
    age: 21,
    studyYear: '3e jaar',
    domain: 'Informatica',
    opportunity: 'Stage',
    availableFrom: '2024-09-01',
    photo: null,
    skills: [
      { name: 'JavaScript', level: 'Expert' },
      { name: 'Vue.js', level: 'Expert' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'React', level: 'Intermediate' },
      { name: 'Node.js', level: 'Intermediate' }
    ],
    education: [
      {
        degree: 'Bachelor Informatica',
        school: 'Hogeschool Gent',
        startDate: '2021-09-01',
        endDate: '2024-06-30',
        status: 'In Progress'
      }
    ],
    experience: [
      {
        title: 'Frontend Developer Intern',
        company: 'Tech Solutions BV',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        description: 'Ontwikkeling van webapplicaties met Vue.js en implementatie van REST APIs'
      },
      {
        title: 'Student Developer',
        company: 'Digital Innovations',
        startDate: '2022-07-01',
        endDate: '2022-08-31',
        description: 'Assistent bij het ontwikkelen van mobiele applicaties'
      }
    ],
    languages: [
      { name: 'Nederlands', level: 'Native' },
      { name: 'Engels', level: 'Fluent' },
      { name: 'Frans', level: 'Intermediate' }
    ],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Ontwikkeling van een volledig functioneel e-commerce platform met Vue.js en Node.js',
        technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Express'],
        link: 'https://github.com/emma/ecommerce'
      },
      {
        name: 'Task Management App',
        description: 'Een real-time task management applicatie met drag-and-drop functionaliteit',
        technologies: ['React', 'Firebase', 'Material-UI'],
        link: 'https://github.com/emma/taskmanager'
      }
    ],
    linkedin: 'https://linkedin.com/in/emmavandenberg',
    github: 'https://github.com/emma',
    portfolio: 'https://emma-portfolio.be',
    interests: ['Web Development', 'UI/UX Design', 'Artificial Intelligence', 'Open Source'],
    preferredLocation: 'Gent',
    willingToRelocate: true,
    expectedSalary: '€1500-2000',
    availability: 'Full-time',
    notes: 'Zeer gemotiveerde student met sterke interesse in frontend development en moderne webtechnologieën.'
  },
  {
    id: 2,
    firstName: 'Lucas',
    lastName: 'Janssen',
    email: 'lucas.janssen@email.com',
    phone: '+32 478 23 45 67',
    age: 22,
    studyYear: 'Afgestudeerd',
    domain: 'Marketing',
    opportunity: 'Voltijdse job',
    availableFrom: '2024-07-01',
    photo: null,
    skills: [
      { name: 'Digital Marketing', level: 'Expert' },
      { name: 'SEO', level: 'Expert' },
      { name: 'Analytics', level: 'Expert' },
      { name: 'Social Media', level: 'Advanced' },
      { name: 'Content Strategy', level: 'Advanced' }
    ],
    education: [
      {
        degree: 'Master in Marketing',
        school: 'Universiteit Gent',
        startDate: '2019-09-01',
        endDate: '2023-06-30',
        status: 'Completed'
      }
    ],
    experience: [
      {
        title: 'Marketing Intern',
        company: 'Global Brands',
        startDate: '2023-01-01',
        endDate: '2023-06-30',
        description: 'Social media management en content creatie voor verschillende merken'
      }
    ],
    languages: [
      { name: 'Nederlands', level: 'Native' },
      { name: 'Engels', level: 'Fluent' },
      { name: 'Duits', level: 'Intermediate' }
    ],
    projects: [
      {
        name: 'Brand Awareness Campaign',
        description: 'Ontwikkeling en uitvoering van een succesvolle brand awareness campagne',
        technologies: ['Social Media', 'Content Marketing', 'Analytics'],
        link: 'https://portfolio.lucasjanssen.be/campaign'
      }
    ],
    linkedin: 'https://linkedin.com/in/lucasjanssen',
    github: 'https://github.com/lucas',
    portfolio: 'https://lucasjanssen.be',
    interests: ['Digital Marketing', 'Brand Strategy', 'Social Media', 'Data Analytics'],
    preferredLocation: 'Brussel',
    willingToRelocate: true,
    expectedSalary: '€2500-3000',
    availability: 'Full-time',
    notes: 'Creatieve marketeer met sterke analytische vaardigheden en ervaring in digitale marketing.'
  },
  {
    id: 3,
    firstName: 'Sophie',
    lastName: 'de Vries',
    email: 'sophie.devries@email.com',
    phone: '+32 478 34 56 78',
    age: 20,
    studyYear: '2e jaar',
    domain: 'Grafisch Ontwerp',
    opportunity: 'Studentenjob',
    availableFrom: '2024-06-15',
    photo: null,
    skills: [
      { name: 'Photoshop', level: 'Expert' },
      { name: 'Illustrator', level: 'Expert' },
      { name: 'UI/UX Design', level: 'Advanced' },
      { name: 'Figma', level: 'Advanced' },
      { name: 'Typography', level: 'Advanced' }
    ],
    education: [
      {
        degree: 'Bachelor Grafisch Ontwerp',
        school: 'KASK Gent',
        startDate: '2022-09-01',
        endDate: '2025-06-30',
        status: 'In Progress'
      }
    ],
    experience: [
      {
        title: 'Design Intern',
        company: 'Creative Studio',
        startDate: '2023-07-01',
        endDate: '2023-08-31',
        description: 'Assistent bij het ontwerpen van branding en marketing materialen'
      }
    ],
    languages: [
      { name: 'Nederlands', level: 'Native' },
      { name: 'Engels', level: 'Fluent' }
    ],
    projects: [
      {
        name: 'Brand Identity Design',
        description: 'Ontwikkeling van een complete brand identity voor een startup',
        technologies: ['Illustrator', 'Photoshop', 'Typography'],
        link: 'https://portfolio.sophiedevries.be/branding'
      }
    ],
    linkedin: 'https://linkedin.com/in/sophiedevries',
    github: 'https://github.com/sophie',
    portfolio: 'https://sophiedevries.be',
    interests: ['Branding', 'UI/UX Design', 'Typography', 'Digital Art'],
    preferredLocation: 'Gent',
    willingToRelocate: false,
    expectedSalary: '€1000-1500',
    availability: 'Part-time',
    notes: 'Creatieve ontwerper met oog voor detail en passie voor moderne design trends.'
  }
];

export const getStudentById = (id) => {
  return students.find(student => student.id === id);
};

export const getAllStudents = () => {
  return [...students];
}; 