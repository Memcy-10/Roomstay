import { Link } from 'react-router-dom';
import SidebarLink from '../common/SidebarLink';
import { useAuth } from '../../hooks/useAuth';
import genericUserImage from '../../assets/images/generic-user.svg';

const AdminSidebar = ({ onLinkClick }) => {
  const { user } = useAuth();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Usuario';

  return (
    <div className="flex flex-col h-full py-6 px-4">
      <Link to="/" className="flex items-center gap-2 mb-8 px-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-neutral-900">RoomStay</span>
          <span className="text-xs text-neutral-500 -mt-0.5">Panel Admin</span>
        </div>
      </Link>

      <div className="flex items-center gap-3 px-2 py-3 mb-6 bg-neutral-50 rounded-xl">
        <img src={genericUserImage} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-neutral-800 truncate">{userName}</span>
          <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 w-fit">
            Administrador
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarLink
          to="/admin/dashboard"
          onClick={onLinkClick}
          label="Dashboard"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/users"
          onClick={onLinkClick}
          label="Usuarios"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/rooms"
          onClick={onLinkClick}
          label="Habitaciones"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/reservations"
          onClick={onLinkClick}
          label="Reservaciones"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <div className="pt-2 px-2 mt-2 border-t border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">Operaciones</p>
        </div>
        <SidebarLink
          to="/admin/sales"
          onClick={onLinkClick}
          label="Ventas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/invoices"
          onClick={onLinkClick}
          label="Facturación"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/pqr"
          onClick={onLinkClick}
          label="PQR"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
        <SidebarLink
          to="/admin/reports"
          onClick={onLinkClick}
          label="Reportes"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 009.172 9H7a2 2 0 00-2 2v9a2 2 0 002 2z" />
            </svg>
          }
        />
      </nav>

      <div className="mt-auto pt-6">
        <p className="text-xs text-neutral-400 px-2">RoomStay © 2026</p>
      </div>
    </div>
  );
};

export default AdminSidebar;
