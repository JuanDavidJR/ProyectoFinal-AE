import { handleLogin } from "/controllers/authController.js";
import { handleRegister } from "/controllers/patientController.js";
import {
  loadAppointments,
  handleCreateAppointment,
} from "/controllers/appointmentController.js";

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginForm")) {
    document
      .getElementById("loginForm")
      .addEventListener("submit", handleLogin);
  }
  if (document.getElementById("registerForm")) {
    document
      .getElementById("registerForm")
      .addEventListener("submit", handleRegister);
  }
  if (document.getElementById("appointmentsList")) {
    loadAppointments();
  }
  if (document.getElementById("appointmentForm")) {
    document
      .getElementById("appointmentForm")
      .addEventListener("submit", handleCreateAppointment);
  }
});
