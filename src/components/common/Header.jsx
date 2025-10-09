import React from "react";
import { Building2, Calendar, MoreVertical } from "lucide-react";
import logo from '../../assets/image.png'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src={logo} className="w-10 h-10 flex items-center justify-center">
              
              </img>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Elite Dashboard</h1>
                <p className="text-sm text-gray-600">Client Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-IN')}</span>
            </div>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;