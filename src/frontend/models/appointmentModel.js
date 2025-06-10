import apiService from "../services/apiService.js";

export const getAppointments = async () => {
  return await apiService.get("/appointments");
};

export const createAppointment = async (appointmentData) => {
  return await apiService.post("/appointments", appointmentData, true);
};
