import { useState } from 'react';
import { useForm } from '../hooks/useForm';
import { validations } from '../utils/validations';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { contactService } from '../services/contact.service.js';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [serverErrors, setServerErrors] = useState({});

  const initialValues = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  };

  const validationSchema = {
    nombre: [validations.required, validations.name],
    email: [validations.required, validations.email],
    telefono: [validations.phone],
    asunto: [
      validations.required,
      validations.minLength(5),
      validations.maxLength(100),
    ],
    mensaje: [
      validations.required,
      validations.minLength(10),
      validations.maxLength(500),
    ],
  };

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
  } = useForm(initialValues, validationSchema);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setServerErrors({});
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const result = await contactService.sendMessage(formData);
      if (result.success) {
        setSubmitted(true);
        resetForm();
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setSubmitError(result.message);
        if (result.errors) setServerErrors(result.errors);
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        'Ocurrió un error al enviar el mensaje. Inténtalo nuevamente.'
      );
      if (error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const asuntos = [
    { value: '', label: 'Selecciona un asunto' },
    { value: 'reservas', label: 'Consulta de reservas' },
    { value: 'anfitrion', label: 'Quiero ser anfitrión' },
    { value: 'reclamo', label: 'Reclamos o sugerencias' },
    { value: 'soporte', label: 'Soporte técnico' },
    { value: 'otro', label: 'Otro' },
  ];

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      titulo: 'Teléfono',
      valor: '+57 300 123 4567',
      link: 'tel:+573001234567',
      detalle: 'Lun-Vie 8am a 8pm | Sáb 9am a 5pm',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      titulo: 'Correo',
      valor: 'info@roomstay.com',
      link: 'mailto:info@roomstay.com',
      detalle: 'Respondemos en menos de 24h',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      titulo: 'Oficina Principal',
      valor: 'Calle 123 #45-67, Bogotá',
      link: '#location',
      detalle: 'Edificio RoomStay, Piso 5',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      titulo: 'WhatsApp',
      valor: '+57 300 123 4567',
      link: 'https://wa.me/573001234567',
      detalle: 'Atención inmediata',
    },
  ];

  return (
    <div className="flex-1">
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 md:py-20">
        <div className="container-app text-center">
          <span className="badge bg-primary-100 text-primary-700 mb-4 px-3 py-1">
            Contacto
          </span>
          <h1 className="mb-4">Estamos aquí para ayudarte</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            ¿Tienes preguntas? ¿Necesitas ayuda con una reserva? No dudes en contactarnos.
            Nuestro equipo estará encantado de atenderte.
          </p>
        </div>
      </section>

      <section className="container-app -mt-10 md:-mt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((info, idx) => (
              <a
                key={idx}
                href={info.link}
                className="card p-6 flex items-start gap-4 hover:shadow-card-hover transition-all hover:-translate-y-0.5 group block"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  {info.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 mb-0.5">{info.titulo}</h3>
                  <p className="text-primary-600 font-medium mb-1 truncate">{info.valor}</p>
                  <p className="text-sm text-neutral-500">{info.detalle}</p>
                </div>
              </a>
            ))}

            <div className="card p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 border-primary-100">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horarios de atención
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-neutral-600">Lunes - Viernes</span>
                  <span className="font-medium text-neutral-900">8:00am - 8:00pm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-600">Sábados</span>
                  <span className="font-medium text-neutral-900">9:00am - 5:00pm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-600">Domingos</span>
                  <span className="font-medium text-primary-600">Soporte en línea</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Envíanos un mensaje</h2>
                <p className="text-neutral-600">
                  Completa el formulario y te responderemos lo antes posible.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-secondary-50 border border-secondary-200 flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-800">¡Mensaje enviado con éxito!</p>
                    <p className="text-sm text-secondary-700">
                      Gracias por contactarnos. Te responderemos en un plazo máximo de 24 horas.
                    </p>
                  </div>
                </div>
              )}

              {submitError && !submitted && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-red-500">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Nombre completo"
                    name="nombre"
                    placeholder="Tu nombre y apellido"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.nombre || serverErrors.nombre}
                    touched={touched.nombre}
                    required
                    maxLength={50}
                  />
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
                    autoComplete="email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Teléfono (opcional)"
                    name="telefono"
                    type="tel"
                    placeholder="300 123 4567"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.telefono || serverErrors.telefono}
                    touched={touched.telefono}
                    maxLength={10}
                    autoComplete="tel"
                  />
                  <div>
                    <label htmlFor="asunto" className="label-field">
                      Asunto <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={(e) => handleChange('asunto', e.target.value)}
                      onBlur={() => handleBlur('asunto')}
                      className={`select-field ${
                        (touched.asunto && errors.asunto) || serverErrors.asunto
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : ''
                      }`}
                    >
                      {asuntos.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {(touched.asunto && errors.asunto) || serverErrors.asunto ? (
                      <p className="error-message">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.asunto || serverErrors.asunto}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="label-field">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={6}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      value={formData.mensaje}
                      onChange={(e) => handleChange('mensaje', e.target.value)}
                      onBlur={() => handleBlur('mensaje')}
                      maxLength={500}
                      className={`input-field resize-none ${
                        (touched.mensaje && errors.mensaje) || serverErrors.mensaje ? 'input-field-error' : ''
                      }`}
                    />
                    <span className="absolute right-2 bottom-2 text-xs text-neutral-400">
                      {(formData.mensaje || '').length}/500
                    </span>
                  </div>
                  {(touched.mensaje && errors.mensaje) || serverErrors.mensaje ? (
                    <p className="error-message">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.mensaje || serverErrors.mensaje}
                    </p>
                  ) : null}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <p className="text-sm text-neutral-500">
                    Al enviar aceptas nuestra{' '}
                    <a href="#privacy" className="text-primary-600 hover:underline">
                      Política de Privacidad
                    </a>
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      Limpiar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar mensaje
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
