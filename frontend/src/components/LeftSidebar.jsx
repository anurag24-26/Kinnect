import { Link, useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlinePlusCircle } from "react-icons/ai";
import { FaUserCircle, FaCog, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { BiMessageDetail, BiCompass } from "react-icons/bi"; // ✅ BiCompass for Explore
import Logo from "../assets/kinnectlogo.png";
import { useAuth } from "../contexts/AuthContexts";

const LeftSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Menu Item Component
  const menuItem = (icon, label, to, onClick) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gradient-to-r from-[#7F5AF0]/30 to-[#2CB67D]/30 transition shadow-sm"
    >
      {icon}
      <span className="text-sm font-medium hidden md:inline">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:flex flex-col justify-between fixed top-0 left-0 h-screen py-6 px-4 
                      bg-gradient-to-b from-[#15162A] via-[#16161A] to-[#20223B]/80 
                      w-[220px] lg:w-[250px] border-r border-gray-700">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <img
            src={Logo}
            alt="Kinnect"
            className="w-12 h-12 object-contain rounded-2xl border-0 border-[#7F5AF0]/30"
          />
          <span className="text-lg font-extrabold bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent hidden lg:inline">
            Kinnect
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          {menuItem(<AiFillHome className="text-xl text-[#7F5AF0]" />, "Home", "/")}
          {menuItem(<BiCompass className="text-xl text-[#2CB67D]" />, "Explore", "/explore")}
          
          {user && (
            <>
              {menuItem(<BiMessageDetail className="text-xl text-[#2CB67D]" />, "Chat", "/chat")}
              {menuItem(
                <AiOutlinePlusCircle className="text-xl text-white bg-gradient-to-tr from-[#7F5AF0] to-[#2CB67D] rounded-full p-1 shadow-md" />,
                "Create",
                "/create"
              )}
            </>
          )}
        </div>

        {/* Profile/User Controls */}
        <div className="flex flex-col gap-4 mt-6">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gradient-to-r from-[#7F5AF0]/30 to-[#2CB67D]/30 transition shadow-sm"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border-2 border-[#7F5AF0]/50"
                  />
                ) : (
                  <FaUserCircle className="text-xl text-[#2CB67D]" />
                )}
                <span className="text-sm font-semibold hidden md:inline">
                  {user.username || "Profile"}
                </span>
              </Link>
              {menuItem(<FaCog className="text-xl text-[#7F5AF0]" />, "Settings", "/settings")}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600/30 transition shadow-sm"
              >
                <FaSignOutAlt className="text-xl text-[#E63946]" />
                <span className="text-sm font-medium text-red-400 hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            menuItem(<FaSignInAlt className="text-xl text-[#7F5AF0]" />, "Login", "/login")
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1E1E24] border-t border-gray-700 flex justify-around py-2 z-50">
        <Link to="/" className="flex flex-col items-center text-sm">
          <AiFillHome className="text-xl" />
          <span>Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center text-sm">
          <BiCompass className="text-xl" />
          <span>Explore</span>
        </Link>

        {user && (
          <>
            <Link to="/chat" className="flex flex-col items-center text-sm">
              <BiMessageDetail className="text-xl" />
              <span>Chat</span>
            </Link>
            <Link to="/create" className="flex flex-col items-center text-sm">
              <AiOutlinePlusCircle className="text-xl" />
              <span>Create</span>
            </Link>
          </>
        )}

        {user ? (
          <Link to="/profile" className="flex flex-col items-center text-sm">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            ) : (
              <FaUserCircle className="text-xl" />
            )}
            <span>Me</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center text-sm">
            <FaSignInAlt className="text-xl" />
            <span>Login</span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default LeftSidebar;
