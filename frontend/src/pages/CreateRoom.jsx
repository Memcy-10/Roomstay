import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { uploadService } from '../services/upload.service.js';
import { roomsService } from '../services/rooms.service.js';

const TIPOS_HABITACION = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Loft', label: 'Loft' },
  { value: 'Familiar', label: 'Familiar' },
  { value: 'Estudio', label: 'Estudio' },
  { value: 'Económica', label: 'Económica' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Apartamento', label: 'Apartamento' },
  { value: 'Boutique', label: 'Boutique' },
  { value: 'Cabaña', label: 'Cabaña' },
];

const SERVICIOS_DISPONIBLES = [
  'WiFi',
  'Baño privado',
  'TV',
  'Aire acondicionado',
  'Cocina',
  'Balcón',
  'Piscina',
  'Gimnasio',
  'Desayuno',
  'Jacuzzi',
  'Terraza',
  'Pet friendly',
  'Lavadora',
  'Garaje',
  'Parrilla',
  'Jardín',
];

const CreateRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { user, loading } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [tipo, setTipo] = useState('');
  const [servicios, setServicios] = useState([]);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchRoom = async () => {
        try {
          const result = await roomsService.getRoomById(id);
          if (result?.success && result.data?.habitacion) {
            const room = result.data.habitacion;
            setTitulo(room.titulo || '');
            setDescripcion(room.descripcion || '');
            setPrecio(room.precio ? String(room.precio) : '');
            setUbicacion(room.ubicacion || '');
            setCapacidad(room.capacidad ? String(room.capacidad) : '');
            setTipo(room.tipo || '');
            setServicios(room.servicios || []);
            setImagenPreview(room.imageUrl || null);
          }
        } catch (err) {
          setSubmitError(err?.response?.data?.message || 'Error al cargar la habitación.');
        }
      };
      fetchRoom();
    }
  }, [id, isEditMode]);

  const handleChange = (name, value) => {
    switch (name) {
      case 'titulo':
        setTitulo(value);
        break;
      case 'precio':
        setPrecio(value);
        break;
      case 'ubicacion':
        setUbicacion(value);
        break;
      case 'capacidad':
        setCapacidad(value);
        break;
      case 'tipo':
        setTipo(value);
        break;
      default:
        break;
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleServicio = (servicio) => {
    setServicios((prev) =>
      prev.includes(servicio)
        ? prev.filter((s) => s !== servicio)
        : [...prev, servicio]
    );
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!precio || Number(precio) <= 0) newErrors.precio = 'Ingresa un precio válido';
    if (!ubicacion.trim()) newErrors.ubicacion = 'La ubicación es requerida';
    if (!capacidad || Number(capacidad) < 1 || Number(capacidad) > 20)
      newErrors.capacidad = 'Capacidad entre 1 y 20';
    if (!tipo) newErrors.tipo = 'Selecciona un tipo';
    if (!imagenFile && !imagenPreview) newErrors.imagen = 'Selecciona una imagen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = imagenPreview;
      if (imagenFile) {
        setIsUploading(true);
        const uploadResult = await uploadService.uploadImage(
          imagenFile,
          (progress) => setUploadProgress(progress)
        );
        imageUrl =
          uploadResult?.url ||
          uploadResult?.imageUrl ||
          uploadResult?.data?.url ||
          uploadResult?.data?.imageUrl;
        setIsUploading(false);
      }

      const roomData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        precio: Number(precio),
        ubicacion: ubicacion.trim(),
        capacidad: Number(capacidad),
        tipo,
        servicios,
        imageUrl,
      };

      if (isEditMode) {
        await roomsService.updateRoom(id, roomData);
      } else {
        await roomsService.createRoom(roomData);
      }
      navigate(user?.role === 'admin' || user?.rol === 'admin' ? '/admin/rooms' : '/host/rooms');
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Error al crear la habitación';
      setSubmitError(msg);
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-16 text-center">
        <div className="animate-pulse text-neutral-500">Cargando...</div>
      </div>
    );
  }

  const isHost = user?.rol === 'host' || user?.rol === 'admin' || user?.role === 'host' || user?.role === 'admin';

  if (!isHost) {
    return (
      <div className="container-app py-16">
        <div className="card max-w-2xl mx-auto p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Acceso Restringido</h2>
          <p className="text-neutral-600 mb-6">
            Esta sección está disponible solo para hospedadores y administradores.
          </p>
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">{isEditMode ? 'Editar Habitación' : 'Crear Habitación'}</h1>
            <p className="text-neutral-600">
              {isEditMode ? 'Modifica los datos de tu publicación en la plataforma.' : 'Publica una nueva habitación en la plataforma.'}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/host/rooms')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">
              Información básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Título"
                name="titulo"
                value={titulo}
                onChange={handleChange}
                placeholder="Ej: Suite premium con vista al mar"
                maxLength={120}
                required
                error={errors.titulo}
                touched={!!errors.titulo || !!titulo}
                className="md:col-span-2"
              />

              <div className="md:col-span-2">
                <label className="label-field">
                  Descripción <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errors.descripcion) setErrors((p) => ({ ...p, descripcion: '' }));
                  }}
                  rows={5}
                  placeholder="Describe la habitación, sus características..."
                  className={`input-field resize-y ${errors.descripcion ? 'input-field-error' : ''}`}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.descripcion && (
                    <p className="error-message">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.descripcion}
                    </p>
                  )}
                  <span className="text-xs text-neutral-400 ml-auto">
                    {descripcion.length}/1000
                  </span>
                </div>
              </div>

              <Input
                label="Precio por noche (COP)"
                name="precio"
                type="number"
                value={precio}
                onChange={handleChange}
                placeholder="Ej: 150000"
                min="1"
                required
                error={errors.precio}
                touched={!!errors.precio || !!precio}
              />

              <Select
                label="Tipo de habitación"
                name="tipo"
                value={tipo}
                onChange={handleChange}
                options={TIPOS_HABITACION}
                required
                error={errors.tipo}
                touched={!!errors.tipo || !!tipo}
              />

              <Input
                label="Ubicación"
                name="ubicacion"
                value={ubicacion}
                onChange={handleChange}
                placeholder="Ej: Bogotá, Colombia"
                maxLength={200}
                required
                error={errors.ubicacion}
                touched={!!errors.ubicacion || !!ubicacion}
              />

              <Input
                label="Capacidad (1-20 personas)"
                name="capacidad"
                type="number"
                value={capacidad}
                onChange={handleChange}
                placeholder="Ej: 2"
                min="1"
                max="20"
                required
                error={errors.capacidad}
                touched={!!errors.capacidad || !!capacidad}
              />
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-5">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">
              Servicios incluidos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SERVICIOS_DISPONIBLES.map((servicio) => (
                <label
                  key={servicio}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    servicios.includes(servicio)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={servicios.includes(servicio)}
                    onChange={() => toggleServicio(servicio)}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">{servicio}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-5">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-4">
              Imagen principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-field">
                  Seleccionar imagen <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="input-field pt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 file:font-medium cursor-pointer"
                  />
                </div>
                {errors.imagen && (
                  <p className="error-message mt-1.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.imagen}
                  </p>
                )}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-neutral-600 mb-1.5">
                      <span>Subiendo imagen...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label-field">Vista previa</label>
                <div className="aspect-video rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {imagenPreview ? (
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-neutral-400 p-6">
                      <svg className="w-14 h-14 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No hay imagen seleccionada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{submitError}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/host/rooms')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isUploading ? 'Subiendo imagen...' : isEditMode ? 'Guardando cambios...' : 'Creando habitación...'}
                </>
              ) : (
                isEditMode ? 'Guardar cambios' : 'Crear habitación'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
