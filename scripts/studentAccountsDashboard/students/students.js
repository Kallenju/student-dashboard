/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */

import { Student } from '../student/index.js';

class Students {
  constructor({
    currentStudentsData = null,
    formerStudentsData = null,
    studentIdsData = null,
  } = {}) {
    const students = this;

    students.studentIdsData = studentIdsData;
    students.currentStudentsData = currentStudentsData;
    students.formerStudentsData = formerStudentsData;
    students.nextIdNumber = 0;
    students.studentIds = new Set();
    students.currentStudents = new Map();
    students.formerStudents = new Map();

    students.currentStudentsData.forEach((student) => {
      students.createStudent(student);
    });
  }

  get students() {
    const students = this;

    return Array.from(students.currentStudents.values());
  }

  get expeledStudents() {
    const students = this;

    return Array.from(students.formerStudents.values());
  }

  createStudent(studentData) {
    const students = this;

    const student = new Student(studentData);

    const id = students.nextIdNumber;

    student.id = id;
    students.studentIds.add(id);
    students.currentStudents.set(student.id, student);

    students.nextIdNumber += 1;

    return student;
  }

  expelStudent(studentId) {
    const students = this;

    try {
      if (!students.studentIds.has(studentId)) {
        throw new Error(`There is no student with this id: ${studentId}!`);
      }

      if (students.currentStudents.has(studentId)) {
        students.formerStudents.set(
          studentId,
          students.currentStudents.get(studentId)
        );
        students.currentStudents.delete(studentId);
      } else {
        throw new Error(
          `A student with this id (${studentId}) has already been expelled!`
        );
      }
    } catch (error) {
      if (error.name === 'Error') {
        // eslint-disable-next-line no-alert
        alert(`${error.name} ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  deleteStudent(studentId) {
    const students = this;

    try {
      if (!students.studentIds.has(studentId)) {
        throw new Error(`There is no student with this id: ${studentId}!`);
      }

      if (students.currentStudents.has(studentId)) {
        students.currentStudents.delete(studentId);
      } else {
        throw new Error(
          `The student with this id: ${studentId} has already been deleted!`
        );
      }
    } catch (error) {
      if (error.name === 'Error') {
        // eslint-disable-next-line no-alert
        alert(`${error.name} ${error.message}`);
      } else {
        throw error;
      }
    }
  }
}

export { Students };
