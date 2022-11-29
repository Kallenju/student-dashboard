/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

class Student {
  constructor({
    firstName,
    lastName,
    faculty,
    dateOfBirth,
    startDate,
    middleName = null,
  }) {
    const student = this;

    student.firstName = firstName;
    student.middleName = middleName || '';
    student.lastName = lastName;
    student.faculty = faculty;
    student.dateOfBirth = dateOfBirth;
    student.startDate = startDate;
  }

  get dateOfBirth() {
    const student = this;

    return student._dateOfBirth;
  }

  set dateOfBirth(value) {
    const student = this;

    student._dateOfBirth = new Date(value);
  }

  get startDate() {
    const student = this;

    return student._startDate;
  }

  set startDate(value) {
    const student = this;

    student._startDate = Number(value);
  }

  get fullName() {
    const student = this;

    return `${student.lastName} ${student.firstName} ${student.middleName}`.trim();
  }

  get formattedDate() {
    const student = this;

    const formatter = new Intl.DateTimeFormat('en-US');

    return formatter.format(student.dateOfBirth);
  }

  get age() {
    const student = this;

    const birth = student.dateOfBirth;
    const birthDate = birth.getDate();
    const birthMonth = birth.getMonth();
    const birthYear = birth.getFullYear();

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let age;

    if (todayDate >= birthDate && todayMonth >= birthMonth) {
      age = todayYear - birthYear;
    } else if (todayYear === birthYear) {
      age = 0;
    } else {
      age = todayYear - birthYear - 1;
    }

    return age;
  }

  get formattedDateWithAge() {
    const student = this;

    return `${student.formattedDate} (${student.age} years old)`;
  }

  get endDate() {
    const student = this;

    return student.startDate + 4;
  }

  get studyYear() {
    const student = this;

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let studyYear;

    if (
      todayYear > student.endDate ||
      (student.endDate === todayYear && todayMonth >= 8)
    ) {
      return 'graduated';
    }
    if (todayYear === student.startDate) {
      studyYear = 1;
    } else if (todayMonth >= 8) {
      studyYear = todayYear - student.startDate + 1;
    } else {
      studyYear = todayYear - student.startDate;
    }

    // eslint-disable-next-line default-case
    switch (studyYear) {
      case 1: {
        studyYear = `${studyYear}st`;
        break;
      }
      case 2: {
        studyYear = `${studyYear}nd`;
        break;
      }
      case 3: {
        studyYear = `${studyYear}rd`;
        break;
      }
      case 4: {
        studyYear = `${studyYear}th`;
        break;
      }
    }

    studyYear += ' year';

    return studyYear;
  }

  get yearsOfStudy() {
    const student = this;

    return `${student.startDate}\u2013${student.endDate} (${student.studyYear})`;
  }
}

export { Student };
