import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calculator, User, RefreshCw, AlertCircle, Sprout, TrendingUp, Package, Calendar, Activity, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [compensation, setCompensation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calcInputs, setCalcInputs] = useState({
    sowingDate: '',
    damagePercent: 0,
    isPostHarvestLoss: false,
    farmerExpenditure: 0,
    marketPricePerTon: 0
  });

  const API_BASE = 'https://sih-backend-dsue.onrender.com/api';

  useEffect(() => {
    fetchPendingPolicies();
    const interval = setInterval(fetchPendingPolicies, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE}/insurance`);
      const data = await response.json();
      const pending = data.filter(p => p.ApproveStatus === 'Under Review');
      setPolicies(pending);
    } catch (err) {
      console.error('Error fetching policies:', err);
    }
  };

  const fetchFarmerDetails = async (farmerId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/farmers/${farmerId}`);
      const data = await response.json();
      setFarmerDetails(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch farmer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompensation = async (policyId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/insurance/${policyId}/calculate-compensation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calcInputs)
      });
      const data = await response.json();
      setCompensation(data);
      setError(null);
    } catch (err) {
      setError('Failed to calculate compensation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approvePolicy = async (policyId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/insurance/${policyId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setPolicies(policies.filter(p => p._id !== policyId));
        setSelectedPolicy(null);
        setFarmerDetails(null);
        setCompensation(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to approve policy');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy) => {
    setSelectedPolicy(policy);
    setCompensation(null);
    
    setCalcInputs({
      sowingDate: policy.sowingDate ? new Date(policy.sowingDate).toISOString().split('T')[0] : '',
      damagePercent: policy.damagePercent || 0,
      isPostHarvestLoss: true,
      farmerExpenditure: policy.farmerExpenditure || 0,
      marketPricePerTon: policy.marketPricePerTon || 0
    });

    if (policy.farmer) {
      const farmerId = typeof policy.farmer === 'object' ? policy.farmer._id : policy.farmer;
      fetchFarmerDetails(farmerId);
    }
  };

  if (loading && policies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
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
                <h1 className="text-4xl font-bold">Crop Insurance Admin Panel</h1>
                <p className="text-green-100 mt-1">Review & Approve Insurance Claims</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{policies.length} Pending Claims</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                <span>Crop Insurance Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3 shadow-md">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Review</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{policies.length}</h3>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-yellow-600 animate-spin" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Insured</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  ₹{policies.reduce((sum, p) => sum + (p.insuredAmount || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Claims</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  ₹{policies.reduce((sum, p) => sum + (p.claimAmountRequested || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Selected Policy</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {selectedPolicy ? '1' : '0'}
                </h3>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Policy List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Pending Policies</h2>
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No pending policies</p>
                  <p className="text-gray-400 text-sm mt-1">All claims are processed</p>
                </div>
              ) : (
                policies.map(policy => (
                  <div
                    key={policy._id}
                    onClick={() => handlePolicySelect(policy)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPolicy?._id === policy._id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-800">#{policy._id.slice(-6)}</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                        {policy.claimStatus}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-800">{policy.crop}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">{policy.fieldArea} {policy.areaUnit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-600">₹{policy.insuredAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Policy Details */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedPolicy ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-green-100">
                <Sprout className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl font-medium">Select a policy to review</p>
                <p className="text-gray-400 mt-2">Click on any pending policy from the list</p>
              </div>
            ) : (
              <>
                {/* Policy Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">Policy Information</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Policy ID</label>
                      <p className="font-bold text-gray-800 mt-1">{selectedPolicy._id}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Crop Type</label>
                      <p className="font-bold text-green-700 mt-1 flex items-center gap-2">
                        <Sprout className="w-4 h-4" />
                        {selectedPolicy.crop}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Field Area</label>
                      <p className="font-bold text-blue-700 mt-1">{selectedPolicy.fieldArea} {selectedPolicy.areaUnit}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Insured Amount</label>
                      <p className="font-bold text-emerald-700 mt-1">₹{selectedPolicy.insuredAmount?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Claim Requested</label>
                      <p className="font-bold text-purple-700 mt-1">₹{selectedPolicy.claimAmountRequested?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <label className="text-sm text-gray-600 font-semibold">Sowing Date</label>
                      <p className="font-bold text-orange-700 mt-1">
                        {selectedPolicy.sowingDate 
                          ? new Date(selectedPolicy.sowingDate).toLocaleDateString() 
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Embedded Decolourizer Tool */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">Crop Disease Analysis Tool</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Use this tool to analyze crop diseases and get instant recommendations for treatment.
                  </p>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                    <iframe
                      src="https://sih-decolourizer.onrender.com/"
                      className="w-full h-[600px]"
                      title="Crop Disease Analyzer"
                      allow="camera; microphone"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                </div>

                {/* Farmer Details */}
                {farmerDetails && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-6">
                      <User className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-800">Farmer Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-sm text-gray-600 font-semibold">Name</label>
                        <p className="font-bold text-gray-800 mt-1">{farmerDetails.name}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-sm text-gray-600 font-semibold">Location</label>
                        <p className="font-bold text-gray-800 mt-1">{farmerDetails.location || 'N/A'}</p>
                      </div>
                      {farmerDetails.pesticidesApplied && farmerDetails.pesticidesApplied.length > 0 && (
                        <div className="col-span-2 p-4 bg-green-50 rounded-xl">
                          <label className="text-sm text-gray-600 font-semibold mb-3 block">Pesticides Applied</label>
                          <div className="flex flex-wrap gap-2">
                            {farmerDetails.pesticidesApplied.map((pesticide, idx) => (
                              <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {pesticide}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compensation Calculator */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-6">
                    <Calculator className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">Calculate Compensation</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Sowing Date
                      </label>
                      <input
                        type="date"
                        value={calcInputs.sowingDate}
                        onChange={(e) => setCalcInputs({...calcInputs, sowingDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Damage Percent (%)
                      </label>
                      <input
                        type="number"
                        value={calcInputs.damagePercent}
                        onChange={(e) => setCalcInputs({...calcInputs, damagePercent: Number(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Farmer Expenditure (₹)
                      </label>
                      <input
                        type="number"
                        value={calcInputs.farmerExpenditure}
                        onChange={(e) => setCalcInputs({...calcInputs, farmerExpenditure: Number(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Market Price per Ton (₹)
                      </label>
                      <input
                        type="number"
                        value={calcInputs.marketPricePerTon}
                        onChange={(e) => setCalcInputs({...calcInputs, marketPricePerTon: Number(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={calcInputs.isPostHarvestLoss}
                          onChange={(e) => setCalcInputs({...calcInputs, isPostHarvestLoss: e.target.checked})}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm font-bold text-gray-700">Post-Harvest Loss</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => calculateCompensation(selectedPolicy._id)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-lg"
                  >
                    {loading ? 'Calculating...' : 'Calculate Compensation'}
                  </button>

                  {compensation && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Compensation Calculated
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white rounded-lg">
                          <label className="text-xs text-gray-600 font-semibold">Stage</label>
                          <p className="font-bold text-gray-800 mt-1">{compensation.stage}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <label className="text-xs text-gray-600 font-semibold">Days Past</label>
                          <p className="font-bold text-gray-800 mt-1">{compensation.daysPast} days</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <label className="text-xs text-gray-600 font-semibold">Damage</label>
                          <p className="font-bold text-red-600 mt-1">{compensation.damagePercent}%</p>
                        </div>
                        <div className="p-3 bg-green-600 rounded-lg">
                          <label className="text-xs text-green-100 font-semibold">Final Compensation</label>
                          <p className="font-bold text-white text-2xl mt-1">
                            ₹{(compensation.compensation + 500)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg mb-3">
                        <label className="text-xs text-gray-600 font-semibold block mb-2">Calculation Basis</label>
                        <p className="text-sm text-gray-700">{compensation.basis}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <label className="text-xs text-gray-600 font-semibold block mb-2">Rule Applied</label>
                        <p className="text-sm font-bold text-green-700">{compensation.ruleUsed}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => approvePolicy(selectedPolicy._id)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg shadow-lg"
                  >
                    <CheckCircle className="w-6 h-6" />
                    Approve Policy
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPolicy(null);
                      setFarmerDetails(null);
                      setCompensation(null);
                    }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 font-bold shadow-lg"
                  >
                    <XCircle className="w-6 h-6" />
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;