import { useEffect, useState } from "react";
import { api } from "../../services/api";
import policyData from "../../assets/data.json";

import {
  Shield,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sprout,
  FileText,
  IndianRupee,
} from "lucide-react";

export default function Insurance() {
  const disasterMap = {
    "Cyclone Damage": "Cyclone",
    "Flash Flood": "Flood",
    "Excess Rainfall": "Rainfall Loss",
    "Stem Borer Infestation": "Pest Attack",
    Hailstorm: "Other",
    "Nutrient Deficiency": "Disease",
    "Sheath Blight": "Disease",

    // Already valid ones fallback automatically
  };

  const stageMap = {
    Tillering: "Vegetative",
    Seedling: "Sowing",
    "Panicle Initiation": "Vegetative",
    Flowering: "Flowering",
    Maturity: "Harvesting",
    Heading: "Grain Filling",
    Ripening: "Grain Filling",
    Booting: "Vegetative",

    // Already valid ones fallback automatically
  };

  const farmerId = localStorage.getItem("farmerId");

  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    farmer: farmerId,
    policyNumber: "",
    crop: "",
    sowingDate: "",
    fieldArea: "",
    areaUnit: "acre",
    premiumAmount: "",
    insuredAmount: "",
    estimatedYield: "",
    disasterType: "Other",
    cropStageAtLoss: "Sowing",

    // ⭐ 5 NEW FIELDS
    damagePercent: "",
    farmerExpenditure: "",
    marketPricePerTon: "",
    inspectionReport: "",
    claimAmountRequested: "",
  });

  // Fetch Insurance Policies
  const fetchInsurances = async () => {
    try {
      const res = await api.get(`/insurance`);
      const farmerPolicies = res.data.filter(
        (ins) => ins.farmer === farmerId || ins.farmer._id === farmerId
      );
      setInsurances(farmerPolicies.reverse());
    } catch (err) {
      console.log("Error fetching insurance policies:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add Insurance Policy
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        fieldArea: parseFloat(form.fieldArea),
        premiumAmount: parseFloat(form.premiumAmount),
        insuredAmount: parseFloat(form.insuredAmount),
        estimatedYield: parseFloat(form.estimatedYield),
      };

      await api.post("/insurance", payload);

      alert("Insurance policy added successfully!");
      fetchInsurances();

      setForm({
        farmer: farmerId,
        policyNumber: "",
        crop: "",
        sowingDate: "",
        fieldArea: "",
        areaUnit: "acre",
        premiumAmount: "",
        insuredAmount: "",
        estimatedYield: "",
        disasterType: "Other",
        cropStageAtLoss: "Sowing",
        damagePercent: "",
        farmerExpenditure: "",
        marketPricePerTon: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error adding insurance policy");
    }
  };
  const handlePolicySelect = (e) => {
    const policyNumber = e.target.value;

    const selected = policyData.find((p) => p.policyNumber === policyNumber);

    if (!selected) return;

    setForm({
      farmer: farmerId,
      policyNumber: selected.policyNumber,
      crop: selected.crop,
      sowingDate: selected.sowingDate,
      fieldArea: selected.fieldArea,
      areaUnit: selected.areaUnit,

      insuredAmount: selected.insuredAmount,
      estimatedYield: selected.estimatedYield,

      // 🔥 FIX invalid disaster types
      disasterType: disasterMap[selected.disasterType] || selected.disasterType,

      // 🔥 FIX invalid crop stages
      cropStageAtLoss: stageMap[selected.cropStageAtLoss] || "Vegetative",

      // 🔥 REQUIRED in schema but missing in UI
      claimAmount: selected.claimAmount || 0,

      // JSON values
      damagePercent: selected.damagePercent,
      farmerExpenditure: selected.farmerExpenditure,
      marketPricePerTon: selected.marketPricePerTon,
      inspectionReport: selected.inspectionReport,
      claimAmountRequested: selected.claimAmountRequested,

      // Premium amount has no value in JSON → let user fill
      premiumAmount: "",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Approved: "bg-green-100 text-green-700 border-green-300",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
      "Under Review": "bg-blue-100 text-blue-700 border-blue-300",
      "Not Requested": "bg-gray-100 text-gray-700 border-gray-300",
    };

    const icons = {
      Approved: <CheckCircle className="w-4 h-4" />,
      Pending: <AlertTriangle className="w-4 h-4" />,
      Rejected: <XCircle className="w-4 h-4" />,
      "Under Review": <FileText className="w-4 h-4" />,
      "Not Requested": <AlertTriangle className="w-4 h-4" />,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 w-fit ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-300"
        }`}
      >
        {icons[status] || <AlertTriangle className="w-4 h-4" />}
        {status}
      </span>
    );
  };

  const getClaimBadge = (claimed) => {
    if (claimed === "YES") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium border bg-orange-100 text-orange-700 border-orange-300 flex items-center gap-1.5 w-fit">
          <AlertTriangle className="w-4 h-4" />
          Claimed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-700 border-green-300 flex items-center gap-1.5 w-fit">
        <CheckCircle className="w-4 h-4" />
        Active
      </span>
    );
  };
  const handleClaim = async (policy) => {
    try {
      // 1️⃣ Send PATCH to mark claimRequested = "YES"
      const updatePayload = { claimRequested: "YES" };

      await api.patch(`/insurance/${policy._id}`, updatePayload);

      const compensationRes = await api.post(
        `/insurance/${policy._id}/calculate-compensation`,
        {
          damagePercent: policy.damagePercent,
          farmerExpenditure: policy.farmerExpenditure,
          marketPricePerTon: policy.marketPricePerTon,
          isPostHarvestLoss: false, // OR make dynamic later
        }
      );

      const amount = compensationRes.data.compensation;



      // 3️⃣ Refresh table
      fetchInsurances();
    } catch (err) {
      console.log("Claim error:", err);
      alert(err.response?.data?.message || "Error requesting claim");
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
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">
                  Crop Insurance Management
                </h1>
                <p className="text-green-100 mt-1">
                  Protect Your Harvest • Secure Your Future
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Insurance Protection Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{insurances.length} Policies</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
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
              <Shield className="w-7 h-7" />
              Add Insurance Policy
            </h2>
            <p className="text-green-50 mt-1">
              Register a new crop insurance policy for your farm
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Policy Number
                </label>
                <select
                  name="policyNumber"
                  value={form.policyNumber}
                  onChange={handlePolicySelect}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">Select Policy Number</option>
                  {policyData.map((p) => (
                    <option key={p.policyNumber} value={p.policyNumber}>
                      {p.policyNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-600" />
                  Crop Type
                </label>
                <input
                  name="crop"
                  placeholder="e.g., Rice, Wheat"
                  value={form.crop}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Sowing Date
                </label>
                <input
                  type="date"
                  name="sowingDate"
                  value={form.sowingDate}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Field Area
                </label>
                <input
                  name="fieldArea"
                  placeholder="Field Area"
                  type="number"
                  step="0.01"
                  value={form.fieldArea}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  Area Unit
                </label>
                <select
                  name="areaUnit"
                  value={form.areaUnit}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                >
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="bigha">Bigha</option>
                  <option value="sqm">Square Meter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  Premium Amount (₹)
                </label>
                <input
                  name="premiumAmount"
                  placeholder="Premium Amount"
                  type="number"
                  step="0.01"
                  value={form.premiumAmount}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Insured Amount (₹)
                </label>
                <input
                  name="insuredAmount"
                  placeholder="Insured Amount"
                  type="number"
                  step="0.01"
                  value={form.insuredAmount}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-600" />
                  Predicted Yield (After Damage)
                </label>
                <input
                  name="estimatedYield"
                  placeholder="Predicted Yield (After Damage)"
                  type="number"
                  step="0.01"
                  value={form.estimatedYield}
                  onChange={handleChange}
                  required
                  className="p-3 border-2 border-gray-200 rounded-xl w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-green-600" />
                  Disaster Type
                </label>
                <select
                  name="disasterType"
                  value={form.disasterType}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                >
                  <option value="Flood">Flood</option>
                  <option value="Drought">Drought</option>
                  <option value="Pest Attack">Pest Attack</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Fire">Fire</option>
                  <option value="Rainfall Loss">Rainfall Loss</option>
                  <option value="Heat Stress">Heat Stress</option>
                  <option value="Frost">Frost</option>
                  <option value="Disease">Disease</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Damage Percent */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Damage Percentage (%)
                </label>
                <input
                  name="damagePercent"
                  type="number"
                  value={form.damagePercent}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full"
                />
              </div>

              {/* Farmer Expenditure */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Farmer Expenditure (₹)
                </label>
                <input
                  name="farmerExpenditure"
                  type="number"
                  value={form.farmerExpenditure}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full"
                />
              </div>

              {/* Market Price Per Ton */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Market Price Per Ton (₹)
                </label>
                <input
                  name="marketPricePerTon"
                  type="number"
                  value={form.marketPricePerTon}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full"
                />
              </div>

              {/* Inspection Report */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Inspection Report URL
                </label>
                <input
                  name="inspectionReport"
                  placeholder="https://example.com/report.pdf"
                  value={form.inspectionReport}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full"
                />
              </div>

              {/* Claim Amount Requested */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Claim Amount Requested (₹)
                </label>
                <input
                  name="claimAmountRequested"
                  type="number"
                  value={form.claimAmountRequested}
                  onChange={handleChange}
                  className="p-3 border-2 border-gray-200 rounded-xl w-full"
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
              <Shield className="w-5 h-5" />
              Add Insurance Policy
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7" />
              Your Insurance Policies
            </h2>
            <p className="text-emerald-50 mt-1">
              Complete record of all insurance policies
            </p>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading...</p>
              </div>
            ) : insurances.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No policies found
                </p>
                <p className="text-gray-400 mt-2">
                  Add your first insurance policy using the form above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Policy Number
                      </th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Crop
                      </th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Insured Amount
                      </th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Claim Status
                      </th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Approval Status
                      </th>
                      <th className="text-left p-4 font-bold text-gray-700 bg-gray-50">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {insurances.map((ins, index) => (
                      <tr
                        key={ins._id}
                        className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {ins.policyNumber}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-700">
                              {ins.crop}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-gray-800">
                              {ins.insuredAmount?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getClaimBadge(ins.claimRequested)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(ins.ApproveStatus)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {ins.sowingDate
                                ? new Date(ins.sowingDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {ins.claimRequested === "YES" ? (
                            getClaimBadge("YES")
                          ) : (
                            <button
                              onClick={() => handleClaim(ins)}
                              className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                            >
                              Claim
                            </button>
                          )}
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
