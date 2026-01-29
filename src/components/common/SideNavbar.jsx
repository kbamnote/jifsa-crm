import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdPayment, MdDashboard, MdEmail } from "react-icons/md";
import { FaBox, FaChevronDown, FaChevronUp, FaUserShield, FaUserTie } from "react-icons/fa";
import { LiaBusinessTimeSolid } from "react-icons/lia";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { TfiGallery } from "react-icons/tfi";
import { BiSolidVideos } from "react-icons/bi";
import { Users } from "lucide-react";
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
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  
  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "User");
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    navigate('/');
    setIsOpen(false);
  };

  const getDisabledItems = (role) => {
    const roleLower = role.toLowerCase();
    
    const disabledItems = {
      companies: false,
      jobImport: false,
      jobManagement: false,
      team: false,
      socialMedia: false,
      mailTracking: false,
      leadManagement: false,
      billingRecords: false,
      b2b: false,
      products: false,
      jifsa: false,
      elitebim: false,
      eeetechnologies: false
    };
    
    if (roleLower === "admin") {
      return disabledItems;
    }
    
    if (roleLower === "manager") {
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      return disabledItems;
    }
    
    if (roleLower === "counsellor") {
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      disabledItems.b2b = true;
      disabledItems.socialMedia = true;
      disabledItems.team = true;
      disabledItems.billingRecords = true;
      return disabledItems;
    }

    if (roleLower === "hr"){
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      disabledItems.b2b = true;
      disabledItems.socialMedia = true;
      disabledItems.team = true;
      disabledItems.billingRecords = true;
      disabledItems.leadManagement = true;
      return disabledItems;
    }
    
    if (roleLower === "sales") {
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      return disabledItems;
    }
    
    if (roleLower === "telecaller") {
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      disabledItems.leadManagement = true;
      disabledItems.billingRecords = true;
      disabledItems.mailTracking = true;
      disabledItems.team = true;
      disabledItems.b2b = true;
      disabledItems.socialMedia = true;
      // Enable EEETechnologies for telecaller
      disabledItems.products = false; // Enable Products dropdown for telecaller
      disabledItems.jifsa = true; // Keep individual product items disabled except EEE Technologies
      disabledItems.elitebim = true;
      disabledItems.eeetechnologies = false; // Enable EEE Technologies for telecaller
      return disabledItems;
    }
    
    if (roleLower === "marketing") {
      disabledItems.companies = true;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = true;
      disabledItems.team = true;
      disabledItems.mailTracking = true;
      disabledItems.leadManagement = true;
      disabledItems.billingRecords = true;
      disabledItems.b2b = true;
      disabledItems.products = true; // Disable Products dropdown for marketing
      disabledItems.jifsa = true; // Disable individual product items for marketing
      disabledItems.elitebim = true;
      disabledItems.eeetechnologies = true;
      return disabledItems;
    }
    
    if (roleLower === "developer" || roleLower === "analyst") {
      disabledItems.companies = false;
      disabledItems.jobImport = true;
      disabledItems.jobManagement = false; // Allow developers and analysts to view job management
      disabledItems.team = true;
      disabledItems.mailTracking = true;
      disabledItems.billingRecords = true;
      disabledItems.b2b = true;
      disabledItems.socialMedia = true;
      disabledItems.products = true; // Disable Products dropdown for developer/analyst
      disabledItems.jifsa = true; // Disable individual product items for developer/analyst
      disabledItems.elitebim = true;
      disabledItems.eeetechnologies = true;
      return disabledItems;
    }
    
    return disabledItems;
  };
  
  const disabledItems = getDisabledItems(userRole);
  
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      disabled: false,
    },
    {
      id: "products",
      name: "Products",
      icon: <FaBox className="w-5 h-5" />,
      isDropdown: true,
      disabled: disabledItems.products,
      subItems: [
        {
          id: "jifsa",
          name: "JIFSA",
          path: "/jifsa",
          image: jifsaImg,
          disabled: disabledItems.jifsa,
        },
        {
          id: "elitebim",
          name: "Elite BIM",
          path: "/bim",
          image: bimImg,
          disabled: disabledItems.elitebim,
        },
        {
          id: "eeetechnologies",
          name: "EEE Technologies",
          path: "/eee",
          image: eeeImg,
          disabled: disabledItems.eeetechnologies,
        },
      ],
    },
    {
      id: "billing-details",
      name: "Billing Records",
      path: "/billing-details",
      icon: <MdPayment className="w-5 h-5" />,
      disabled: disabledItems.billingRecords,
    },
    {
      id: "mail",
      name: "Email Campaign",
      icon: <MdEmail className="w-5 h-5" />,
      isDropdown: true,
      disabled: false,
      subItems: [
        {
          id: "compose",
          name: "Compose Email",
          path: "/mail",
          disabled: false,
        },
        {
          id: "tracking",
          name: "Mail Tracking",
          path: "/mail-track",
          disabled: disabledItems.mailTracking,
        },
      ],
    },
    {
      id: "leads",
      name: "Leads",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      isDropdown: true,
      disabled: false,
      subItems: [
        {
          id: "lead-management",
          name: "Lead Management",
          path: "/lead-management",
          disabled: disabledItems.leadManagement,
        },
        {
          id: "lead-assigned",
          name: "Lead Assigned",
          path: "/lead-assigned",
          disabled: false,
        }
      ],
    },
    {
      id: "team",
      name: "Team",
      path: "/team",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      disabled: disabledItems.team,
    },
    {
      id: "b2b",
      name: "B2B",
      path: "/b2b",
      icon: <LiaBusinessTimeSolid className="w-5 h-5" />,
      disabled: disabledItems.b2b,
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: <BiSolidVideos className="w-5 h-5" />,
      isDropdown: true,
      disabled: false,
      subItems: [
        {
          id: "social-media",
          name: "Social Media",
          path: "/social-media",
          disabled: disabledItems.socialMedia,
        },
        {
          id: "seo",
          name: "SEO Management",
          path: "/seo",
          disabled: false,
        },
        {
          id: "blog",
          name: "Blog Management",
          path: "/blog",
          disabled: false,
        }
      ],
    },
    {
      id: "intern-applied-data",
      name: "Intern Applications",
      path: "/intern-applied-data",
      icon: <Users className="w-5 h-5" />,
      disabled: false,
    },
    {
      id: "reports",
      name: "Reports",
      path: "/reports",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      disabled: false,
    },

    {
      id: "gallery&doucments",
      name: "Gallery & Docs",
      path: "/img-files",
      icon: <TfiGallery className="w-5 h-5" />,
      disabled: false,
    },
    {
      id: "companies",
      name: "Companies",
      icon: <FaBox className="w-5 h-5" />,
      isDropdown: true,
      disabled: disabledItems.companies,
      subItems: [
        {
          id: "job-import",
          name: "Job Import",
          path: "/company-import",
          disabled: disabledItems.jobImport,
        },
        {
          id: "job-management",
          name: "Job Management",
          path: "/job-management",
          disabled: disabledItems.jobManagement,
        }
      ],
    },
  ];

  const isProductActive = location.pathname === "/jifsa" || location.pathname === "/bim";
  const isMailActive = location.pathname === "/mail" || location.pathname === "/mail-track";
  const isLeadsActive = location.pathname === "/lead-management" || location.pathname === "/lead-assigned";
  const isMarketingActive = location.pathname === "/social-media" || location.pathname === "/seo" || location.pathname === "/blog";
  const isCompaniesActive = location.pathname === "/company-import" || location.pathname === "/job-management";

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:h-auto w-64 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src={logo} className="w-8 h-8 flex items-center justify-center" alt="Logo" />
            <h1 className="text-xl font-semibold text-gray-800">Elite-CRM</h1>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.isDropdown) {
              let isDropdownOpen, setDropdownOpen, isDropdownActive;
              
              if (item.id === "products") {
                isDropdownOpen = isProductOpen;
                setDropdownOpen = setIsProductOpen;
                isDropdownActive = isProductActive;
              } else if (item.id === "mail") {
                isDropdownOpen = isMailOpen;
                setDropdownOpen = setIsMailOpen;
                isDropdownActive = isMailActive;
              } else if (item.id === "leads") {
                isDropdownOpen = isLeadsOpen;
                setDropdownOpen = setIsLeadsOpen;
                isDropdownActive = isLeadsActive;
              } else if (item.id === "marketing") {
                isDropdownOpen = isMarketingOpen;
                setDropdownOpen = setIsMarketingOpen;
                isDropdownActive = isMarketingActive;
              } else if (item.id === "companies") {
                isDropdownOpen = isCompaniesOpen;
                setDropdownOpen = setIsCompaniesOpen;
                isDropdownActive = isCompaniesActive;
              }
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => !item.disabled && setDropdownOpen(!isDropdownOpen)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.disabled 
                        ? "text-gray-400 cursor-not-allowed opacity-50" 
                        : isDropdownActive 
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isDropdownActive ? "text-blue-600" : "text-gray-400"}>
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

                  {isDropdownOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isActive = location.pathname === subItem.path;
                        const isDisabled = subItem.disabled;
                        
                        if (isDisabled) {
                          return (
                            <div
                              key={subItem.id}
                              className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-gray-400 cursor-not-allowed opacity-50"
                            >
                              {subItem.image ? (
                                <img 
                                  src={subItem.image} 
                                  alt={subItem.name} 
                                  className="w-16 h-6 object-contain opacity-50"
                                />
                              ) : (
                                <div className="w-4 h-4"></div>
                              )}
                              <span className="font-medium text-sm">{subItem.name}</span>
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isActive 
                                ? "bg-blue-50 text-blue-700" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            }`}
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

            const isActive = location.pathname === item.path;
            const isDisabled = item.disabled;
            
            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 cursor-not-allowed opacity-50"
                >
                  <span className="text-gray-400">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200 hover:border-transparent transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-11 h-11 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                    <span className="text-white text-sm font-bold">{getInitials()}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
                    {getRoleIcon()}
                  </div>
                </div>

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