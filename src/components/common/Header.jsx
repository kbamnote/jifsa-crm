import React from "react";
import { Building2, Calendar, MoreVertical } from "lucide-react";
import logo from '../../assets/image.png'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Elite Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600">Client Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;