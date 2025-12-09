import { useState } from "react";
import { Sprout, User, Phone, CreditCard, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [aadhaarNumber, setAadhaar] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 🔥 Single clean login request
      const res = await api.post("/auth/login", { phone, aadhaarNumber });

      // Save farmer ID
      localStorage.setItem("farmerId", res.data.farmerId);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => navigate("/dashboard"), 1200);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background Image with Low Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: `url('/src/assets/bg.png')`,
        }}
      ></div>

      {/* MAIN CONTENT - Split Layout */}
      <div className="relative z-10 min-h-screen flex items-center">
        {/* LEFT SIDE - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl mb-4 animate-bounce-slow">
                <Sprout className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">FarmEasy</h1>
              <p className="text-gray-600 text-lg">Welcome back to your farm dashboard</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Farmer Login</h2>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 animate-slide-in">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Phone */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-800 font-medium"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Aadhaar */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Aadhaar Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your Aadhaar number"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-800 font-medium"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaar(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Login to Dashboard
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-green-600 font-bold hover:underline">
                    Create Account
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-gray-600 text-sm">
              <p>© 2024 FarmEasy. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Four Tilted Images */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
          <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
            {/* Top Left Image */}
            <div 
              className="absolute top-8 left-12 w-64 h-48 bg-cover bg-center rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300"
              style={{
                backgroundImage: `url('/src/assets/farmer1.jpg')`,
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
              }}
            ></div>

            {/* Top Right Image */}
            <div 
              className="absolute top-8 right-12 w-64 h-48 bg-cover bg-center rounded-2xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300"
              style={{
                backgroundImage: `url('/src/assets/farmer2.jpg')`,
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
              }}
            ></div>

            {/* Bottom Left Image */}
            <div 
              className="absolute bottom-8 left-12 w-64 h-48 bg-cover bg-center rounded-2xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300"
              style={{
                backgroundImage: `url('/src/assets/farmer3.jpg')`,
                clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)'
              }}
            ></div>

            {/* Bottom Right Image */}
            <div 
              className="absolute bottom-8 right-12 w-64 h-48 bg-cover bg-center rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300"
              style={{
                backgroundImage: `url('/src/assets/farmer4.jpg')`,
                clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes slide-in {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}