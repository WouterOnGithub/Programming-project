// Verwijder alle mock data en bijbehorende comments.

export const getStudentById = (id) => {
  return students.find(student => student.id === id);
};

export const getAllStudents = () => {
  return [...students];
}; 