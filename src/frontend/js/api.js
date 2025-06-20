// js/api.js
class ApiClient {
  constructor() {
    this.baseURL = "/api";
    this.token = localStorage.getItem("token");
  }

  // Método para configurar headers
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para hacer requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos
        if (response.status === 401) {
          AuthManager.logout();
          Utils.showAlert(
            "Sesión expirada. Por favor, inicia sesión nuevamente.",
            "danger"
          );
          window.location.href = "login.html";
          return;
        }
        throw new Error(data.error || "Error en la solicitud");
      }

      return data;
    } catch (error) {
      console.error("Error en API:", error);
      throw error;
    }
  }

  // Actualizar token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  // ===== ENDPOINTS DE AUTENTICACIÓN =====

  async login(email, password) {
    const data = await this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async register(userData) {
    const data = await this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async logout() {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.log("Error al hacer logout:", error);
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return await this.makeRequest("/auth/me");
  }

  // ===== ENDPOINTS DE CITAS =====

  async getSpecialties() {
    return await this.makeRequest("/appointments/specialties");
  }

  async getDoctorsBySpecialty(specialtyId) {
    return await this.makeRequest(`/appointments/doctors/${specialtyId}`);
  }

  async getAvailability(doctorId, date) {
    return await this.makeRequest(
      `/appointments/availability/${doctorId}?date=${date}`
    );
  }

  async createAppointment(appointmentData) {
    return await this.makeRequest("/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments() {
    return await this.makeRequest("/appointments/my-appointments");
  }

  async getDoctorAppointments() {
    return await this.makeRequest("/appointments/doctor-appointments");
  }

  async getAllAppointments() {
    return await this.makeRequest("/appointments/all");
  }

  async updateAppointment(appointmentId, updateData) {
    return await this.makeRequest(`/appointments/${appointmentId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async cancelAppointment(appointmentId) {
    return await this.makeRequest(`/appointments/${appointmentId}`, {
      method: "DELETE",
    });
  }

  // ===== ENDPOINTS DE ADMINISTRACIÓN =====

  async getStats() {
    return await this.makeRequest("/admin/stats");
  }

  async getAdminSpecialties() {
    return await this.makeRequest("/admin/specialties");
  }

  async createSpecialty(specialtyData) {
    return await this.makeRequest("/admin/specialties", {
      method: "POST",
      body: JSON.stringify(specialtyData),
    });
  }

  async getDoctors() {
    return await this.makeRequest("/admin/doctors");
  }

  async createDoctor(doctorData) {
    return await this.makeRequest("/admin/doctors", {
      method: "POST",
      body: JSON.stringify(doctorData),
    });
  }

  async getDoctorAvailability(doctorId) {
    return await this.makeRequest(`/admin/doctors/${doctorId}/availability`);
  }

  async updateDoctorAvailability(doctorId, availability) {
    return await this.makeRequest(`/admin/doctors/${doctorId}/availability`, {
      method: "PUT",
      body: JSON.stringify({ availability }),
    });
  }

  async getUsers() {
    return await this.makeRequest("/admin/users");
  }

  async updateUser(userId, userData) {
    return await this.makeRequest(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }
}

// Instancia global del cliente API
const api = new ApiClient();
