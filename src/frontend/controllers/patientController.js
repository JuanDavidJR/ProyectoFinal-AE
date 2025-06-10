import { registerPatient } from "../models/patientModel.js";
import { notify } from "/js/notifications.js";

export const handleRegister = async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = await registerPatient({ name, email, password });

  if (data && data.id) {
    notify("Registro exitoso, ahora inicia sesión", "success");
    window.location.href = "login.html";
  } else {
    notify(`Code: ${data.error}`, "error");
  }
};
