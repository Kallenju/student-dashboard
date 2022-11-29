/* eslint-disable import/extensions */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { defaults } from './defaults.js';
import { extendParams } from '../../../commonFunctions/index.js';

class Validate {
  constructor(formObject, params = {}) {
    const validate = this;

    const extendedParams = extendParams(defaults, params);

    validate.extendedParams = extendedParams;

    validate.formObject = formObject;
    validate.form = formObject.form;
    validate.formElements = validate.form.elements;
    validate.isSubmitted = false;
    validate.fields = {};
    validate.extendedParams = { ...defaults, ...extendedParams };
    validate.callbacks = new Map();

    validate.setForm();
  }

  normalizeEventName(name) {
    return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
  }

  isElementInDom(element) {
    if (typeof element === 'undefined') {
      return false;
    }
    return element.parentNode;
  }

  getFieldObject(singleFormElement) {
    const validate = this;

    return typeof singleFormElement === 'object'
      ? singleFormElement
      : validate.fields[singleFormElement];
  }

  addField(fieldName, rules, config = {}) {
    const validate = this;

    const elem = validate.formElements[fieldName];

    validate.fields[fieldName] = {
      elem,
      rules,
      isValid: false,
      config,
    };

    if (validate.extendedParams.validationOnChange) {
      validate.formObject.setListenerOnField(
        elem,
        validate.validationOnFieldChange.bind(validate),
        'validationOnFieldChange'
      );
    }

    if (validate.extendedParams.validationOnBlur) {
      validate.formObject.addListener(
        'blur',
        elem,
        validate.validationOnFieldBlur.bind(validate),
        'validationOnFieldBlur'
      );
    }

    return validate;
  }

  removeField(singleFormElement) {
    const validate = this;

    const field = validate.getFieldObject(singleFormElement);

    const type = validate.formObject.getListenerType(field.elem.type);

    validate.eventHandlers.array.forEach((eventHandler) => {
      validate.formObject.removeListener(type, field.elem, eventHandler);
    });

    validate.deleteErrors(field);
    delete validate.fields.field;

    return validate;
  }

  setForm() {
    const validate = this;

    validate.form.setAttribute('novalidate', 'novalidate');

    validate.formObject.addListener(
      'submit',
      validate.form,
      (event) => event.preventDefault(),
      'preventDefault'
    );
    validate.formObject.addListener(
      'submit',
      validate.form,
      validate.validationOnSubmit.bind(validate),
      'validationOnSubmit'
    );
  }

  validationOnSubmit(event) {
    const validate = this;

    event.preventDefault();
    validate.isSubmitted = true;
    validate.validateOnSubmit();
  }

  validateOnSubmit() {
    const validate = this;

    if (validate.isSubmitted) {
      Object.keys(validate.fields).forEach((fieldName) => {
        validate.validateField(fieldName);
      });

      if (validate.isFormValid()) {
        if (validate.callbacks.has('onSuccessSubmit')) {
          validate.callbacks.get('onSuccessSubmit')();
        }
        validate.refresh();
      } else {
        if (validate.extendedParams.errorMessages.on) {
          validate.renderErrors();
          validate.showErrors();
        }

        if (validate.callbacks.has('onFailSubmit')) {
          validate.callbacks.get('onFailSubmit')();
        }
      }
    }
  }

  validateField(fieldName) {
    const validate = this;

    const field = validate.fields[fieldName];
    field.isValid = true;

    // eslint-disable-next-line no-restricted-syntax
    for (const rule of field.rules) {
      validate.validateFieldRule(field, rule);
      if (!field.isValid) {
        if (validate.extendedParams.errorMessages.on) {
          field.errorMessage = rule.errorMessage;
        }
        break;
      }
    }
  }

  validateFieldRule(field, fieldRule) {
    const validate = this;

    const elemValue = validate.formObject.getElemValue(field.elem);

    if (fieldRule.value === 'required') {
      if (validate.formObject.isEmpty(elemValue)) {
        field.isValid = false;
      }
    } else if (!fieldRule.validator(elemValue)) {
      field.isValid = false;
    }
  }

