import { NavLink } from 'react-router-dom';

const SidebarLink = ({ to, icon, label, badge, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        }`
      }
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge !== null && (
        <span className="flex-shrink-0">{badge}</span>
      )}
    </NavLink>
  );
};

export default SidebarLink;
