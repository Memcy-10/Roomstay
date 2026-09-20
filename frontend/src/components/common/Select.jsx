const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  touched,
  required = false,
  disabled = false,
  placeholder = 'Selecciona una opción',
  className = '',
}) => {
  const showError = touched && error;
  // Usar el valor directamente; si es undefined/null usar ''
  const selectValue = value !== undefined && value !== null ? value : '';

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="label-field">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={selectValue}
        onChange={(e) => onChange && onChange(name, e.target.value)}
        onBlur={() => onBlur && onBlur(name)}
        disabled={disabled}
        className={`select-field ${showError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {showError && (
        <p className="error-message">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
