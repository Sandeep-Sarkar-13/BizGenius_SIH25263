import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    aadhaarNumber: "",
    name: "",
    phone: "",
    location: "",
    village: "",
    state: "",
    farmAcres: "",
    crop: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Signup</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Input Fields */}
          {Object.keys(form).map((key) => (
            <input
              key={key}
              type="text"
              placeholder={key.replace(/([A-Z])/g, " $1")}
              name={key}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              value={form[key]}
              onChange={handleChange}
              required
            />
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
