const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    link: 'btn-link',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass = size !== 'md' ? sizes[size] : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant]} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
