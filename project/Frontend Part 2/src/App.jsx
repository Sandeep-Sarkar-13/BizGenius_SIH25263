import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/Home";
import Analytics from "./pages/dashboard/Analytics";
import YieldPrediction from "./pages/dashboard/YieldPrediction";
import PestPrediction from "./pages/dashboard/PestPrediction";
import PesticideHistory from "./pages/dashboard/PesticideRecords";
import CropInsurance from "./pages/dashboard/CodeInsurance.jsx";


export default function App() {
  const [farmerId, setFarmerId] = useState(null);

  // Load login state whenever localStorage changes
  useEffect(() => {
    setFarmerId(localStorage.getItem("farmerId"));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect logged-in user away from login/signup */}
        <Route
          path="/login"
          element={!farmerId ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/signup"
          element={!farmerId ? <Signup /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={farmerId ? <Dashboard /> : <Navigate to="/login" />}
        >
          <Route index element={<DashboardHome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="yieldprediction" element={<YieldPrediction />} />
          <Route path="pestprediction" element={<PestPrediction />} />
          <Route path="pesthistory" element={<PesticideHistory />} />
          <Route path="cropinsurance" element={<CropInsurance />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
