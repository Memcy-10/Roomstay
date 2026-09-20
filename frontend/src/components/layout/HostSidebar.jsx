import { Link } from 'react-router-dom';
import SidebarLink from '../common/SidebarLink';
import { useAuth } from '../../hooks/useAuth';
import genericUserImage from '../../assets/images/generic-user.svg';

const HostSidebar = ({ onLinkClick }) => {
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
          <span className="text-xs text-neutral-500 -mt-0.5">Hospedador</span>
        </div>
      </Link>

      <div className="flex items-center gap-3 px-2 py-3 mb-6 bg-neutral-50 rounded-xl">
        <img src={genericUserImage} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-neutral-800 truncate">{userName}</span>
          <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
            Hospedador
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarLink
          to="/host/dashboard"
          onClick={onLinkClick}
          label="Dashboard"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/rooms"
          onClick={onLinkClick}
          label="Mis Hospedajes"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/rooms/new"
          onClick={onLinkClick}
          label="Crear Hospedaje"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/reservations"
          onClick={onLinkClick}
          label="Reservas Recibidas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="pt-2 px-2 mt-2 border-t border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">Operaciones</p>
        </div>
        <SidebarLink
          to="/host/sales"
          onClick={onLinkClick}
          label="Mis Ventas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/invoices"
          onClick={onLinkClick}
          label="Facturación"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/pqr"
          onClick={onLinkClick}
          label="PQR"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
        <SidebarLink
          to="/host/profile"
          onClick={onLinkClick}
          label="Mi Información"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7" /></svg>}
        />
        <SidebarLink
          to="/host/security"
          onClick={onLinkClick}
          label="Seguridad"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
        />
      </nav>

      <div className="mt-auto pt-6">
        <p className="text-xs text-neutral-400 px-2">RoomStay © 2026</p>
      </div>
    </div>
  );
};

export default HostSidebar;