  isFormValid() {
    const validate = this;

    let valid = true;

    // eslint-disable-next-line no-restricted-syntax
    for (const field of Object.values(validate.fields)) {
      if (!field.isValid) {
        valid = false;
        break;
      }
    }

    return valid;
  }

  isFieldValid(element) {
    const validate = this;

    const field =
      typeof element === 'object' ? element : validate.fields[element];

    if (validate.extendedParams.errorMessages.on) {
      return (
        field.isValid &&
        Object.prototype.hasOwnProperty.call(field, 'errorMessage')
      );
    }

    return field.isValid;
  }

  clearFields() {
    const validate = this;

    Object.values(validate.fields).forEach((field) => {
      field.elem.value = '';
    });
  }

  refresh() {
    const validate = this;

    validate.isSubmitted = false;

    validate.clearFields();

    if (validate.extendedParams.errorMessages.on) {
      validate.renderErrors();
      validate.deleteWrapperForMessages();
    }
  }

  validationOnFieldChange(event) {
    const validate = this;

    if (!event.target) {
      return;
    }

    if (
      (validate.extendedParams.validateAfterSubmition &&
        validate.isSubmitted) ||
      !validate.extendedParams.validateAfterSubmition
    ) {
      validate.validateOnFieldChange(event.target);
    }
  }

  validateOnFieldChange(target) {
    const validate = this;

    let currentFieldName;
    // eslint-disable-next-line no-restricted-syntax
    for (const fieldName of Object.keys(validate.fields)) {
      const field = validate.fields[fieldName];
      if (field.elem === target) {
        currentFieldName = fieldName;
        break;
      }
    }

    if (!currentFieldName) {
      return;
    }

    validate.validateField(currentFieldName);
    if (validate.extendedParams.errorMessages.on) {
      validate.renderErrors(currentFieldName);
      validate.showErrors(currentFieldName);
    }

    if (validate.isFieldValid(currentFieldName)) {
      if (validate.callbacks.has('onSuccessChange')) {
        validate.callbacks.get('onSuccessChange')();
      }
    } else if (validate.callbacks.has('onFailChange')) {
      validate.callbacks.get('onFailChange')();
    }
  }

  validationOnFieldBlur(event) {
    const validate = this;

    if (!event.target) {
      return;
    }

    if (
      (validate.extendedParams.validateAfterSubmition &&
        validate.isSubmitted) ||
      !validate.extendedParams.validateAfterSubmition
    ) {
      validate.validateOnFieldBlur(event.target);
    }
  }

  validateOnFieldBlur(target) {
    const validate = this;

    let currentFieldName;
    // eslint-disable-next-line no-restricted-syntax
    for (const fieldName of Object.keys(validate.fields)) {
      const field = validate.fields[fieldName];
      if (field.elem === target) {
        currentFieldName = fieldName;
        break;
      }
    }

    if (!currentFieldName) {
      return;
    }

    validate.validateField(currentFieldName);
    if (validate.extendedParams.errorMessages.on) {
      validate.renderErrors(currentFieldName);
      validate.showErrors(currentFieldName);
    }

    if (validate.isFieldValid(currentFieldName)) {
      if (validate.callbacks.has('onSuccessBlur')) {
        validate.callbacks.get('onSuccessBlur')();
      }
    } else if (validate.callbacks.has('onFailBlur')) {
      validate.callbacks.get('onFailBlur')();
    }
  }

  renderErrors(singleField = null) {
    const validate = this;

    const currentField = validate.getFieldObject(singleField);

    if (!singleField) {
      Object.values(validate.fields).forEach((field) => {
        if (!field.isValid) {
          const containerForError = validate.getContainerForErrorText(field);
          const { errorMessage } = field;
          containerForError.textContent = errorMessage;
        } else {
          validate.deleteErrors(field);
        }
      });
    } else if (!currentField.isValid) {
      const errorsContainer = validate.getContainerForErrorText(currentField);
      const { errorMessage } = currentField;
      errorsContainer.textContent = errorMessage;
    } else if (currentField.isValid) {
      validate.deleteErrors(currentField);
    }
  }

