import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Bell, X, AlertTriangle, Droplets, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";

export default function DashboardHome() {
  const farmerId = localStorage.getItem("farmerId");
  const [pendingPesticides, setPendingPesticides] = useState([]);
  const [soilData, setSoilData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch pending pesticides (confirmation: "NO")
  const fetchPendingPesticides = async () => {
    try {
      const res = await api.get(`/pesticides/farmer/${farmerId}`);
      const pending = res.data.filter(
        (p) => p.confirmation === "NO" && p.process== "PENDING"
      );
      setPendingPesticides(pending);
      
      // Show modal if there are pending items
      if (pending.length > 0) {
        setShowModal(true);
      }
    } catch (err) {
      console.log("Error fetching pesticides:", err);
    }
  };

  // Fetch soil data
  const fetchSoilData = async () => {
    try {
      const res = await api.get("/nutrients/soil/get");
      setSoilData(res.data.data);
    } catch (err) {
      console.log("Error fetching soil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pesticide confirmation
  const handleConfirm = async (pesticideId, action) => {
    try {
      await api.put(`/pesticides/${pesticideId}`, {
        confirmation: action === "approve" ? "YES" : "NO",
        process: action === "approve" ? "APPROVED" : "REJECTED",
      });
      
      // Refresh the list
      fetchPendingPesticides();
    } catch (err) {
      console.log("Error updating pesticide:", err);
      alert(err.response?.data?.message || "Failed to update pesticide");
    }
  };

  useEffect(() => {
    fetchPendingPesticides();
    fetchSoilData();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchPendingPesticides();
      fetchSoilData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Welcome to Your Dashboard</h1>
                <p className="text-green-100 mt-2">Monitor your farm's health and manage activities</p>
              </div>
              {pendingPesticides.length > 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="relative bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <Bell className="w-6 h-6" />
                  <span className="font-semibold">Notifications</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingPesticides.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pending Actions</p>
              <h3 className="text-2xl font-bold text-gray-800">{pendingPesticides.length}</h3>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Items requiring your confirmation</p>
        </div>

        {/* Soil Health */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Soil Moisture</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {soilData ? `${soilData.humidity || 0}%` : "N/A"}
              </h3>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Current soil moisture level</p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">System Status</p>
              <h3 className="text-2xl font-bold text-gray-800">Active</h3>
            </div>
          </div>
          <p className="text-gray-500 text-sm">All systems operational</p>
        </div>
      </div>

      {/* Soil Details Card */}
      {soilData && (
        <div className="max-w-7xl mx-auto mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Soil Readings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium">N (Nitrogen)</p>
                <p className="text-2xl font-bold text-gray-800">{soilData.nitrogen|| 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium">P (Phosphorus)</p>
                <p className="text-2xl font-bold text-gray-800">{soilData.phosphorus || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium">K (Potassium)</p>
                <p className="text-2xl font-bold text-gray-800">{soilData.potassium || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium">pH Level</p>
                <p className="text-2xl font-bold text-gray-800">{soilData.ph || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Pending Confirmations</h2>
                  <p className="text-white/90 text-sm">Review and approve pesticide applications</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {pendingPesticides.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium">All caught up!</p>
                  <p className="text-gray-400 mt-2">No pending confirmations at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPesticides.map((pesticide) => (
                    <div
                      key={pesticide._id}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{pesticide.name}</h3>
                            <p className="text-gray-600 text-sm">Quantity: {pesticide.quantity} kg/l</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-gray-600 text-xs font-medium mb-1">Device ID</p>
                          <p className="text-gray-800 font-semibold text-sm">{pesticide.deviceId}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-gray-600 text-xs font-medium mb-1">Status</p>
                          <p className="text-gray-800 font-semibold text-sm">{pesticide.process || "PENDING"}</p>
                        </div>
                      </div>

                      {pesticide.latitude && pesticide.longitude && (
                        <div className="bg-white/50 rounded-lg p-3 mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <p className="text-gray-700 text-sm">
                            Location: {pesticide.latitude.toFixed(4)}, {pesticide.longitude.toFixed(4)}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirm(pesticide._id, "approve")}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleConfirm(pesticide._id, "reject")}
                          className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}