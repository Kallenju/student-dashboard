/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */

import { defaults } from './defaults.js';
import { Students } from './students/index.js';
import {
  ActionsOnData,
  search,
  filter,
  sort,
} from '../library.blocks/actionsOnData/index.js';
import { Form, Validate } from '../library.blocks/form/index.js';
import { Table } from '../library.blocks/table/index.js';

class StudentAccountsDashboard {
  constructor({ table, formForCreating, params }) {
    const accountsDashboard = this;

    accountsDashboard.params = defaults;

    const extendedParams = accountsDashboard.extendParams(params);

    accountsDashboard.students =
      extendedParams.students.whichStudents === 'current'
        ? {
            currentStudentsData: extendedParams.students.students,
          }
        : {
            formerStudentsData: extendedParams.students.students,
          };

    accountsDashboard.accounts = new Students(accountsDashboard.students);

    accountsDashboard.table = new Table(
      table,
      accountsDashboard.accounts.students,
      extendedParams.table
    );

    accountsDashboard.formForCreating = new Form(
      formForCreating,
      extendedParams.formForCreating
    );

    if (extendedParams.filterForm.form || extendedParams.searchForm.form) {
      accountsDashboard.actionsOnData = new ActionsOnData(
        extendedParams.actionsOnData
      );
    }

    if (extendedParams.filterForm.form) {
      accountsDashboard.filterForm = new Form(
        extendedParams.filterForm.form,
        extendedParams.filterForm
      );
    }

    if (extendedParams.searchForm.form) {
      accountsDashboard.searchForm = new Form(
        extendedParams.searchForm.form,
        extendedParams.searchForm
      );
    }

    accountsDashboard.checkParameters();
    accountsDashboard.setFormForCreating();
    accountsDashboard.setFilterForm();
    accountsDashboard.setSearchForm();
    accountsDashboard.setSort();
  }

  extendParams(params) {
    const accountsDashboard = this;

    Object.keys(accountsDashboard.params).forEach((object) => {
      if (
        Object.prototype.hasOwnProperty.call(accountsDashboard.params, object)
      ) {
        accountsDashboard.params[object] = {
          ...accountsDashboard.params[object],
          ...params[object],
        };
      } else {
        accountsDashboard.params[object] = params[object];
      }
    });

    return accountsDashboard.params;
  }

  getStudents() {
    const accountsDashboard = this;

    if (accountsDashboard.params.students.whichStudents !== 'current') {
      return accountsDashboard.accounts.expeledStudents;
    }

    return accountsDashboard.accounts.students;
  }

  handlerForStudentCreation() {
    const accountsDashboard = this;

    const { accounts, table, formForCreating, actionsOnData, params } =
      accountsDashboard;

    const formData = new FormData(formForCreating.form);
    const studentData = {};

    formData.forEach((elem) => {
      const [key, value] = elem;

      studentData[key] = value;
    });

    const newStudent = accounts.createStudent(studentData);

    if (
      Object.prototype.hasOwnProperty.call(accountsDashboard, 'actionsOnData')
    ) {
      if (params.students.whichStudents === 'current') {
        actionsOnData.addData(newStudent);
      }

      const dataToShow = actionsOnData.transformData({
        data: accountsDashboard.getStudents(),
        afterAddingNewItem: true,
      });

      table.render(dataToShow);
    } else {
      const dataToShow = accountsDashboard.getStudents();
      table.render(dataToShow);
    }
  }

  setFormForCreating() {
    const accountsDashboard = this;

    const { formForCreating, params } = accountsDashboard;

    if (params.formForCreating.validate) {
      formForCreating.use({ Validate });
      formForCreating.validate.onSuccess(
        accountsDashboard.handlerForStudentCreation.bind(accountsDashboard),
        'handlerForStudentCreation'
      );
    } else {
      formForCreating
        .addListener(
          'submit',
          formForCreating.form,
          (event) => event.preventDefault(),
          'preventDefault'
        )
        .addListener(
          'submit',
          formForCreating.form,
          accountsDashboard.handlerForStudentCreation.bind(accountsDashboard),
          'handlerForStudentCreation'
        );
    }
  }

  handlerForFilteringStudents() {
    const accountsDashboard = this;

    const { filterForm, table, actionsOnData } = accountsDashboard;

    const formData = new FormData(filterForm.form);

    const filterParams = {};

    formData.forEach((elem) => {
      const [key, value] = elem;

      filterParams[key] = value;
    });

    if (Object.values(filterParams).filter((elem) => elem).length > 0) {
      actionsOnData.enable('filter');
    } else {
      actionsOnData.disable('filter');
    }

    actionsOnData.setParametersOfAction('filter', filterParams);

    const dataToShow = actionsOnData.transformData({
      data: accountsDashboard.getStudents(),
    });

    table.render(dataToShow);
  }

