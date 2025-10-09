import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from '../../assets/image.png'
import jifsaImg from '../../assets/jifsa.png'
import bimImg from '../../assets/bim.png'

const SideNavbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token from cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Navigate to home page
    navigate('/');
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z"
          />
        </svg>
      ),
    },
    {
      id: "jifsa",
      name: "JIFSA",
      path: "/jifsa",
      image: jifsaImg,
    },
    {
      id: "elitebim",
      name: "Elite BIM",
      path: "/bim",
      image: bimImg,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-auto
          w-64 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={logo} className="w-8 h-8 flex items-center justify-center" alt="Logo" />
            <h1 className="text-xl font-semibold text-gray-800">Elite-CRM</h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }
                `}
              >
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-6 object-contain "
                  />
                ) : (
                  <span className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                    {item.icon}
                  </span>
                )}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">E</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Elite Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;