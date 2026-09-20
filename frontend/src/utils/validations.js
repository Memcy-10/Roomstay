const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DOCUMENT_REGEX = /^[a-zA-Z0-9]{6,20}$/;
const PHONE_REGEX = /^[3][0-9]{9}$/;
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']{2,50}$/;
const ADDRESS_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#,\-.°]{5,100}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;

export const validations = {
  required: (value) => {
    if (value === null || value === undefined || value.toString().trim() === '') {
      return 'Este campo es obligatorio';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.toString().length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.toString().length > max) {
      return `Debe tener máximo ${max} caracteres`;
    }
    return null;
  },

  email: (value) => {
    if (value && !EMAIL_REGEX.test(value.toString().trim())) {
      return 'Correo electrónico inválido';
    }
    return null;
  },

  name: (value) => {
    if (value && !NAME_REGEX.test(value.toString().trim())) {
      return 'Solo se permiten letras y espacios (2-50 caracteres)';
    }
    return null;
  },

  document: (value) => {
    if (value && !DOCUMENT_REGEX.test(value.toString().trim())) {
      return 'Documento inválido (6-20 caracteres alfanuméricos)';
    }
    return null;
  },

  phone: (value) => {
    if (value && !PHONE_REGEX.test(value.toString().trim())) {
      return 'Teléfono inválido (formato: 3XXXXXXXXX)';
    }
    return null;
  },

  address: (value) => {
    if (value && !ADDRESS_REGEX.test(value.toString().trim())) {
      return 'Dirección inválida (5-100 caracteres)';
    }
    return null;
  },

  password: (value) => {
    if (value && !PASSWORD_REGEX.test(value.toString())) {
      return 'Mín 8 caracteres: una mayúscula, una minúscula, un número y un símbolo';
    }
    return null;
  },

  confirmPassword: (password) => (value) => {
    if (value && value !== password) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },

  role: (value) => {
    const VALID_ROLES = ['user', 'host'];
    if (value && !VALID_ROLES.includes(value.toString().trim())) {
      return 'Rol inválido. Opciones: user, host';
    }
    return null;
  },
};

export const validateField = (value, rules) => {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : null;
    if (error) return error;
  }
  return null;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  Object.keys(validationSchema).forEach((field) => {
    const error = validateField(formData[field] || '', validationSchema[field]);
    if (error) errors[field] = error;
  });
  return errors;
};
