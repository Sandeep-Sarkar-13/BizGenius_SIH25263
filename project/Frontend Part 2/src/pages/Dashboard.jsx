import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Home, BarChart3, TrendingUp, Bug, User, MapPin, Sprout, Layers, History, Menu, X, IndianRupee } from "lucide-react";

export default function Dashboard() {
  const farmerId = localStorage.getItem("farmerId");
  const [farmer, setFarmer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await api.get(`/farmers/${farmerId}`);
        setFarmer(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFarmer();
  }, [farmerId]);

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/dashboard/yieldprediction", icon: TrendingUp, label: "Yield Prediction" },
    { path: "/dashboard/pestprediction", icon: Bug, label: "Pest Prediction" },
    { path: "/dashboard/pesthistory", icon: History, label: "Pest History" },
    { path: "/dashboard/cropinsurance", icon: IndianRupee , label: "Crop Insurance" }
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-1/5 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">FarmEasy</h1>
          </div>
          <p className="text-gray-400 text-sm">Smart Crop Management System</p>
        </div>

        {/* Farmer Info Card */}
        {farmer && (
          <div className="m-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white truncate">{farmer.name}</h2>
                <p className="text-green-100 text-xs truncate">ID: {farmerId.slice(0, 12)}...</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-green-50">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{farmer.village}</span>
              </div>
              <div className="flex items-center gap-2 text-green-50">
                <Sprout className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">Crop: {farmer.crop}</span>
              </div>
              <div className="flex items-center gap-2 text-green-50">
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Farm: {farmer.farmAcres} acres</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            © 2024 Crop Pest Prediction
          </p>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 bg-gray-50 overflow-y-auto w-full lg:w-4/5">
        <Outlet />
      </div>
    </div>
  );
}