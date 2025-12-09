import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Sprout, MapPin, Calendar, Package, CheckCircle, XCircle, AlertTriangle, Droplets } from "lucide-react";

export default function PesticideHistory() {
  const farmerId = localStorage.getItem("farmerId");

  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gps, setGps] = useState({
    latitude: "",
    longitude: "",
  });

  const [form, setForm] = useState({
    farmer: farmerId,
    name: "",
    quantity: "",
    confirmation: "NO",
    deviceId: farmerId, // AUTO SET DEVICE ID
  });

  // Fetch Pesticides
  const fetchPesticides = async () => {
    try {
      const res = await api.get(`/pesticides/farmer/${farmerId}`);
      setPesticides(res.data.slice().reverse());
    } catch (err) {
      console.log("Error fetching pesticides:", err);
    }
    setLoading(false);
  };

  // Fetch User GPS Coordinates
  const fetchGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.log("GPS Permission Denied:", err);
          alert("Please allow location access for accurate pesticide tracking");
        }
      );
    } else {
      alert("Geolocation is not supported on this browser.");
    }
  };

  useEffect(() => {
    fetchPesticides();
    fetchGPS();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add Pesticide Entry
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        latitude: gps.latitude,
        longitude: gps.longitude,
      };

      await api.post("/pesticides", payload);

      alert("Pesticide added successfully!");
      fetchPesticides();

      setForm({
        farmer: farmerId,
        name: "",
        quantity: "",
        confirmation: "NO",
        deviceId: farmerId,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error adding pesticide");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
      YES: "bg-green-100 text-green-700 border-green-300",
      NO: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };

    const icons = {
      APPROVED: <CheckCircle className="w-4 h-4" />,
      PENDING: <AlertTriangle className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />,
      YES: <CheckCircle className="w-4 h-4" />,
      NO: <AlertTriangle className="w-4 h-4" />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 w-fit ${styles[status] || 'bg-green-100 text-green-700 border-green-300'}`}>
        {icons[status] || <AlertTriangle className="w-4 h-4" />}
        {status}
      </span>
    );
  };

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
              <Sprout className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Crop Pest Prediction System</h1>
                <p className="text-green-100 mt-1">Smart Agriculture • Pesticide Management</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Location Tracking Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{pesticides.length} Records</span>
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
        {/* FORM CARD */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Droplets className="w-7 h-7" />
              Add Pesticide Usage
            </h2>
            <p className="text-green-50 mt-1">Track and monitor pesticide application for better crop management</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  Pesticide Name
                </label>
                <input
                  name="name"
                  placeholder="Pesticide Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-green-600" />
                  Quantity (kg/l)
                </label>
                <input
                  name="quantity"
                  placeholder="Quantity (kg/l)"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Confirmation
                </label>
                <select
                  name="confirmation"
                  value={form.confirmation}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500">Latitude (Auto-detected)</label>
                <input
                  value={gps.latitude || "Fetching latitude..."}
                  readOnly
                  className="p-3 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-xl w-full cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500">Longitude (Auto-detected)</label>
                <input
                  value={gps.longitude || "Fetching longitude..."}
                  readOnly
                  className="p-3 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-xl w-full cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500">Device ID (Auto-set)</label>
                <input
                  value={form.deviceId}
                  readOnly
                  className="p-3 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-xl w-full cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleCreate(e);
              }}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Add Pesticide
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-7 h-7" />
              Your Pesticide Usage Records
            </h2>
            <p className="text-emerald-50 mt-1">Complete record of all pesticide applications</p>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading...</p>
              </div>
            ) : pesticides.length === 0 ? (
              <div className="text-center py-16">
                <Sprout className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No records found</p>
                <p className="text-gray-400 mt-2">Add your first entry using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Name</th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Quantity</th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Status</th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesticides.map((p, index) => (
                      <tr 
                        key={p._id} 
                        className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Droplets className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-semibold text-gray-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-700">{p.quantity}</span>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(p.process)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}