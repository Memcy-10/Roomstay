const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  autoComplete,
  className = '',
  icon,
  ...props
}) => {
  const showError = touched && error;

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="label-field">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{icon}</span>
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={(e) => onChange && onChange(name, e.target.value)}
          onBlur={() => onBlur && onBlur(name)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`input-field ${showError ? 'input-field-error' : ''} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
        {maxLength && (
          <span className="absolute right-2 bottom-2 text-xs text-neutral-400">
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>
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

export default Input;
