import { useState } from "react";
import {
  Sprout,
  TrendingUp,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Layers,
  Calculator,
  Package,
} from "lucide-react";

export default function YieldPrediction() {
  const [form, setForm] = useState({
    farm_area_m2: "",
    row_spacing: "",
    plant_spacing: "",
    paddy_type: "Hybrid",
  });
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  const pestInfo = JSON.parse(
    localStorage.getItem("lastPestPrediction") || "{}"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch soil sensor data
      const soilResponse = await fetch(
        "https://sih-backend-dsue.onrender.com/api/nutrients/soil/get"
      );
      if (!soilResponse.ok) {
        throw new Error("Failed to fetch soil data");
      }
      const soilData = await soilResponse.json();

      // Get pest image URL from localStorage
      let pestImageUrl = localStorage.getItem("lastPestImage") || "";
      if (pestImageUrl.startsWith("blob:")) {
        pestImageUrl = pestImageUrl.replace("blob:", "");
      }

      // Build payload
      const payload = {
        farm_area_m2: parseFloat(form.farm_area_m2),
        row_spacing: parseFloat(form.row_spacing),
        plant_spacing: parseFloat(form.plant_spacing),
        pest_image_url: pestImageUrl,
        paddy_type: form.paddy_type,
        soil_sensor_values: {
          Moisture_percent: soilData.data.humidity,
          Temperature_C: soilData.data.temperature,
          EC_uS_cm: soilData.data.conductivity,
          pH: soilData.data.ph,
          N_mg_per_kg: soilData.data.nitrogen,
          P_mg_per_kg: soilData.data.phosphorus,
          K_mg_per_kg: soilData.data.potassium,
        },
      };

      const response = await fetch(
        "https://yieldapi-2wv7.onrender.com/analyze-damage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze yield. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Crop Yield Prediction</h1>
                <p className="text-green-100 mt-1">
                  AI-Powered Yield Analysis & Damage Assessment
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Farm Location Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <span>Precision Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Layers className="w-7 h-7" />
                Farm Parameters
              </h2>
              <p className="text-green-50 mt-1">
                Enter your farm details for yield analysis
              </p>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-green-600" />
                    Farm Area (m²)
                  </label>
                  <input
                    type="number"
                    name="farm_area_m2"
                    placeholder="e.g., 10000"
                    value={form.farm_area_m2}
                    onChange={handleChange}
                    step="0.01"
                    className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Total farm area in square meters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    Row Spacing (m)
                  </label>
                  <input
                    type="number"
                    name="row_spacing"
                    placeholder="e.g., 0.25"
                    value={form.row_spacing}
                    onChange={handleChange}
                    step="0.01"
                    className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Distance between crop rows in meters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    Plant Spacing (m)
                  </label>
                  <input
                    type="number"
                    name="plant_spacing"
                    placeholder="e.g., 0.25"
                    value={form.plant_spacing}
                    onChange={handleChange}
                    step="0.01"
                    className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500">
                    Distance between plants in meters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    Paddy Type
                  </label>
                  <select
                    name="paddy_type"
                    value={form.paddy_type}
                    onChange={handleChange}
                    className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Basmati">Basmati</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Select the type of paddy crop
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Soil sensor data will be
                    automatically fetched. Make sure you have uploaded a pest
                    image.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Analyze Yield
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-7 h-7" />
                Analysis Results
              </h2>
              <p className="text-emerald-50 mt-1">
                Yield predictions and damage assessment
              </p>
            </div>

            <div className="p-8">
              {!result && !loading && (
                <div className="text-center py-16">
                  <Sprout className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No analysis yet
                  </p>
                  <p className="text-gray-400 mt-2">
                    Enter farm parameters to predict yield
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">
                    Analyzing crop yield...
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Processing damage polygons and farm data
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Analysis Complete
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                          Yield Prediction Ready
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Farm Area
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {result.farm_area_m2 || form.farm_area_m2} m²
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sprout className="w-5 h-5 text-purple-600" />
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Total Plants
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {result.total_plants?.toFixed(2) || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Damaged Plants
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {result.lost_plants?.toFixed(2) || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-xs font-semibold text-gray-600 uppercase">
                          Healthy Plants
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {result.remaining_plants?.toFixed(2) || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Yield Prediction */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-800">
                        Expected Yield
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                        <span className="text-sm font-medium text-gray-600">
                          Predicted Yield
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {result.yield_prediction.predicted_yield_kg
                            ? `${result.yield_prediction.predicted_yield_kg.toFixed(
                                2
                              )} kg`
                            : "N/A"}
                        </span>
                      </div>
                      {/* Damage Percentage */}
                      <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                        <span className="text-sm font-medium text-gray-600">
                          Damage Percentage
                        </span>

                        {(() => {
                          const dmg = (
                            (result.lost_plants * 100) /
                            result.total_plants
                          ).toFixed(2);
                          let color = "";
                          let action = null;

                          if (dmg <= 10) {
                            color = "text-green-600";

                            action = (
                              <button
                                onClick={() => setShowPestModal(true)}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md mt-1"
                              >
                                View Pest Insights
                              </button>
                            );
                          } else if (dmg > 10 && dmg <= 33) {
                            color = "text-yellow-600";

                            action = (
                              <button
                                onClick={() => setShowPestModal(true)}
                                className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md mt-1"
                              >
                                View Pest Details
                              </button>
                            );
                          } else {
                            color = "text-red-600";

                            action = (
                              <button
                                onClick={() => setShowInsuranceModal(true)}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md mt-1"
                              >
                                Claim Insurance
                              </button>
                            );
                          }

                          return (
                            <div className="flex flex-col items-end">
                              <span className={`text-lg font-bold ${color}`}>
                                {dmg}%
                              </span>
                              {action}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">
                          Yield per m²
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {(
                            result.yield_prediction.predicted_yield_kg /
                            result.farm_area_m2
                          ).toFixed(2)}{" "}
                          kg/m²
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {result.damage_details && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-gray-700 mb-3">
                        Damage Details
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {Object.entries(result.damage_details).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="font-semibold">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Recommendations</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600">
                        <li>Monitor damaged areas regularly</li>
                        <li>Apply targeted pest control in affected zones</li>
                        <li>Consider crop rotation for next season</li>
                        <li>Optimize irrigation in healthy areas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Insurance Modal */}
      {showInsuranceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2 text-red-600">
              Claim Insurance
            </h3>
            <p className="text-gray-600 mb-4">
              Significant crop loss detected due to pest damage. Do you want to
              proceed with the insurance claim?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInsuranceModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  (window.location.href = "/dashboard/cropinsurance")
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Claim
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pest Details Modal */}
{showPestModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-7 rounded-xl shadow-xl max-w-md w-full">

      <h3 className="text-xl font-bold text-green-600 mb-2">
        Pest Detection Insights
      </h3>

      <p className="text-gray-700 mb-4">
        These insights are based on your uploaded pest image and soil conditions.
      </p>

      <div className="space-y-2 text-gray-700 text-sm">
        <p><strong>Pest Detected:</strong> {pestInfo.predicted_pest || "N/A"}</p>
        <p><strong>Confidence:</strong> {(pestInfo.confidence * 100).toFixed(2)}%</p>
        <p><strong>Pesticide:</strong> {pestInfo.pesticide || "N/A"}</p>
        <p><strong>Mini Farm Dose:</strong> {JSON.stringify(pestInfo.mini_farm_dose)}</p>
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={() => setShowPestModal(false)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
