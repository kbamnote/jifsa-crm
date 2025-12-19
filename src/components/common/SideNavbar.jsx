import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdPayment, MdDashboard, MdEmail } from "react-icons/md";
import { FaBox, FaChevronDown, FaChevronUp, FaUserShield, FaUserTie } from "react-icons/fa";
import { LiaBusinessTimeSolid } from "react-icons/lia";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { TfiGallery } from "react-icons/tfi";
import { BiSolidVideos } from "react-icons/bi"; // Add this import for social media icon
import { Users } from "lucide-react"; // Add this import for lead management icon
import Cookies from "js-cookie";
import logo from '../../assets/image.png';
import jifsaImg from '../../assets/jifsa.png';
import bimImg from '../../assets/bim.png';
import eeeImg from '../../assets/eee.png'

const SideNavbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Get role from cookies
    const role = Cookies.get("role");
    setUserRole(role || "User");
  }, []);

  const handleLogout = () => {
    // Remove token and role from cookies
    Cookies.remove("token");
    Cookies.remove("role");
    // Navigate to home page
    navigate('/');
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      id: "products",
      name: "Products",
      icon: <FaBox className="w-5 h-5" />,
      isDropdown: true,
      subItems: [
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
        {
          id: "eeetechnologies",
          name: "EEE Technologies",
          path: "/eee",
          image: eeeImg,
        },
      ],
    },
    {
      id: "billing-details",
      name: "Billing Records",
      path: "/billing-details",
      icon: <MdPayment className="w-5 h-5" />,
    },
    {
      id: "mail",
      name: "Email Campaign",
      icon: <MdEmail className="w-5 h-5" />,
      isDropdown: true,
      subItems: [
        {
          id: "compose",
          name: "Compose Email",
          path: "/mail",
        },
        // Only show Mail Tracking for admin users
        ...(userRole.toLowerCase() === "admin" 
          ? [{
              id: "tracking",
              name: "Mail Tracking",
              path: "/mail-track",
            }]
          : []
        ),
      ],
    },
    // Show Lead Assigned to all non-admin/manager users
    {
      id: "lead-assigned",
      name: "Lead Assigned",
      path: "/lead-assigned",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
    },
    // Show Lead Management for admin, manager, counselor, and telecaller users
    ...(['admin', 'manager', 'counsellor', 'telecaller'].includes(userRole.toLowerCase()) 
      ? [{
          id: "lead-management",
          name: "Lead Management",
          path: "/lead-management",
          icon: <Users className="w-5 h-5" />,
        }]
      : []
    ),
    // Show Team only for admin and manager users
    ...(['admin', 'manager'].includes(userRole.toLowerCase()) 
      ? [{
          id: "team",
          name: "Team",
          path: "/team",
          icon: <HiOutlineUserGroup className="w-5 h-5" />,
        }]
      : []
    ),
    {
      id: "b2b",
      name: "B2B",
      path: "/b2b",
      icon: <LiaBusinessTimeSolid className="w-5 h-5" />,
    },
    // Add Social Media item - visible to marketing, manager, sales, and admin users
    ...(['marketing', 'manager', 'sales', 'admin'].includes(userRole.toLowerCase()) 
      ? [{
          id: "social-media",
          name: "Social Media",
          path: "/social-media",
          icon: <BiSolidVideos className="w-5 h-5" />,
        }]
      : []
    ),
    {
      id: "gallery&doucments",
      name: "Gallery & Docs",
      path: "/img-files",
      icon: <TfiGallery className="w-5 h-5" />,
    },
    {
      id: "companies",
      name: "Companies",
      icon: <FaBox className="w-5 h-5" />,
      isDropdown: true,
      subItems: [
        {
          id: "job-import",
          name: "Job Import",
          path: "/company-import",
        },
        {
          id: "job-management",
          name: "Job Management",
          path: "/job-management",
        }
      ],
    },
  ];

  const isProductActive = location.pathname === "/jifsa" || location.pathname === "/bim";
  const isMailActive = location.pathname === "/mail" || location.pathname === "/mail-track";

  // Get display name and avatar based on role
  const getDisplayName = () => {
    if (userRole.toLowerCase().includes("admin")) return "Elite Admin";
    if (userRole.toLowerCase().includes("sales")) return "Elite Sales";
    return "Elite User";
  };

  const getRoleDisplay = () => {
    if (userRole.toLowerCase().includes("admin")) return "Administrator";
    if (userRole.toLowerCase().includes("sales")) return "Sales Manager";
    return userRole || "User";
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(word => word[0]).join('');
  };

  const getRoleIcon = () => {
    if (userRole.toLowerCase().includes("admin")) {
      return <FaUserShield className="w-4 h-4 text-white" />;
    }
    if (userRole.toLowerCase().includes("sales")) {
      return <FaUserTie className="w-4 h-4 text-white" />;
    }
    return <FaUserTie className="w-4 h-4 text-white" />;
  };

  const getGradient = () => {
    if (userRole.toLowerCase().includes("admin")) {
      return "from-blue-500 via-indigo-500 to-purple-600";
    }
    if (userRole.toLowerCase().includes("sales")) {
      return "from-emerald-500 via-teal-500 to-cyan-600";
    }
    return "from-purple-500 to-red-500";
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-20 lg:hidden"
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
        <nav className="flex-1  py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.isDropdown) {
              const isDropdownOpen = item.id === "products" ? isProductOpen : isMailOpen;
              const setDropdownOpen = item.id === "products" ? setIsProductOpen : setIsMailOpen;
              const isDropdownActive = item.id === "products" ? isProductActive : isMailActive;
              
              return (
                <div key={item.id}>
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        isDropdownActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`${isDropdownActive ? "text-blue-600" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isDropdownOpen ? (
                      <FaChevronUp className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {isDropdownOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                              w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              }
                            `}
                          >
                            {subItem.image ? (
                              <img 
                                src={subItem.image} 
                                alt={subItem.name} 
                                className="w-16 h-6 object-contain"
                              />
                            ) : (
                              <div className="w-4 h-4"></div>
                            )}
                            <span className="font-medium text-sm">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu items
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
                <span className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Enhanced Profile & Logout Section */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Profile Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200 hover:border-transparent transition-all duration-300">
              <div className="flex items-center space-x-3">
                {/* Avatar with role icon */}
                <div className="relative">
                  <div className={`w-11 h-11 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                    <span className="text-white text-sm font-bold">{getInitials()}</span>
                  </div>
                  {/* Role badge */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
                    {getRoleIcon()}
                  </div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {getDisplayName()}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className={`w-1.5 h-1.5 bg-gradient-to-r ${getGradient()} rounded-full animate-pulse`}></div>
                    <p className="text-xs font-medium text-gray-600 truncate">
                      {getRoleDisplay()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full group relative overflow-hidden flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <svg
              className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-300"
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
            <span className="font-semibold relative z-10">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;