  setFilterForm() {
    const accountsDashboard = this;

    if (
      !Object.prototype.hasOwnProperty.call(accountsDashboard, 'filterForm')
    ) {
      return;
    }

    const { filterForm, actionsOnData } = accountsDashboard;

    actionsOnData.use({ filter });

    filterForm.addListener(
      'submit',
      filterForm.form,
      (event) => event.preventDefault(),
      'preventDefault'
    );

    [...filterForm.form.elements].forEach((element) => {
      filterForm.setListenerOnField(
        element,
        accountsDashboard.handlerForFilteringStudents.bind(accountsDashboard)
      );
    });
  }

  handlerForStudentSearch() {
    const accountsDashboard = this;

    const { searchForm, table, actionsOnData } = accountsDashboard;

    const formData = new FormData(searchForm.form);

    const searchParams = {};

    formData.forEach((elem) => {
      const [key, value] = elem;

      searchParams[key] = value;
    });

    if (Object.values(searchParams).filter((elem) => elem).length > 0) {
      actionsOnData.enable('search');
    } else {
      actionsOnData.disable('search');
    }

    actionsOnData.setParametersOfAction('search', searchParams);

    const dataToShow = actionsOnData.transformData({
      data: accountsDashboard.getStudents(),
    });

    table.render(dataToShow);
  }

  setSearchForm() {
    const accountsDashboard = this;

    if (
      !Object.prototype.hasOwnProperty.call(accountsDashboard, 'searchForm')
    ) {
      return;
    }

    const { searchForm, actionsOnData } = accountsDashboard;

    actionsOnData.use({ search });

    searchForm.addListener(
      'submit',
      searchForm.form,
      (event) => event.preventDefault(),
      'preventDefault'
    );

    [...searchForm.form.elements].forEach((element) => {
      searchForm.setListenerOnField(
        element,
        accountsDashboard.handlerForStudentSearch.bind(accountsDashboard)
      );
    });
  }

  handlerForSortStudents(event) {
    const accountsDashboard = this;

    const { table, actionsOnData } = accountsDashboard;

    const currentElement = event.target;

    const { propertyToSort } = currentElement.dataset;
    let { orderBy } = currentElement.dataset;

    let params;

    if (typeof actionsOnData.actions.sort.params === 'undefined') {
      actionsOnData.setParametersOfAction('sort', { propertyToSort, orderBy });
      actionsOnData.enable('sort');
    } else {
      params = actionsOnData.actions.sort.params;
    }

    if (typeof params !== 'undefined') {
      if (params.propertyToSort === propertyToSort && orderBy === 'ascending') {
        currentElement.dataset.orderBy = 'descending';
        orderBy = currentElement.dataset.orderBy;
        actionsOnData.setParametersOfAction('sort', {
          propertyToSort,
          orderBy,
        });
      } else if (
        params.propertyToSort === propertyToSort &&
        orderBy === 'descending'
      ) {
        currentElement.dataset.orderBy = 'ascending';
        orderBy = currentElement.dataset.orderBy;
        actionsOnData.setParametersOfAction('sort', {
          propertyToSort,
          orderBy,
        });
      } else {
        actionsOnData.setParametersOfAction('sort', {
          propertyToSort,
          orderBy,
        });
      }
    }

    const dataToShow = actionsOnData.transformData({
      data: accountsDashboard.getStudents(),
    });

    table.render(dataToShow);
  }

  setSort() {
    const accountsDashboard = this;

    if (!accountsDashboard.params.sort.enabled) {
      return;
    }

    const { table, params, actionsOnData } = accountsDashboard;

    actionsOnData.use({ sort });

    Array.from(table.thead.children[0].children).forEach((th, index) => {
      const button = document.createElement('button');

      button.classList.add(...params.sort.defaultClasses);

      button.textContent = th.textContent;

      if (
        params.sort.custom &&
        Object.prototype.hasOwnProperty.call(
          params.sort.custom,
          'propertiesToSort'
        )
      ) {
        button.dataset.propertyToSort =
          params.sort.custom.propertiesToSort[index];
      } else {
        button.dataset.propertyToSort = th.dataset.renderedProperty;
      }

      button.dataset.orderBy = 'ascending';

      delete th.dataset.renderedProperty;
      th.innerHTML = '';

      th.append(button);
      table.attachAction({
        eventType: 'click',
        element: button,
        actionName: 'sort',
        func: accountsDashboard.handlerForSortStudents.bind(accountsDashboard),
      });
    });
  }

  checkParameters() {
    const accountsDashboard = this;

    const { params } = accountsDashboard;

    try {
      if (params.sort.custom) {
        if (
          Object.prototype.hasOwnProperty.call(
            params.sort.custom,
            'propertiesToSort'
          )
        ) {
          if (!Array.isArray(params.sort.custom.propertiesToSort)) {
            throw new Error(
              'Cвойства для сортировки должны быть представлены как массив!'
            );
          } else if (
            params.sort.custom.propertiesToSort.length !==
            params.table.renderedProperties.length
          ) {
            throw new Error(
              'Cвойства для сортировки должны быть такой же длины как количество отображаемых свойств'
            );
          }
        }
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

export { StudentAccountsDashboard };
