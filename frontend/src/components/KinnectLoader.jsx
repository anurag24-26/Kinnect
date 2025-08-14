// import '../components/KinnectLoader.css'
// KinnectLoader.jsx
const KinnectLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] text-black font-inter">
      {/* Logo / Title */}
      <h1 className="text-4xl font-extrabold text-center tracking-wide drop-shadow-lg animate-pulse">
        Kinnect is loading...
      </h1>

      {/* Loader Dots */}
      <div className="flex space-x-3 mt-6">
        <span className="loader-dot"></span>
        <span className="loader-dot animation-delay-200"></span>
        <span className="loader-dot animation-delay-400"></span>
      </div>
    </div>
  );
};

export default KinnectLoader;
