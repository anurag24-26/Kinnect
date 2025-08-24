import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MobileNavbar from "./MobileNavbar"; // 👈 your new component
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const Layout = () => {
  // Detect screen size
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="min-h-screen bg-[#16161A] text-[#FFFFFE] font-inter flex flex-col">
      <div className="flex flex-1">
        {/* Left Sidebar (desktop only) */}
        {!isMobile && (
          <aside className="hidden md:block w-[220px] lg:w-[240px] border-r border-gray-700">
            <LeftSidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Right Sidebar (desktop only) */}
        {!isMobile && (
          <aside className="hidden lg:block w-[300px] border-l border-gray-700">
            <RightSidebar />
          </aside>
        )}
      </div>

      {/* Mobile Navbar */}
      {isMobile && <MobileNavbar />}
    </div>
  );
};

export default Layout;
