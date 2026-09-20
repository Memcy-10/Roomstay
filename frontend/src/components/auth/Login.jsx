import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import RegisterModal from './RegisterModal';
import RecoverPassword from './RecoverPassword';
import { useForm } from '../../hooks/useForm';
import { validations } from '../../utils/validations';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, getRememberedEmail, isAuthenticated, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = {
    email: [validations.required, validations.email],
    password: [validations.required, validations.minLength(6)],
  };

  const { formData, errors, touched, handleChange, handleBlur, validateAll, setFormData } =
    useForm(initialValues, validationSchema);

  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setFormData({ ...initialValues, email: remembered });
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const role = user?.role || user?.rol;
      navigate(role === 'admin' ? '/admin/dashboard' : role === 'host' ? '/host/dashboard' : '/user/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password, rememberMe);
      if (result.success) {
        const role = result.user?.role || result.user?.rol;
        navigate(role === 'admin' ? '/admin/dashboard' : role === 'host' ? '/host/dashboard' : '/user/dashboard');
      } else {
        setLoginError(result.message);
      }
    } catch {
      setLoginError('Credenciales inválidas. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setPasswordShown(!passwordShown);

  const features = [
    {
      icon: '🔐',
      titulo: 'Reservas seguras',
      desc: 'Tus datos están protegidos con los más altos estándares de seguridad.',
    },
    {
      icon: '⚡',
      titulo: 'Check-in rápido',
      desc: 'Proceso digital sin papeleo. Entra en minutos a tu habitación.',
    },
    {
      icon: '💬',
      titulo: 'Atención 24/7',
      desc: 'Estamos para ayudarte en cualquier momento del día o noche.',
    },
  ];

  if (showRecover) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-10 px-4">
        <div className="w-full max-w-5xl">
          <RecoverPassword onBackToLogin={() => setShowRecover(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-primary-900 to-neutral-900 p-10 xl:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-500 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-secondary-500 blur-3xl" />
          </div>
          <div className="relative z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group mb-12"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold">RoomStay</p>
                <p className="text-xs text-white/60 -mt-0.5">Alquiler de Habitaciones</p>
              </div>
            </button>

            <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">
              Inicia sesión para acceder a tus reservas, favoritos y ofertas exclusivas en miles de habitaciones.
            </p>

            <div className="space-y-5">
              {features.map((f, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">{f.titulo}</h3>
                    <p className="text-sm text-white/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="flex -space-x-2">
                {['🧑', '👩', '👨', '🧕'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/10 border-2 border-neutral-900 flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                Únete a los <span className="text-white font-semibold">50K+ huéspedes</span> que confían en RoomStay
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 xl:p-12">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="font-bold text-neutral-900">RoomStay</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Iniciar sesión
            </h2>
            <p className="text-neutral-600">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-primary-600 font-semibold hover:underline"
              >
                Crea una gratis
              </button>
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-red-500">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-red-700">{loginError}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <div>
              <div className="relative">
                <Input
                  label="Contraseña"
                  name="password"
                  type={passwordShown ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  required
                  maxLength={50}
                  autoComplete="current-password"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
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
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-800">
                  Recordarme
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowRecover(true)}
                className="text-sm text-primary-600 font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" fullWidth variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-sm text-neutral-500">o continúa con</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              onClick={() => alert('Integración con Google próximamente')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              onClick={() => alert('Integración con Facebook próximamente')}
            >
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500">
              Al iniciar sesión aceptas nuestros{' '}
              <a href="#terms" className="text-neutral-700 hover:underline font-medium">
                Términos
              </a>{' '}
              y{' '}
              <a href="#privacy" className="text-neutral-700 hover:underline font-medium">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginSuccess={() => navigate('/')}
      />
    </div>
  );
};

export default Login;
