import React, { useState, useEffect } from "react";
import { Users, CheckCircle, Clock, Package, UserCheck, MessageSquare } from "lucide-react";
import { getSocialMediaPosts } from "../../utils/Api";

const StatsCard = ({ data }) => {
  const [socialMediaCount, setSocialMediaCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch social media posts count
  useEffect(() => {
    const fetchSocialMediaCount = async () => {
      try {
        const response = await getSocialMediaPosts();
        if (response.data && response.data.success) {
          setSocialMediaCount(response.data.data.length);
        }
      } catch (error) {
        console.error("Error fetching social media posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaCount();
  }, []);

  // Calculate statistics based on actual lead data
  const totalLeads = data.length;

  // Count by status
  const unreadLeads = data.filter(item => item.status === 'unread').length;
  const readLeads = data.filter(item => item.status === 'read').length;
  const interestedLeads = data.filter(item => item.status === 'interested').length;
  const notInterestedLeads = data.filter(item => item.status === 'not_interested').length;

  // Count by product
  const jifsaLeads = data.filter(item => 
    item.productCompany?.toLowerCase() === 'jifsa'
  ).length;

  const bimLeads = data.filter(item => 
    item.productCompany?.toLowerCase() === 'bim' || 
    item.productCompany?.toLowerCase() === 'elite-bim'
  ).length;

  // Count assigned leads
  const assignedLeads = data.filter(item => item.assignedTo).length;
  const unassignedLeads = totalLeads - assignedLeads;

  // Recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLeads = data.filter(item => {
    const itemDate = new Date(item.createdAt || item.date);
    return itemDate >= sevenDaysAgo;
  }).length;

  const statsData = [
    {
      title: "Total Leads",
      value: totalLeads,
      subtitle: `${unassignedLeads} unassigned`,
      icon: Users,
      bgGradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: recentLeads > 0 ? `+${recentLeads} this week` : null
    },
    {
      title: "Interested",
      value: interestedLeads,
      subtitle: `${Math.round((interestedLeads / totalLeads) * 100) || 0}% of total`,
      icon: CheckCircle,
      bgGradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: interestedLeads > 0 ? "Positive" : null
    },
    {
      title: "Pending Review",
      value: unreadLeads,
      subtitle: `${readLeads} already read`,
      icon: Clock,
      bgGradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: unreadLeads > 0 ? "Needs attention" : null
    },
    {
      title: "Total Post",
      value: loading ? "..." : socialMediaCount,
      subtitle: "Social media posts",
      icon: MessageSquare,
      bgGradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: socialMediaCount > 0 ? `${socialMediaCount} total posts` : null
    }
  ];

  const productStats = [
    {
      title: "JIFSA Leads",
      value: jifsaLeads,
      subtitle: `${Math.round((jifsaLeads / totalLeads) * 100) || 0}% of total`,
      icon: Package,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Elite BIM Leads",
      value: bimLeads,
      subtitle: `${Math.round((bimLeads / totalLeads) * 100) || 0}% of total`,
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Assigned",
      value: assignedLeads,
      subtitle: `${unassignedLeads} not assigned`,
      icon: UserCheck,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      title: "Not Interested",
      value: notInterestedLeads,
      subtitle: `${Math.round((notInterestedLeads / totalLeads) * 100) || 0}% of total`,
      icon: Clock,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}
            ></div>

            {/* Content */}
            <div className="relative p-6 pb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>

                <div
                  className={`${stat.iconBg} rounded-xl p-3 transform group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>

              {/* Trend indicator */}
              {stat.trend && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        stat.trend.includes("+") || stat.trend === "Positive"
                          ? "bg-green-500 animate-pulse"
                          : "bg-orange-500 animate-pulse"
                      }`}
                    ></div>
                    <span className="text-xs font-medium text-gray-600">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ FIXED Bottom accent bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.bgGradient} group-hover:h-2 transition-all duration-300`}
            ></div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-2"></div>
          Detailed Breakdown
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`${stat.iconBg} rounded-lg p-2 flex-shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 truncate">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Lead Status Distribution
          </h3>
          <span className="text-xs text-gray-500">
            {totalLeads} total
          </span>
        </div>

        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {unreadLeads > 0 && (
            <div
              className="bg-gray-400"
              style={{ width: `${(unreadLeads / totalLeads) * 100}%` }}
            ></div>
          )}
          {readLeads > 0 && (
            <div
              className="bg-blue-500"
              style={{ width: `${(readLeads / totalLeads) * 100}%` }}
            ></div>
          )}
          {interestedLeads > 0 && (
            <div
              className="bg-green-500"
              style={{ width: `${(interestedLeads / totalLeads) * 100}%` }}
            ></div>
          )}
          {notInterestedLeads > 0 && (
            <div
              className="bg-red-500"
              style={{ width: `${(notInterestedLeads / totalLeads) * 100}%` }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
