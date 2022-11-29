/* eslint-disable import/prefer-default-export */

const defaults = {
  table: {},

  formForCreating: {
    validate: true,
    custom: false,
  },

  students: {
    whichStudents: 'current',
    students: null,
  },

  filterForm: {
    form: null,
    custom: false,
  },

  searchForm: {
    form: null,
    custom: false,
  },

  sort: {
    enabled: false,
    defaultClasses: ['btn', 'w-100', 'fw-bold'],
    custom: false,
  },

  actionsOnData: {},
};

export { defaults };
