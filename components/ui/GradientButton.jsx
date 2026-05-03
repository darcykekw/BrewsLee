'use client';

export default function GradientButton({
  children,
  onClick,
  href,
  type = 'button',
  className = '',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}) {
  const variants = {
    // Primary — gold gradient (main CTA buttons)
    primary: {
      base: 'linear-gradient(45deg, #8C5A3C, #C08552)',
      hover: 'linear-gradient(45deg, #C08552, #DBA84E)',
    },
    // Secondary — dark brown gradient (secondary actions)
    secondary: {
      base: 'linear-gradient(45deg, #4B2E2B, #6B3F3C)',
      hover: 'linear-gradient(45deg, #6B3F3C, #8C5A3C)',
    },
    // Danger — deep red-brown (cancel, delete, destructive)
    danger: {
      base: 'linear-gradient(45deg, #6B2D2D, #8C3A3A)',
      hover: 'linear-gradient(45deg, #8C3A3A, #A84444)',
    },
    // Ghost — transparent with gold border (outlined buttons)
    ghost: {
      base: 'transparent',
      hover: 'linear-gradient(45deg, #8C5A3C, #C08552)',
    },
  };

  const selected = variants[variant] || variants.primary;

  const style = `
    .gradient-btn-${variant} {
      min-width: 120px;
      height: 42px;
      color: #FFF8F0;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      outline: none;
      border-radius: 25px;
      border: ${variant === 'ghost' ? '1px solid #C08552' : 'none'};
      background: ${selected.base};
      box-shadow: 0 4px 12px rgba(75, 46, 43, 0.3);
      z-index: 1;
      overflow: hidden;
      padding: 0 20px;
      font-weight: 600;
      font-size: 0.875rem;
      letter-spacing: 0.01em;
      ${fullWidth ? 'width: 100%;' : ''}
      ${disabled ? 'opacity: 0.5; cursor: not-allowed; pointer-events: none;' : ''}
    }
    .gradient-btn-${variant}:before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        rgba(255, 248, 240, 0.12),
        rgba(255, 248, 240, 0)
      );
      transform: rotate(45deg);
      transition: all 0.5s ease;
      z-index: -1;
    }
    .gradient-btn-${variant}:hover:before {
      top: -100%;
      left: -100%;
    }
    .gradient-btn-${variant}:after {
      border-radius: 25px;
      position: absolute;
      content: '';
      width: 0;
      height: 100%;
      top: 0;
      z-index: -1;
      box-shadow:
        inset 2px 2px 2px 0px rgba(255, 248, 240, 0.2),
        7px 7px 20px 0px rgba(75, 46, 43, 0.15),
        4px 4px 5px 0px rgba(75, 46, 43, 0.1);
      transition: all 0.3s ease;
      background: ${selected.hover};
      right: 0;
    }
    .gradient-btn-${variant}:hover:after {
      width: 100%;
      left: 0;
    }
    .gradient-btn-${variant}:active {
      top: 2px;
      box-shadow: 0 2px 6px rgba(75, 46, 43, 0.25);
    }
    .gradient-btn-${variant} span {
      position: relative;
      z-index: 2;
    }
  `;

  const injectedStyle = <style dangerouslySetInnerHTML={{ __html: style }} />;

  if (href) {
    return (
      <a
        href={href}
        className={`gradient-btn-${variant} ${className}`}
      >
        {injectedStyle}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`gradient-btn-${variant} ${className}`}
    >
      {injectedStyle}
      <span>{children}</span>
    </button>
  );
}
