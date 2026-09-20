import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { adminService } from '../services/admin.service.js';
import { roomsService } from '../services/rooms.service.js';
import Button from '../components/common/Button';

const emptyUser = {
  firstName: '', lastName: '', documentType: 'CC', documentNumber: '',
  address: '', phone: '', email: '', password: '', role: 'user',
};

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.rol === 'admin';

  const loadData = async () => {
    const errors = [];
    try {
      const userResult = await adminService.getUsers();
      setUsers(userResult.data?.users || []);
    } catch (err) {
      errors.push(err?.response?.data?.message || 'No se pudieron cargar los usuarios.');
    }
    try {
      const roomResult = await roomsService.getRooms();
      setRooms(roomResult.data?.habitaciones || []);
    } catch (err) {
      errors.push(err?.response?.data?.message || 'No se pudieron cargar los hospedajes.');
    }
    if (errors.length) setError(errors.join(' '));
  };

  useEffect(() => {
    if (!loading && isAdmin) loadData();
  }, [loading, isAdmin]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const resetForm = () => {
    setForm(emptyUser);
    setEditingId(null);
  };

  const editUser = (selectedUser) => {
    setEditingId(selectedUser.id);
    setForm({ ...emptyUser, ...selectedUser, password: '' });
    setTab('users');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const result = editingId
        ? await adminService.updateUser(editingId, payload)
        : await adminService.createUser(payload);
      const savedUser = result.data.user;
      setUsers((current) => editingId
        ? current.map((item) => item.id === editingId ? savedUser : item)
        : [savedUser, ...current]);
      setMessage(editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('¿Eliminar este usuario? También se eliminarán sus reservas y favoritos.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((current) => current.filter((item) => item.id !== id));
      setMessage('Usuario eliminado correctamente.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo eliminar el usuario.');
    }
  };

  const removeRoom = async (id) => {
    if (!window.confirm('¿Eliminar este hospedaje?')) return;
    try {
      await roomsService.deleteRoom(id);
      setRooms((current) => current.filter((item) => item.id !== id));
      setMessage('Hospedaje eliminado correctamente.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo eliminar el hospedaje.');
    }
  };

  if (loading) return <div className="container-app py-16 text-center text-neutral-500">Cargando...</div>;
  if (!isAdmin) {
    return <div className="container-app py-16 text-center"><h1 className="mb-4">Acceso restringido</h1><Link to="/"><Button>Volver al inicio</Button></Link></div>;
  }

  return (
    <div className="container-app py-10 md:py-14">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Panel de control</p>
        <h1>Administración</h1>
        <p className="text-neutral-600">Gestiona usuarios y todos los hospedajes registrados.</p>
      </div>

      {(message || error) && <div className={`mb-6 rounded-lg border p-4 ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{error || message}</div>}

      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        <button className={`px-4 py-3 font-medium ${tab === 'users' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-neutral-500'}`} onClick={() => setTab('users')}>Usuarios ({users.length})</button>
        <button className={`px-4 py-3 font-medium ${tab === 'rooms' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-neutral-500'}`} onClick={() => setTab('rooms')}>Hospedajes ({rooms.length})</button>
      </div>

      {tab === 'users' ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <form onSubmit={saveUser} className="card h-fit p-6">
            <h2 className="mb-5 text-xl">{editingId ? 'Editar usuario' : 'Agregar usuario'}</h2>
            <div className="space-y-3">
              {['firstName', 'lastName', 'documentNumber', 'address', 'phone', 'email'].map((field) => (
                <input key={field} name={field} value={form[field]} onChange={handleChange} required={!editingId || field !== 'email'} placeholder={{ firstName: 'Nombre', lastName: 'Apellido', documentNumber: 'Documento', address: 'Dirección', phone: 'Teléfono', email: 'Correo' }[field]} className="input-field" />
              ))}
              <select name="documentType" value={form.documentType} onChange={handleChange} className="select-field"><option value="CC">Cédula</option><option value="CE">Cédula de extranjería</option><option value="TI">Tarjeta de identidad</option></select>
              <input name="password" type="password" value={form.password} onChange={handleChange} required={!editingId} placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'} className="input-field" />
              <select name="role" value={form.role} onChange={handleChange} className="select-field"><option value="user">Usuario</option><option value="host">Hospedador</option><option value="admin">Administrador</option></select>
            </div>
            <div className="mt-5 flex gap-2"><Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>}</div>
          </form>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="p-4">Usuario</th><th className="p-4">Correo</th><th className="p-4">Rol</th><th className="p-4">Acciones</th></tr></thead><tbody className="divide-y divide-neutral-100">
              {users.map((item) => <tr key={item.id}><td className="p-4 font-medium">{item.firstName} {item.lastName}</td><td className="p-4">{item.email}</td><td className="p-4 capitalize">{item.role}</td><td className="p-4"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editUser(item)}>Editar</Button><Button size="sm" variant="danger" onClick={() => removeUser(item.id)} disabled={item.id === user.id}>Eliminar</Button></div></td></tr>)}
            </tbody></table>
          </div>
        </div>
      ) : (
        <div><div className="mb-4 flex justify-end"><Button onClick={() => navigate('/admin/rooms/new')}>Agregar hospedaje</Button></div><div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="p-4">Hospedaje</th><th className="p-4">Hospedador</th><th className="p-4">Ubicación</th><th className="p-4">Precio</th><th className="p-4">Acciones</th></tr></thead><tbody className="divide-y divide-neutral-100">
          {rooms.map((room) => <tr key={room.id}><td className="p-4 font-medium">{room.titulo}</td><td className="p-4">{room.hostFirstName || 'Sin asignar'} {room.hostLastName || ''}</td><td className="p-4">{room.ubicacion}</td><td className="p-4">${Number(room.precio).toLocaleString('es-CO')}</td><td className="p-4"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}>Editar</Button><Button size="sm" variant="danger" onClick={() => removeRoom(room.id)}>Eliminar</Button></div></td></tr>)}
        </tbody></table></div></div>
      )}
    </div>
  );
};

export default Admin;
