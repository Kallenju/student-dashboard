/* eslint-disable import/extensions */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import { defaults } from './defaults.js';

class Table {
  constructor(element, initialData = [], params = {}) {
    const table = this;

    table.table =
      typeof element === 'object' ? element : document.querySelector(element);
    table.params = { ...defaults, ...params };
    table.initialData = initialData;

    table.checkParameters();
    table.setTable();
    table.createMainParts();
    table.createHeadingsOnload();
    table.render(table.initialData);
  }

  setTable() {
    const table = this;

    table.table.innerHTML = '';
    table.table.classList.add(...table.params.defaultsClasses.tableClasses);

    table.table.addEventListener('click', table.onClick.bind(table));
  }

  createMainParts() {
    const table = this;

    table.thead = document.createElement('thead');
    table.tbody = document.createElement('tbody');
    if (table.params.hasTfoot) {
      table.tfoot = document.createElement('tfoot');
    }

    table.thead.classList.add(...table.params.defaultsClasses.theadClasses);
    table.tbody.classList.add(...table.params.defaultsClasses.tbodyClasses);
    if (table.params.hasTfoot) {
      table.tfoot.classList.add(...table.params.defaultsClasses.tfootClasses);
    }

    table.table.append(table.thead, table.tbody);
    if (table.params.hasTfoot) {
      table.table.append(table.tfoot);
    }
  }

  createHeadingRow() {
    const table = this;

    const tr = document.createElement('tr');

    tr.classList.add(...table.params.defaultsClasses.theadTrClasses);

    return tr;
  }

  createHeading(
    textContent,
    attributes = [{ attributeName: null, attributeValue: null }]
  ) {
    const table = this;

    const th = document.createElement('th');

    th.setAttribute('scope', 'col');

    th.classList.add(...table.params.defaultsClasses.thClasses);

    if (Array.isArray(attributes)) {
      attributes.forEach((attribute) => {
        if (attribute.attributeName) {
          th.setAttribute(attribute.attributeName, attribute.attributeValue);
        }
      });
    }

    th.textContent = textContent;

    if (Object.prototype.hasOwnProperty.call(table, 'afterCreatingHeading')) {
      table.afterCreatingHeading.forEach((func) => {
        func(th);
      });
    }

    return th;
  }

  createHeadingsOnload() {
    const table = this;

    const tr = table.createHeadingRow();
    // eslint-disable-next-line no-plusplus
    for (let i = 0, j = table.params.ths.length; i < j; ++i) {
      const th = table.createHeading(table.params.ths[i], [
        {
          attributeName: 'data-rendered-property',
          attributeValue: table.params.renderedProperties[i],
        },
      ]);
      tr.append(th);
    }
    table.thead.append(tr);
  }

  createBodyRow(item) {
    const table = this;

    const tr = document.createElement('tr');

    tr.classList.add(...table.params.defaultsClasses.bodyTrClasses);

    if (table.params.indexRows.isIndexed) {
      const indexParams = table.params.indexRows;
      tr.setAttribute(
        indexParams.attributeName,
        item[indexParams.itemProperty]
      );
    }

    return tr;
  }

  createBodyTd(
    textContent,
    attributes = [{ attributeName: null, attributeValue: null }]
  ) {
    const table = this;

    const td = document.createElement('td');

    td.classList.add(...table.params.defaultsClasses.tdClasses);

    if (Array.isArray(attributes)) {
      attributes.forEach((attribute) => {
        if (attribute.attributeName) {
          td.setAttribute(attribute.attributeName, attribute.attributeValue);
        }
      });
    }

    td.textContent = textContent;

    if (Object.prototype.hasOwnProperty.call(table, 'afterCreatingBodyTd')) {
      table.afterCreatingBodyTd.forEach((func) => {
        func(td);
      });
    }

    return td;
  }

  render(dataToShow) {
    const table = this;

    table.tbody.innerHTML = '';

    table.dataToShow = dataToShow;

    if (Object.prototype.hasOwnProperty.call(table, 'beforeRedendering')) {
      table.beforeRedendering.forEach((func) => {
        table.dataToShow = func(table.dataToShow);
      });
    }

    table.dataToShow.forEach((item) => {
      const tr = table.createBodyRow(item);

      table.params.renderedProperties.forEach((renderedProperty) => {
        const td = table.createBodyTd(item[renderedProperty], [
          {
            attributeName: 'data-rendered-property',
            attributeValue: renderedProperty,
          },
        ]);

        tr.append(td);
      });

      table.tbody.append(tr);
    });
  }

  afterCreatingHeading(callback) {
    const table = this;

    if (!Object.prototype.hasOwnProperty.call(table, 'afterCreatingHeading')) {
      table.afterCreatingHeading = [];
    }

    table.afterCreatingHeading.push(callback);

    return table;
  }

  afterCreatingBodyTd(callback) {
    const table = this;

    if (!Object.prototype.hasOwnProperty.call(table, 'afterCreatingBodyTd')) {
      table.afterCreatingBodyTd = [];
    }

    table.afterCreatingBodyTd.push(callback);

    return table;
  }

  beforeRedendering(callback) {
    const table = this;

    if (!Object.prototype.hasOwnProperty.call(table, 'beforeRedendering')) {
      table.beforeRedendering = [];
    }

    table.beforeRedendering.push(callback);

    return table;
  }

  getElement(element) {
    return typeof element === 'object'
      ? element
      : document.querySelector(element);
  }

  onClick(event) {
    const table = this;
    const { eventType } = event.target.dataset;
    const { action } = event.target.dataset;
    if (
      eventType === 'click' &&
      Object.prototype.hasOwnProperty.call(table.actions, action)
    ) {
      table.actions[action](event);
    }
  }

  attachAction({ eventType, element, actionName, func }) {
    const table = this;

    if (!Object.prototype.hasOwnProperty.call(table, 'actions')) {
      table.actions = {};
    }

    element.setAttribute('data-event-type', eventType);
    element.setAttribute('data-action', actionName);

    if (!Object.prototype.hasOwnProperty.call(table.actions, actionName)) {
      table.actions[actionName] = func;
    }

    return table;
  }

  use(modules) {
    const table = this;

    Object.keys(modules).forEach((key) => {
      const tableKey = key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(table.params, key)) {
        table[tableKey] = new modules[key](table, table.params[key]);
      } else {
        table[tableKey] = new modules[key](table);
      }
    });
  }

  checkParameters() {
    const table = this;

    try {
      if (
        !Array.isArray(table.params.ths) ||
        !Array.isArray(table.params.renderedProperties)
      ) {
        throw new Error(
          'Заголовки и отображаемые свойства должны быть представлены как массивы!'
        );
      }

      if (table.params.ths.length !== table.params.renderedProperties.length) {
        throw new Error(
          'Количество заголовков и отображаемых свойств не равно!'
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

export { Table };
