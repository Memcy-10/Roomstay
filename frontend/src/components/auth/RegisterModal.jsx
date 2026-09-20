import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { useForm } from '../../hooks/useForm';
import { validations, validateField } from '../../utils/validations';
import { useAuth } from '../../hooks/useAuth';

const RegisterModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const tipoDocumentoOptions = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' },
  ];

  const roleOptions = [
    { value: 'user', label: 'Usuario (Cliente) - Busco hospedaje' },
    { value: 'host', label: 'Hospedador (Anfitrión) - Publico habitaciones' },
  ];

  const initialValues = {
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    termsAccepted: false,
  };

  const getValidationSchema = (data) => ({
    firstName: [validations.required, validations.name],
    lastName: [validations.required, validations.name],
    documentType: [validations.required],
    documentNumber: [validations.required, validations.document],
    address: [validations.required, validations.address],
    phone: [validations.required, validations.phone],
    email: [validations.required, validations.email],
    role: [validations.required, validations.role],
    password: [validations.required, validations.password],
    confirmPassword: [
      validations.required,
      validations.confirmPassword(data ? data.password : ''),
    ],
  });

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    setFieldError,
  } = useForm(initialValues, getValidationSchema);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSuccessMessage('');
      setRegisterError('');
      setServerErrors({});
      setIsLoading(false);
      resetForm();
    }
  }, [isOpen]);

  const handleNextStep = () => {
    const fieldsStep1 = ['firstName', 'lastName', 'documentType', 'documentNumber', 'address', 'phone'];
    const step1Errors = {};
    let hasErrors = false;
    const schema = getValidationSchema(formData);

    fieldsStep1.forEach((field) => {
      const error = validateField(formData[field] || '', schema[field]);
      if (error) {
        step1Errors[field] = error;
        hasErrors = true;
      }
    });

    Object.keys(step1Errors).forEach((f) => handleBlur(f));

    if (!hasErrors) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setServerErrors({});

    const schema = getValidationSchema(formData);
    const allFields = ['firstName', 'lastName', 'documentType', 'documentNumber', 'address', 'phone', 'email', 'role', 'password', 'confirmPassword'];
    let hasErrors = false;

    allFields.forEach((field) => {
      const error = validateField(formData[field] || '', schema[field]);
      setFieldError(field, error);
      if (error) hasErrors = true;
      handleBlur(field);
    });

    if (!formData.termsAccepted) {
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsLoading(true);
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        // Garantizar que el rol nunca llegue vacío al backend
        role: ['user', 'host'].includes(formData.role) ? formData.role : 'user',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        setSuccessMessage('¡Registro exitoso! Bienvenido a RoomStay 🎉');
        setTimeout(() => {
          onClose();
          if (onLoginSuccess) onLoginSuccess();
        }, 2500);
      } else {
        setRegisterError(result.message);
        if (result.errors) {
          setServerErrors(result.errors);
          Object.keys(result.errors).forEach((field) => {
            setFieldError(field, result.errors[field]);
            handleBlur(field);
          });
          // Si el error es en el email, volver al paso 2 donde está el campo
          if (result.errors.email) {
            setStep(2);
          }
        }
      }
    } catch {
      setRegisterError('Ocurrió un error durante el registro. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setPasswordShown(!passwordShown);
  const toggleConfirmPassword = () => setConfirmPasswordShown(!confirmPasswordShown);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear cuenta en RoomStay"
      size="lg"
    >
      {successMessage ? (
        <div className="py-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-secondary-100 flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">{successMessage}</h3>
          <p className="text-neutral-600">Tu cuenta ha sido creada exitosamente.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 2 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 mx-1 transition-all ${
                        step > s ? 'bg-primary-600' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              Paso {step} de 2
            </p>
          </div>

          {registerError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-red-500">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-700">{registerError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    name="firstName"
                    placeholder="Tu nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName || serverErrors.firstName}
                    touched={touched.firstName}
                    required
                    maxLength={50}
                    autoComplete="given-name"
                  />
                  <Input
                    label="Apellido"
                    name="lastName"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName || serverErrors.lastName}
                    touched={touched.lastName}
                    required
                    maxLength={50}
                    autoComplete="family-name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Tipo de documento"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={tipoDocumentoOptions}
                    error={errors.documentType || serverErrors.documentType}
                    touched={touched.documentType}
                    required
                    placeholder="Selecciona..."
                    className="sm:col-span-1"
                  />
                  <Input
                    label="Número de documento"
                    name="documentNumber"
                    placeholder="Sin puntos ni guiones"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.documentNumber || serverErrors.documentNumber}
                    touched={touched.documentNumber}
                    required
                    maxLength={20}
                    autoComplete="off"
                    className="sm:col-span-2"
                  />
                </div>

                <Input
                  label="Dirección"
                  name="address"
                  placeholder="Calle, número, barrio, ciudad"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.address || serverErrors.address}
                  touched={touched.address}
                  required
                  maxLength={100}
                  autoComplete="street-address"
                />

                <Input
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  placeholder="300 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone || serverErrors.phone}
                  touched={touched.phone}
                  required
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email || serverErrors.email}
                  touched={touched.email}
                  required
                  maxLength={100}
                  autoComplete="email"
                />

                <Select
                  label="Tipo de cuenta (Rol)"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={roleOptions}
                  error={errors.role || serverErrors.role}
                  touched={touched.role}
                  required
                  placeholder="Selecciona un rol..."
                />

                <div className="relative">
                  <Input
                    label="Contraseña"
                    name="password"
                    type={passwordShown ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password || serverErrors.password}
                    touched={touched.password}
                    required
                    maxLength={50}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 p-1"
                    tabIndex={-1}
                    aria-label={passwordShown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {passwordShown ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type={confirmPasswordShown ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.confirmPassword || serverErrors.confirmPassword}
                    touched={touched.confirmPassword}
                    required
                    maxLength={50}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 p-1"
                    tabIndex={-1}
                    aria-label={confirmPasswordShown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {confirmPasswordShown ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-5">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-600 group-hover:text-neutral-800">
                      Acepto los{' '}
                      <a href="#terms" className="text-primary-600 font-medium hover:underline">
                        Términos y Condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#privacy" className="text-primary-600 font-medium hover:underline">
                        Política de Privacidad
                      </a>
                    </span>
                  </label>
                  {!formData.termsAccepted && touched.termsAccepted === false && (
                    <p className="error-message mt-2">
                      Debes aceptar los términos y condiciones
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3 justify-end border-t border-neutral-100 pt-5">
              {step === 2 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </Button>
              )}

              {step === 1 ? (
                <>
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="button" variant="primary" onClick={handleNextStep}>
                    Continuar
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!formData.termsAccepted || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creando...
                      </>
                    ) : (
                      <>
                        Crear cuenta
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </>
      )}
    </Modal>
  );
};

export default RegisterModal;
