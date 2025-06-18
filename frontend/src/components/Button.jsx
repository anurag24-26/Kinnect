const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
}) => {
  const styles = {
    primary: "bg-cyan-500 hover:bg-cyan-600 text-white",
    secondary:
      "bg-white/10 border border-white/30 text-white hover:bg-white/20",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold text-sm transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
