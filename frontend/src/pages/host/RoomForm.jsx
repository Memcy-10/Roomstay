import { useParams } from 'react-router-dom';

const HostRoomForm = () => {
  const { id } = useParams();
  const isEdit = !!id;

  return (
    <div className="container-app">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        {isEdit ? 'Editar Hospedaje' : 'Crear Nuevo Hospedaje'}
      </h2>
      <p className="text-neutral-600">Contenido en construcción</p>
    </div>
  );
};

export default HostRoomForm;
