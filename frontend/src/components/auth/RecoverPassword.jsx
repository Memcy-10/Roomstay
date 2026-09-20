import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useForm } from '../../hooks/useForm';
import { validations } from '../../utils/validations';
import { useAuth } from '../../hooks/useAuth';

const RecoverPassword = ({ onBackToLogin }) => {
  const { recoverPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoverError, setRecoverError] = useState('');
  const [recoveredToken, setRecoveredToken] = useState('');

  const initialValues = {
    email: '',
  };

  const validationSchema = {
    email: [validations.required, validations.email],
  };

  const { formData, errors, touched, handleChange, handleBlur, validateAll, resetForm } =
    useForm(initialValues, validationSchema);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecoverError('');
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const result = await recoverPassword(formData.email);
      if (result.success) {
        setSubmittedEmail(formData.email);
        if (result.data?.token) {
          setRecoveredToken(result.data.token);
        }
        setIsSubmitted(true);
      } else {
        setRecoverError(result.message);
      }
    } catch {
      setRecoverError('Ocurrió un error. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-secondary-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-secondary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Revisa tu correo</h2>
          <p className="text-neutral-600">
            Hemos enviado instrucciones para restablecer tu contraseña a:
          </p>
          <p className="mt-2 font-semibold text-primary-600 text-lg">{submittedEmail}</p>
        </div>

        {recoveredToken && (
          <div className="card p-5 mb-6 bg-blue-50 border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">🔧 Token de recuperación (modo desarrollo):</p>
            <p className="text-xs font-mono break-all bg-white p-2 rounded border text-blue-700 select-all">
              {recoveredToken}
            </p>
          </div>
        )}

        <div className="card p-5 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">¿No recibiste el correo?</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Revisa la carpeta de spam o correos no deseados</li>
                <li>Espera unos minutos y vuelve a intentarlo</li>
                <li>Verifica que el correo ingresado sea correcto</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setIsSubmitted(false);
              setRecoveredToken('');
              resetForm();
            }}
          >
            Reenviar instrucciones
          </Button>
          <Button variant="ghost" fullWidth onClick={onBackToLogin}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Recupera tu contraseña</h2>
        <p className="text-neutral-600">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
        </p>
      </div>

      {recoverError && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-red-500">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-red-700">{recoverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu.correo@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          required
          maxLength={100}
          autoComplete="email"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <Button type="submit" fullWidth variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </>
          ) : (
            'Enviar instrucciones'
          )}
        </Button>

        <div className="pt-2">
          <Button variant="link" fullWidth onClick={onBackToLogin}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio de sesión
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecoverPassword;
