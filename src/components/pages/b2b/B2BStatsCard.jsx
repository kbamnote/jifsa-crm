import React from 'react';
import { FaBuilding, FaUser, FaChartLine, FaClock } from 'react-icons/fa';

const B2BStatsCard = ({ data = [] }) => {
  // Calculate statistics
  const totalRecords = data.length;
  const activeRecords = data.filter(item => item.status === 'active').length;
  const pendingRecords = data.filter(item => item.status === 'pending').length;
  
  // Calculate records added in the last 7 days
  const recentRecords = data.filter(item => {
    const createdDate = new Date(item.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Records */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <FaBuilding className="w-4 h-4" /> Total Records
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalRecords}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaBuilding className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Active Records */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <FaChartLine className="w-4 h-4" /> Active Records
            </p>
            <p className="text-3xl font-bold text-green-600 mt-1">{activeRecords}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FaChartLine className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Pending Records */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <FaClock className="w-4 h-4" /> Pending Records
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingRecords}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FaClock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <FaUser className="w-4 h-4" /> Recent (7 days)
            </p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{recentRecords}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg">
            <FaUser className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BStatsCard;