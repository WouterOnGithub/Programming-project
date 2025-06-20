// Mock data for students
export const students = [
  {
    voornaam: 'Emma',
    achternaam: 'van der Berg',
    authUid: 'uid-emma',
    beschikbaarVanaf: '2024-09-01',
    domein: ['Informatica'],
    intro: 'Ik ben Emma, een enthousiaste student informatica.',
    leeftijd: 21,
    linkedin: 'https://linkedin.com/in/emmavandenberg',
    opportuniteit: 'Stage',
    skills: ['JavaScript', 'Vue.js', 'Python', 'React', 'Node.js'],
    studiejaar: '3e jaar',
    talenkennis: ['Nederlands', 'Engels', 'Frans'],
    toestemming: true
  },
  {
    voornaam: 'Lucas',
    achternaam: 'Janssen',
    authUid: 'uid-lucas',
    beschikbaarVanaf: '2024-07-01',
    domein: ['Marketing'],
    intro: 'Creatieve marketeer met passie voor digitale strategieën.',
    leeftijd: 22,
    linkedin: 'https://linkedin.com/in/lucasjanssen',
    opportuniteit: 'Voltijdse job',
    skills: ['Digital Marketing', 'SEO', 'Analytics', 'Social Media', 'Content Strategy'],
    studiejaar: 'Afgestudeerd',
    talenkennis: ['Nederlands', 'Engels', 'Duits'],
    toestemming: true
  },
  {
    voornaam: 'Sophie',
    achternaam: 'de Vries',
    authUid: 'uid-sophie',
    beschikbaarVanaf: '2024-06-15',
    domein: ['Grafisch Ontwerp'],
    intro: 'Gedreven grafisch ontwerper met oog voor detail.',
    leeftijd: 20,
    linkedin: 'https://linkedin.com/in/sophiedevries',
    opportuniteit: 'Studentenjob',
    skills: ['Photoshop', 'Illustrator', 'UI/UX Design', 'Figma', 'Typography'],
    studiejaar: '2e jaar',
    talenkennis: ['Nederlands', 'Engels'],
    toestemming: false
  }
];

export const getStudentById = (id) => {
  return students.find(student => student.id === id);
};

export const getAllStudents = () => {
  return [...students];
}; 