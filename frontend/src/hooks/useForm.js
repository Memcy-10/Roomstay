import { useState, useCallback, useMemo } from 'react';
import { validateField, validateForm } from '../utils/validations';

export function useForm(initialValues, getValidationSchema) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = useMemo(() => {
    if (typeof getValidationSchema === 'function') {
      return getValidationSchema(formData);
    }
    return getValidationSchema || {};
  }, [formData, getValidationSchema]);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        const nextSchema = typeof getValidationSchema === 'function'
          ? getValidationSchema(next)
          : getValidationSchema || {};
        if (touched[field] && nextSchema[field]) {
          const fieldError = validateField(value || '', nextSchema[field]);
          setErrors((prevErr) => ({ ...prevErr, [field]: fieldError }));
        }
        return next;
      });
    },
    [touched, getValidationSchema]
  );

  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const schema = typeof getValidationSchema === 'function'
        ? getValidationSchema(formData)
        : getValidationSchema || {};
      if (schema[field]) {
        const fieldError = validateField(formData[field] || '', schema[field]);
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
      }
    },
    [formData, getValidationSchema]
  );

  const validateAll = useCallback(() => {
    const schema = typeof getValidationSchema === 'function'
      ? getValidationSchema(formData)
      : getValidationSchema || {};
    const newErrors = validateForm(formData, schema);
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  }, [formData, getValidationSchema]);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setFieldError,
    setFormData,
    isValid,
    validationSchema,
  };
}
