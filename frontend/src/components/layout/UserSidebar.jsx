import { Link } from 'react-router-dom';
import SidebarLink from '../common/SidebarLink';
import { useAuth } from '../../hooks/useAuth';
import genericUserImage from '../../assets/images/generic-user.svg';

const UserSidebar = ({ onLinkClick }) => {
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
          <span className="text-xs text-neutral-500 -mt-0.5">Mi Cuenta</span>
        </div>
      </Link>

      <div className="flex items-center gap-3 px-2 py-3 mb-6 bg-neutral-50 rounded-xl">
        <img src={genericUserImage} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-neutral-800 truncate">{userName}</span>
          <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 w-fit">
            Cliente
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarLink
          to="/user/dashboard"
          onClick={onLinkClick}
          label="Dashboard"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-3H4v3zm10-12h6V4h-6v4z" /></svg>}
        />
        <SidebarLink
          to="/rooms"
          onClick={onLinkClick}
          label="Explorar hospedajes"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>}
        />
        <SidebarLink
          to="/user/profile"
          onClick={onLinkClick}
          label="Mi Información"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <SidebarLink
          to="/user/security"
          onClick={onLinkClick}
          label="Seguridad"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <SidebarLink
          to="/user/bookings"
          onClick={onLinkClick}
          label="Mis Reservaciones"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <div className="pt-2 px-2 mt-2 border-t border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">Mi Cuenta</p>
        </div>
        <SidebarLink
          to="/user/invoices"
          onClick={onLinkClick}
          label="Mis Facturas"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SidebarLink
          to="/user/pqr"
          onClick={onLinkClick}
          label="PQR"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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

export default UserSidebar;
