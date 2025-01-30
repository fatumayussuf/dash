import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://sandbox.safaricom.co.ke", // Use production URL for live environment
  headers: {
    "Content-Type": "application/json",
  },
});
