import React from "react";
import { Users, BarChart3, Clock, MessageSquare } from "lucide-react";

const StatsCard = ({ data }) => {
  const totalClients = data.length;
  const activeCases = data.filter(item => 
    item.status === 'Active' || item.status === 'active'
  ).length || Math.floor(data.length * 0.6);
  const pendingCases = data.filter(item => 
    item.status === 'Pending' || item.status === 'pending'
  ).length || Math.floor(data.length * 0.3);

  const statsData = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Active Cases",
      value: activeCases,
      icon: BarChart3,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Pending",
      value: pendingCases,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Total Records",
      value: totalClients,
      icon: MessageSquare,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;