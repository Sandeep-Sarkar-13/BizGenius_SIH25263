import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Sprout, TrendingUp, Package, AlertTriangle, Calendar, Droplets, Activity, CheckCircle } from "lucide-react";

export default function Analytics() {
  const farmerId = localStorage.getItem("farmerId");
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalQuantity: 0,
  });

  // Fetch Pesticides
  const fetchPesticides = async () => {
    try {
      const res = await api.get(`/pesticides/farmer/${farmerId}`);
      const data = res.data;
      setPesticides(data);
      calculateStats(data);
    } catch (err) {
      console.log("Error fetching pesticides:", err);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const total = data.length;
    const approved = data.filter(p => p.process === "APPROVED" || p.confirmation === "YES").length;
    const pending = data.filter(p => p.process === "PENDING" || p.confirmation === "NO").length;
    const rejected = data.filter(p => p.process === "REJECTED").length;
    const totalQuantity = data.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);

    setStats({ total, approved, pending, rejected, totalQuantity });
  };

  useEffect(() => {
    fetchPesticides();
  }, []);

  // Prepare data for charts
  const getUsageByPesticide = () => {
    const usage = {};
    pesticides.forEach(p => {
      if (usage[p.name]) {
        usage[p.name] += parseFloat(p.quantity) || 0;
      } else {
        usage[p.name] = parseFloat(p.quantity) || 0;
      }
    });
    return Object.entries(usage).map(([name, quantity]) => ({
      name,
      quantity: parseFloat(quantity.toFixed(2))
    })).slice(0, 8);
  };

  const getStatusDistribution = () => {
    return [
      { name: "Approved", value: stats.approved, color: "#10b981" },
      { name: "Pending", value: stats.pending, color: "#f59e0b" },
      { name: "Rejected", value: stats.rejected, color: "#ef4444" },
    ].filter(item => item.value > 0);
  };

  const getMonthlyTrend = () => {
    const monthly = {};
    pesticides.forEach(p => {
      const date = new Date(p.date || Date.now());
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthly[month]) {
        monthly[month] += parseFloat(p.quantity) || 0;
      } else {
        monthly[month] = parseFloat(p.quantity) || 0;
      }
    });
    return Object.entries(monthly).map(([month, quantity]) => ({
      month,
      quantity: parseFloat(quantity.toFixed(2))
    })).slice(-6);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Farm Analytics Dashboard</h1>
                <p className="text-green-100 mt-1">Pesticide Usage Insights & Trends</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{stats.total} Total Records</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                <span>{stats.totalQuantity.toFixed(2)} kg/l Total Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Pesticides</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</h3>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Approved</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.approved}</h3>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</h3>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Usage</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalQuantity.toFixed(1)}</h3>
                <p className="text-gray-500 text-xs mt-1">kg/l</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pesticide Usage Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Usage by Pesticide</h2>
            </div>
            {getUsageByPesticide().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getUsageByPesticide()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [`${value} kg/l`, 'Quantity']}
                  />
                  <Bar dataKey="quantity" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Status Distribution of Pesticides</h2>
            </div>
            {getStatusDistribution().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Monthly Usage Trend</h2>
          </div>
          {getMonthlyTrend().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyTrend()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`${value} kg/l`, 'Quantity']}
                />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Pesticides Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Top Pesticides by Usage</h2>
          </div>
          {getUsageByPesticide().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Rank</th>
                    <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Pesticide Name</th>
                    <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Total Quantity</th>
                    <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {getUsageByPesticide().map((p, index) => (
                    <tr key={index} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600">
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-700">{p.quantity} kg/l</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(p.quantity / stats.totalQuantity * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {(p.quantity / stats.totalQuantity * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Sprout className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No pesticide data available</p>
              <p className="text-gray-400 mt-2">Add pesticide records to see analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}