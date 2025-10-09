import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideNavbar from "./SideNavbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar - Static, won't re-render on route change */}
        <SideNavbar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header - Static, won't re-render on route change */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex-1">
                <Header />
              </div>
            </div>
          </div>

          {/* Page Content - This will change based on route */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;