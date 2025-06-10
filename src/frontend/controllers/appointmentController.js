import {
  getAppointments,
  createAppointment,
} from "../models/appointmentModel.js";

export const loadAppointments = async () => {
  const appointments = await getAppointments();
  const list = document.getElementById("appointmentsList");

  list.innerHTML = "";
  appointments.forEach((a) => {
    const item = document.createElement("li");
    item.textContent = `📅 ${a.appointment_date} con ${a.doctor_name}`;
    list.appendChild(item);
  });
};

export const handleCreateAppointment = async (event) => {
  event.preventDefault();
  const doctorName = document.getElementById("doctorName").value;
  const appointmentDate = document.getElementById("appointmentDate").value;

  await createAppointment({
    doctor_name: doctorName,
    appointment_date: appointmentDate,
  });
  alert("Cita creada correctamente");
};
