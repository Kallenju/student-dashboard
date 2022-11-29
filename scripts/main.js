/* eslint-disable import/extensions */
import { StudentAccountsDashboard } from './studentAccountsDashboard/index.js';

const students = [
  {
    firstName: 'Konstantin',
    middleName: 'Andreevich',
    lastName: 'Solovev',
    faculty: 'Geology and Geophysics',
    dateOfBirth: new Date(1997, 7, 20),
    startDate: 2015,
  },
  {
    firstName: 'Anastasia',
    middleName: 'Dmitrievna',
    lastName: 'Kalugina',
    faculty: 'Mechanics and Mathematics',
    dateOfBirth: new Date(1997, 8, 16),
    startDate: 2015,
  },
  {
    firstName: 'Olzhas',
    lastName: 'Suleimenov',
    faculty: 'Faculty of Physics',
    dateOfBirth: new Date(1995, 5, 17),
    startDate: 2013,
  },
  {
    firstName: 'Sofia',
    middleName: 'Dmitrievna',
    lastName: 'Kalugina',
    faculty: 'Agriculture',
    dateOfBirth: new Date(2002, 4, 31),
    startDate: 2021,
  },
  {
    firstName: 'Alexander',
    middleName: 'Andreevich',
    lastName: 'Solovyov',
    faculty: 'Physics',
    dateOfBirth: new Date(1992, 8, 19),
    startDate: 2010,
  },
  {
    firstName: 'Alexei',
    middleName: 'Andreevich',
    lastName: 'Tarasov',
    faculty: 'Natural Sciences',
    dateOfBirth: new Date(2001, 6, 17),
    startDate: 2018,
  },
  {
    firstName: 'Catherine',
    middleName: 'Andreevna',
    lastName: 'Ungur',
    faculty: 'Journalism',
    dateOfBirth: new Date(1987, 4, 17),
    startDate: 2007,
  },
  {
    firstName: 'Andrew',
    middleName: 'Evgenyevich',
    lastName: 'Solovyov',
    faculty: 'Physics',
    dateOfBirth: new Date(1965, 3, 19),
    startDate: 1983,
  },
  {
    firstName: 'Alexandra',
    middleName: 'Sergeevna',
    lastName: 'Novikova',
    faculty: 'Medicine',
    dateOfBirth: new Date(2001, 0, 31),
    startDate: 2020,
  },
];

const studentAccountsDashboard = new StudentAccountsDashboard({
  formForCreating: 'form[name="studentformForCreating"]',
  table: '#studentsInTable',
  params: {
    table: {
      ths: ['Student name', 'Faculty', 'Date of Birth', 'Years of study'],
      renderedProperties: [
        'fullName',
        'faculty',
        'formattedDateWithAge',
        'yearsOfStudy',
      ],
      indexRows: {
        isIndexed: true,
        attributeName: 'data-studentid',
        itemProperty: 'id',
      },
    },
    students: {
      whichStudents: 'current',
      students,
    },
    filterForm: {
      form: 'form[name="studentFilters"]',
    },
    searchForm: {
      form: 'form[name="studentSearchForm"]',
    },
    sort: {
      enabled: true,
      custom: {
        propertiesToSort: ['fullName', 'faculty', 'dateOfBirth', 'startDate'],
      },
    },
  },
});

{
  const filtersSwitches = document.querySelector(
    'div[data-name="filtersSwitches"]'
  );
  const { filterForm } = studentAccountsDashboard;
  const filterPlug = document.querySelector('span[data-name="filterPlug"]');
  let choosenFiltersCounter = 0;

  filtersSwitches.addEventListener('click', (event) => {
    const current = event.target;

    if (current.tagName !== 'INPUT') {
      return;
    }

    const correspondigFilter = filterForm.form[current.name];

    if (event.target.checked) {
      choosenFiltersCounter += 1;
      correspondigFilter.parentNode.classList.remove('visually-hidden');
    } else {
      choosenFiltersCounter -= 1;
      correspondigFilter.parentNode.classList.add('visually-hidden');
    }

    if (choosenFiltersCounter > 0) {
      filterPlug.classList.add('d-none');
    } else {
      filterPlug.classList.remove('d-none');
    }
  });
}

{
  const { validate } = studentAccountsDashboard.formForCreating;

  const ruleRequired = {
    value: 'required',
    errorMessage: 'The field is required',
  };

  const wordsValidateRules = [
    ruleRequired,
    {
      validator(elemValue) {
        return /^[a-zA-Z]+$/.test(elemValue) || !elemValue.trim();
      },
      errorMessage: 'Only latin letters',
    },
  ];

  const datesValidateRules = [
    ruleRequired,
    {
      validator(elemValue) {
        const date = new Date(elemValue);

        return date.getFullYear() > 1900 || !elemValue.trim();
      },
      errorMessage: 'Date cannot be earlier than January 1, 1900',
    },
    {
      validator(elemValue) {
        const date = new Date(elemValue);
        const nowDate = new Date();

        return (
          date.getTime() - nowDate.getTime() <= 0 ||
          (date.getFullYear() === nowDate.getFullYear() &&
            date.getMonth() === nowDate.getMonth() &&
            date.getDate() === nowDate.getDate()) ||
          !elemValue.trim()
        );
      },
      errorMessage: 'The date cannot be later than the present',
    },
  ];

  const startYearValidateRules = [
    ruleRequired,
    {
      validator(elemValue) {
        return /^\d+$/.test(elemValue) || !elemValue.trim();
      },
      errorMessage: 'Only numbers are allowed',
    },
    {
      validator(elemValue) {
        return elemValue >= 2000 || !elemValue.trim();
      },
      errorMessage: 'Year cannot be earlier than 2000',
    },
    {
      validator(elemValue) {
        const nowDate = new Date();

        return elemValue <= nowDate.getFullYear() || !elemValue.trim();
      },
      errorMessage: 'The year cannot be later than the present',
    },
  ];

  validate
    .addField('lastName', wordsValidateRules)
    .addField('firstName', wordsValidateRules)
    .addField('middleName', wordsValidateRules.slice(1))
    .addField('faculty', wordsValidateRules)
    .addField('dateOfBirth', datesValidateRules)
    .addField('startDate', startYearValidateRules);
}
