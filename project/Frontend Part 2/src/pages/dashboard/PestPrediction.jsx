import { useState } from "react";
import { api } from "../../services/api";
import {
  Bug,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Droplets,
  MapPin,
  Package,
  Info,
} from "lucide-react";

export default function PestDetection() {
  const farmerId = localStorage.getItem("farmerId");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [addingPesticide, setAddingPesticide] = useState(false);
  const [success, setSuccess] = useState(false);

  const [gps, setGps] = useState({
    latitude: "",
    longitude: "",
  });

  // Fetch GPS on component mount
  useState(() => {
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
          // Set default coordinates if GPS fails
          setGps({
            latitude: 28.4588856,
            longitude: 77.2958126,
          });
        }
      );
    } else {
      // Set default coordinates if geolocation not supported
      setGps({
        latitude: 28.4588856,
        longitude: 77.2958126,
      });
    }
  }, []);

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    const previewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreview(previewUrl);
    setPrediction(null);
    setError(null);
    setSuccess(false);

    // --------------------------
    // ✅ Save the image as a link in localStorage
    // --------------------------
    localStorage.setItem("lastPestImage", previewUrl);
  }
};


  const handlePrediction = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "https://pesticidefastapi.onrender.com/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      // --------------------------
      // ✅ Store prediction in localStorage
      // --------------------------
      localStorage.setItem("lastPestPrediction", JSON.stringify(data));
      // --------------------------

      setPrediction(data);
    } catch (err) {
      setError(err.message || "Failed to predict pest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPesticide = async () => {
    if (!prediction) return;

    setAddingPesticide(true);
    setError(null);

    try {
      // Extract pesticide name and quantity from prediction
      const pesticideName = prediction.pesticide;
      const quantityKey = Object.keys(prediction.acre_dose)[0];
      const quantity = prediction.acre_dose[quantityKey];

      const payload = {
        farmer: farmerId,
        deviceId: farmerId,
        name: pesticideName,
        quantity: quantity.toString(),
        confirmation: "NO",
        latitude: gps.latitude || 28.4588856,
        longitude: gps.longitude || 77.2958126,
      };

      await api.post("/pesticides", payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add pesticide record");
    } finally {
      setAddingPesticide(false);
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
              <Bug className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">
                  AI-Powered Pest Detection
                </h1>
                <p className="text-green-100 mt-1">
                  Upload crop images for instant pest identification & treatment
                  recommendations
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>
                  Location:{" "}
                  {gps.latitude
                    ? `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`
                    : "Detecting..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span>ML-Powered Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Upload className="w-7 h-7" />
                Upload Crop Image
              </h2>
              <p className="text-green-50 mt-1">
                Select an image of your affected crop
              </p>
            </div>

            <div className="p-8">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-500 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        setPrediction(null);
                        setError(null);
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                {!preview && (
                  <label
                    htmlFor="file-upload"
                    className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    Select Image
                  </label>
                )}
              </div>

              <button
                onClick={handlePrediction}
                disabled={!selectedFile || loading}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  !selectedFile || loading
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
                    <Bug className="w-5 h-5" />
                    Detect Pest
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-medium">
                    Pesticide record added successfully!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Bug className="w-7 h-7" />
                Detection Results
              </h2>
              <p className="text-emerald-50 mt-1">
                AI-powered pest identification & treatment
              </p>
            </div>

            <div className="p-8">
              {!prediction && !loading && (
                <div className="text-center py-16">
                  <Bug className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No predictions yet
                  </p>
                  <p className="text-gray-400 mt-2">
                    Upload an image to detect pests
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">
                    Analyzing your crop image...
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    This may take a few seconds
                  </p>
                </div>
              )}

              {prediction && (
                <div className="space-y-6">
                  {/* Pest Detection */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <Bug className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Detected Pest
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {prediction.predicted_pest}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Confidence
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Pesticide */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplets className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">
                        Recommended Treatment
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-sm font-medium text-gray-600">
                          Pesticide
                        </span>
                        <span className="text-base font-bold text-gray-800">
                          {prediction.pesticide}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-sm font-medium text-gray-600">
                          Dosage (per acre)
                        </span>
                        <span className="text-base font-bold text-green-600">
                          {Object.values(prediction.acre_dose)[0]} ml
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-sm font-medium text-gray-600">
                          Water (per acre)
                        </span>
                        <span className="text-base font-bold text-blue-600">
                          {prediction.water_liters_per_acre} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">
                          Mini Farm Dose
                        </span>
                        <span className="text-base font-bold text-gray-800">
                          {Object.values(prediction.mini_farm_dose)[0].toFixed(
                            4
                          )}{" "}
                          ml
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Records Button */}
                  <button
                    onClick={handleAddPesticide}
                    disabled={addingPesticide}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                      addingPesticide
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    }`}
                  >
                    {addingPesticide ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding to Records...
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5" />
                        Add to Pesticide Records
                      </>
                    )}
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">
                        Application Instructions
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600">
                        <li>Apply during early morning or late evening</li>
                        <li>Ensure proper coverage on affected areas</li>
                        <li>
                          Follow safety guidelines and wear protective equipment
                        </li>
                        <li>Wait for recommended period before harvest</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
