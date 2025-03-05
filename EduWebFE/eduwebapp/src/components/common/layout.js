import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { MobileSidebar } from "./mobile_sidebar";
import { Sidebar } from "./sidebar";
import Footer from "../footer/footer";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);

  const isDetailPage =
    location.pathname.startsWith("/stuwall/course/") ||
    location.pathname.startsWith(
      "/stuwall/course/:courseId/chapter/:chapterId"
    );

  return (
    <div className="h-screen flex">
      {!isDetailPage && (
        <div className="w-full fixed top-0 z-50">
          <Navbar onSidebarToggle={handleSidebarToggle} />
        </div>
      )}

      {!isDetailPage && (
        <div
          className={`fixed top-[80px] ${
            isSidebarOpen ? "w-56" : "w-0"
          } h-[calc(100%-80px)] flex-col z-40 transition-all duration-300 hidden md:flex`}
        >
          <Sidebar />
        </div>
      )}

      <div
        className={`flex-1 ${!isDetailPage ? "mt-[80px]" : "mt-0"} ${
          isSidebarOpen && !isDetailPage ? "ml-56" : "ml-0"
        } transition-all duration-300 min-h-screen`}
      >
        <Outlet />
        {!isDetailPage && <Footer />}
      </div>

      {!isDetailPage && (
        <MobileSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
      )}
    </div>
  );
};

export default Layout;