  getWrapperForMessages() {
    const validate = this;

    if (Object.prototype.hasOwnProperty.call(validate, 'messagesWrapper')) {
      return;
    }

    validate.messagesWrapper = document.createElement('div');
    validate.messagesWrapper.classList.add(
      ...validate.extendedParams.defaultsClasses.messagesWrapperClass
    );

    if (validate.form.querySelector('button')) {
      const element =
        validate.form.querySelectorAll('button')[
          validate.form.querySelectorAll('button').length - 1
        ];
      element.before(validate.messagesWrapper);
    } else {
      validate.form.append(validate.messagesWrapper);
    }
  }

  deleteWrapperForMessages() {
    const validate = this;

    if (validate.isElementInDom(validate.messagesWrapper)) {
      validate.messagesWrapper.parentNode.removeChild(validate.messagesWrapper);
    }

    if (Object.prototype.hasOwnProperty.call(validate, 'messagesWrapper')) {
      delete validate.messagesWrapper;
    }
  }

  getContainerForErrorText(singleFormElement) {
    const validate = this;

    const field = validate.getFieldObject(singleFormElement);

    if (
      !Object.prototype.hasOwnProperty.call(field.config, 'errorsContainer')
    ) {
      field.config.errorsContainer = document.createElement('div');

      const { errorsContainer } = field.config;

      const { defaultsClasses } = validate.extendedParams;
      errorsContainer.classList.add(...defaultsClasses.messageClass);
      errorsContainer.classList.add(...defaultsClasses.errorClass);
    } else {
      const { errorsContainer } = field.config;
      field.config.errorsContainer =
        typeof errorsContainer === 'object'
          ? errorsContainer
          : validate.form.querySelector(errorsContainer);
    }

    return field.config.errorsContainer;
  }

  showErrors(singleFormElement = null) {
    const validate = this;

    const singleField = validate.getFieldObject(singleFormElement);

    function showMessagesTogether(field) {
      if (!field.isValid) {
        const { errorsContainer } = field.config;
        validate.messagesWrapper.append(errorsContainer);
      }
    }

    function showMessagesIndividually(field) {
      if (!field.isValid) {
        const { errorsContainer } = field.config;
        field.elem.after(errorsContainer);
      }
    }

    if (validate.extendedParams.errorMessages.allMessagesTogether) {
      validate.getWrapperForMessages();

      if (!singleFormElement) {
        Object.values(validate.fields).forEach((field) => {
          showMessagesTogether(field);
        });
      } else if (!validate.isElementInDom(singleField.config.errorsContainer)) {
        showMessagesTogether(singleField);
        if (validate.isFormValid()) {
          validate.deleteWrapperForMessages();
        }
      }
    } else if (!singleFormElement) {
      Object.values(validate.fields).forEach((field) => {
        showMessagesIndividually(field);
      });
    } else if (!validate.isElementInDom(singleField.config.errorsContainer)) {
      showMessagesIndividually(singleField);
    }
  }

  deleteErrors(singleFormElement) {
    const validate = this;

    const field = validate.getFieldObject(singleFormElement);

    if (validate.isFieldValid(field)) {
      const { errorsContainer } = field.config;
      errorsContainer.parentNode.removeChild(errorsContainer);
      delete field.errorMessage;
    }
  }

  onSuccess(callback, eventName) {
    const validate = this;

    const normalizedEventName = validate.normalizeEventName(eventName);

    validate.callbacks.set(`onSuccess${normalizedEventName}`, callback);

    return validate;
  }

  onFail(callback, eventName) {
    const validate = this;

    const normalizedEventName = validate.normalizeEventName(eventName);

    validate.callbacks.set(`onFail${normalizedEventName}`, callback);

    return validate;
  }
}

export { Validate };
