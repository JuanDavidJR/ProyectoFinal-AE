import { loginUser } from "../models/authModel.js";
import authService from "../services/authService.js";
import { notify } from "/js/notifications.js";

export const handleLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = await loginUser({ email, password });

  if (data.token) {
    authService.saveToken(data.token);
    notify("Login exitoso", "success");
    window.location.href = "appointments.html";
  } else {
    notify("Credenciales incorrectas", "error");
  }
};
