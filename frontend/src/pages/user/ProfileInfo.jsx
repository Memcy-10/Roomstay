import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { userService } from '../../services/user.service.js';

const UserProfileInfo = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', documentType: 'CC', documentNumber: '', address: '', phone: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { userService.getProfile().then((result) => setForm((current) => ({ ...current, ...result.data?.user }))).catch(() => setForm((current) => ({ ...current, ...user }))); }, [user]);
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const saveProfile = async (event) => { event.preventDefault(); setMessage(''); setError(''); try { await userService.updateProfile(form); await refreshUser(); setMessage('Información actualizada correctamente.'); } catch (requestError) { setError(requestError.response?.data?.message || 'No se pudo actualizar la información.'); } };

  return <div className="container-app space-y-6"><header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Mi información</h1><p className="mt-2 text-neutral-600">Mantén tus datos de contacto actualizados.</p></header>{message && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}<form onSubmit={saveProfile} className="card max-w-3xl space-y-5 p-6"><div className="grid gap-4 sm:grid-cols-2">{[['firstName','Nombre'],['lastName','Apellido'],['documentNumber','Documento'],['phone','Teléfono'],['address','Dirección'],['email','Correo electrónico']].map(([name, label]) => <label key={name} className="block text-sm font-medium text-neutral-700">{label}<input name={name} value={form[name] || ''} onChange={handleChange} className="input-field mt-1" required={name !== 'address'} /></label>)}</div><button type="submit" className="btn-primary">Guardar cambios</button></form></div>;
};

export default UserProfileInfo;
