export default function Button({ children, variant = "primary", className = "", ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gold text-brown-dark hover:bg-gold-dark focus:ring-gold",
    secondary: "bg-brown text-cream hover:bg-brown-light focus:ring-brown",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    ghost: "bg-transparent text-brown hover:bg-cream-dark focus:ring-brown",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
