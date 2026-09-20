import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:bg-white md:border-r md:border-neutral-200 md:overflow-y-auto z-30">
        <AdminSidebar />
      </aside>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 overflow-y-auto z-50 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <AdminSidebar onLinkClick={closeSidebar} />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-neutral-200 md:hidden">
        <div className="flex items-center h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 text-lg font-bold text-neutral-900">Panel Admin</span>
        </div>
      </div>

      <div className="md:ml-64">
        <div className="hidden md:block h-0" />
        <div className="md:hidden h-16" />
        <div className="p-4 md:p-8 pb-20">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
