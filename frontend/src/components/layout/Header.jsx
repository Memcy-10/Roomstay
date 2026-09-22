import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import genericUserImage from '../../assets/images/generic-user.svg';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeAccountMenu = () => setIsAccountMenuOpen(false);
  const toggleAccountMenu = () => setIsAccountMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        closeAccountMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHost = user?.rol === 'host' || user?.rol === 'admin' || user?.role === 'host' || user?.role === 'admin';
  const isAdmin = user?.rol === 'admin' || user?.role === 'admin';
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Usuario';

  const navItems = [
    { to: '/', label: 'Inicio' },
    { to: '/rooms', label: 'Catálogo' },
    { to: '/about', label: '¿Quiénes Somos?' },
    { to: '/contact', label: 'Contacto' },
  ];

  const handleNavClick = (to) => {
    setMobileMenuOpen(false);
    closeAccountMenu();
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-neutral-900">RoomStay</span>
              <span className="text-xs text-neutral-500 -mt-0.5">Alquiler de Habitaciones</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative group" ref={accountMenuRef}>
                <button
                  onClick={toggleAccountMenu}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors"
                >
                  <img src={genericUserImage} alt="Perfil de usuario" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                    {userName}
                  </span>
                  <svg className="w-4 h-4 text-neutral-500 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 absolute right-0 mt-2 w-60 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-neutral-200 py-2 z-50 ${isAccountMenuOpen ? 'visible opacity-100 scale-100' : ''}`}>
                  <div
                    onClick={() => handleNavClick('/user/profile')}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Cuenta
                  </div>
                  <div
                    onClick={() => handleNavClick('/user/bookings')}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Mis Reservaciones
                  </div>
                  {isHost && (
                    <div
                      onClick={() => handleNavClick('/host/dashboard')}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Mis Hospedajes
                    </div>
                  )}
                  {isAdmin && (
                    <div
                      onClick={() => handleNavClick('/admin/dashboard')}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Panel Administración
                    </div>
                  )}
                  <hr className="my-1 border-neutral-100 mx-2" />
                  <div
                    onClick={() => { closeAccountMenu(); handleLogout(); }}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  Crear Cuenta
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 space-y-1">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 mt-3 border-t border-neutral-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <img src={genericUserImage} alt="Perfil de usuario" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-medium text-neutral-700">{userName}</span>
                  </div>
                  <div
                    onClick={() => handleNavClick('/user/profile')}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Cuenta
                  </div>
                  <div
                    onClick={() => handleNavClick('/user/bookings')}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Mis Reservaciones
                  </div>
                  {isHost && (
                    <div
                      onClick={() => handleNavClick('/host/dashboard')}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Mis Hospedajes
                    </div>
                  )}
                  {isAdmin && (
                    <div
                      onClick={() => handleNavClick('/admin/dashboard')}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Panel Administración
                    </div>
                  )}
                  <Button fullWidth variant="outline" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button fullWidth variant="secondary" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                    Iniciar Sesión
                  </Button>
                  <Button fullWidth variant="primary" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                    Crear Cuenta
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
