import { useState } from 'react';
import { userService } from '../../services/user.service.js';

const UserSecurity = () => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const changePassword = async (event) => { event.preventDefault(); setMessage(''); setError(''); if (form.newPassword !== form.confirmPassword) { setError('Las contraseñas nuevas no coinciden.'); return; } try { await userService.changePassword(form.oldPassword, form.newPassword, form.confirmPassword); setMessage('Contraseña actualizada correctamente.'); setForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); } catch (requestError) { setError(requestError.response?.data?.message || 'No se pudo actualizar la contraseña.'); } };

  return <div className="container-app space-y-6"><header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Seguridad</h1><p className="mt-2 text-neutral-600">Cambia tu contraseña para mantener tu cuenta protegida.</p></header>{message && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}<form onSubmit={changePassword} className="card max-w-xl space-y-4 p-6"><label className="block text-sm font-medium text-neutral-700">Contraseña actual<input name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} className="input-field mt-1" required /></label><label className="block text-sm font-medium text-neutral-700">Nueva contraseña<input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className="input-field mt-1" minLength="8" required /></label><label className="block text-sm font-medium text-neutral-700">Confirmar contraseña<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input-field mt-1" minLength="8" required /></label><button type="submit" className="btn-primary">Actualizar contraseña</button></form></div>;
};

export default UserSecurity;
