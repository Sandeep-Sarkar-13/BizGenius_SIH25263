import axios from "axios";

export const api = axios.create({
  baseURL: "https://sih-backend-dsue.onrender.com/api",
});
