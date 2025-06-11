import { handleLogin } from "/controllers/authController.js";
import { handleRegister } from "/controllers/patientController.js";
import {
  loadAppointments,
  handleCreateAppointment,
} from "/controllers/appointmentController.js";
function loadComponent(id, path) {
  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById(id).innerHTML = html;
    });
}
loadComponent("navbar", "/components/navbar.html");
loadComponent("homeContent", "/components/homeContent.html");
loadComponent("footer", "/components/footer.html");
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
