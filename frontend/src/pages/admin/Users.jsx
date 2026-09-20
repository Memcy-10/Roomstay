import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const result = await adminService.getUsers();
      setUsers(result.data?.users || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar los usuarios.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const removeUser = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((current) => current.filter((item) => item.id !== id));
    } catch (requestError) { setError(requestError.response?.data?.message || 'No se pudo eliminar el usuario.'); }
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setForm({ ...user, password: '' });
    setError('');
  };

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveUser = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const result = await adminService.updateUser(editingUser, payload);
      const savedUser = result.data;
      setUsers((current) => current.map((item) => item.id === editingUser ? savedUser : item));
      setEditingUser(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo actualizar el usuario.');
    }
  };

  return <div className="container-app space-y-6"><header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Usuarios</h1><p className="mt-2 text-neutral-600">Consulta, edita la información y administra los permisos.</p></header>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{editingUser && <form onSubmit={saveUser} className="card grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3"><h2 className="text-xl font-semibold sm:col-span-2 lg:col-span-3">Editar usuario</h2>{[['firstName','Nombre'],['lastName','Apellido'],['documentType','Tipo documento'],['documentNumber','Número documento'],['address','Dirección'],['phone','Teléfono'],['email','Correo'],['password','Nueva contraseña']].map(([name, label]) => <label key={name} className="text-sm font-medium text-neutral-700">{label}{name === 'password' && <span className="block text-xs font-normal text-neutral-500">Déjala vacía para conservar la actual.</span>}<input name={name} type={name === 'password' ? 'password' : 'text'} autoComplete={name === 'password' ? 'new-password' : undefined} value={form[name] || ''} onChange={updateForm} className="input-field mt-1" /></label>)}<label className="text-sm font-medium text-neutral-700">Rol<select name="role" value={form.role || 'user'} onChange={updateForm} className="select-field mt-1"><option value="user">Usuario</option><option value="host">Hospedador</option><option value="admin">Administrador</option></select></label><label className="text-sm font-medium text-neutral-700">Estado<select name="estado" value={form.estado || 'activo'} onChange={updateForm} className="select-field mt-1"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label><div className="flex items-end gap-3"><button type="submit" className="btn-primary">Guardar cambios</button><button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancelar</button></div></form>}{loading ? <div className="card p-6 text-neutral-500">Cargando usuarios...</div> : <div className="card overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="p-4">Nombre</th><th className="p-4">Correo</th><th className="p-4">Teléfono</th><th className="p-4">Rol</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead><tbody className="divide-y divide-neutral-100">{users.map((item) => <tr key={item.id}><td className="p-4 font-medium">{item.firstName} {item.lastName}</td><td className="p-4">{item.email}</td><td className="p-4">{item.phone}</td><td className="p-4"><span className="badge bg-primary-50 text-primary-700 capitalize">{item.role}</span></td><td className="p-4"><span className={`badge capitalize ${item.estado === 'activo' ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>{item.estado || 'activo'}</span></td><td className="p-4"><div className="flex gap-3"><button type="button" onClick={() => startEditing(item)} className="text-sm font-semibold text-primary-600 hover:underline">Editar</button><button type="button" onClick={() => removeUser(item.id)} className="text-sm font-semibold text-red-600 hover:underline">Eliminar</button></div></td></tr>)}</tbody></table>{users.length === 0 && <p className="p-6 text-neutral-600">No hay usuarios registrados.</p>}</div>}</div>;
};

export default AdminUsers;
