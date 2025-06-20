// js/dashboard.js
class DashboardManager {
    // Obtener subtítulo según el rol
    static getSubtitleByRole(role) {
        const subtitles = {
            'admin': 'Panel de Administración',
            'doctor': 'Panel del Doctor',
            'user': 'Tu Panel de Citas Médicas'
        };
        return subtitles[role] || 'Dashboard';
    }

    // Cargar dashboard según el rol del usuario
    static async loadDashboard() {
        const user = AuthManager.getUser();
        const contentContainer = document.getElementById('dashboard-content');
        
        try {
            switch (user.role) {
                case 'admin':
                    await this.loadAdminDashboard(contentContainer);
                    break;
                case 'doctor':
                    await this.loadDoctorDashboard(contentContainer);
                    break;
                case 'user':
                default:
                    await this.loadUserDashboard(contentContainer);
                    break;
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar el dashboard. Por favor, recarga la página.
                </div>
            `;
        }
    }

    // Dashboard del Administrador
    static async loadAdminDashboard(container) {
        try {
            const [stats, appointments] = await Promise.all([
                api.getStats(),
                api.getAllAppointments()
            ]);

            const recentAppointments = appointments.slice(0, 5);

            container.innerHTML = `
                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-primary-soft text-primary mx-auto mb-3">
                                    <i class="bi bi-people"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${this.getTotalUsers(stats.users)}</h3>
                                <p class="text-muted mb-0">Total Usuarios</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-success-soft text-success mx-auto mb-3">
                                    <i class="bi bi-calendar-check"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${this.getTotalAppointments(stats.appointments)}</h3>
                                <p class="text-muted mb-0">Total Citas</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-warning-soft text-warning mx-auto mb-3">
                                    <i class="bi bi-clock"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${this.getScheduledAppointments(stats.appointments)}</h3>
                                <p class="text-muted mb-0">Citas Programadas</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-info-soft text-info mx-auto mb-3">
                                    <i class="bi bi-check-circle"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${this.getCompletedAppointments(stats.appointments)}</h3>
                                <p class="text-muted mb-0">Citas Completadas</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Appointments and Quick Actions -->
                <div class="row">
                    <div class="col-lg-8 mb-4">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-calendar-event me-2"></i>
                                    Citas Recientes
                                </h5>
                            </div>
                            <div class="card-body">
                                ${this.renderRecentAppointments(recentAppointments)}
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-lightning me-2"></i>
                                    Acciones Rápidas
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <a href="admin-doctors.html" class="btn btn-outline-primary">
                                        <i class="bi bi-people me-2"></i>
                                        Gestionar Doctores
                                    </a>
                                    <a href="admin-appointments.html" class="btn btn-outline-success">
                                        <i class="bi bi-calendar-check me-2"></i>
                                        Ver Todas las Citas
                                    </a>
                                    <a href="admin-dashboard.html" class="btn btn-outline-info">
                                        <i class="bi bi-bar-chart me-2"></i>
                                        Ver Estadísticas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            throw error;
        }
    }

    // Dashboard del Doctor
    static async loadDoctorDashboard(container) {
        try {
            const appointments = await api.getDoctorAppointments();
            const today = new Date().toISOString().split('T')[0];
            
            const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
            const upcomingAppointments = appointments.filter(apt => 
                apt.appointment_date > today && apt.status === 'scheduled'
            ).slice(0, 5);

            container.innerHTML = `
                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-primary-soft text-primary mx-auto mb-3">
                                    <i class="bi bi-calendar-today"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${todayAppointments.length}</h3>
                                <p class="text-muted mb-0">Citas Hoy</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-success-soft text-success mx-auto mb-3">
                                    <i class="bi bi-clock"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${upcomingAppointments.length}</h3>
                                <p class="text-muted mb-0">Próximas Citas</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-info-soft text-info mx-auto mb-3">
                                    <i class="bi bi-check-circle"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${appointments.filter(apt => apt.status === 'completed').length}</h3>
                                <p class="text-muted mb-0">Citas Completadas</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Today's Appointments -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card dashboard-card border-0">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-calendar-day me-2"></i>
                                    Citas de Hoy
                                </h5>
                            </div>
                            <div class="card-body">
                                ${this.renderTodayAppointments(todayAppointments)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Appointments -->
                <div class="row">
                    <div class="col-12">
                        <div class="card dashboard-card border-0">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-calendar-week me-2"></i>
                                    Próximas Citas
                                </h5>
                            </div>
                            <div class="card-body">
                                ${this.renderUpcomingAppointments(upcomingAppointments)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            throw error;
        }
    }

    // Dashboard del Usuario
    static async loadUserDashboard(container) {
        try {
            const appointments = await api.getMyAppointments();
            const today = new Date().toISOString().split('T')[0];
            
            const upcomingAppointments = appointments.filter(apt => 
                apt.appointment_date >= today && apt.status === 'scheduled'
            ).slice(0, 3);

            container.innerHTML = `
                <!-- Welcome Card -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card dashboard-card border-0 bg-gradient-primary text-white">
                            <div class="card-body text-center py-5">
                                <i class="bi bi-calendar-heart" style="font-size: 3rem; opacity: 0.8;"></i>
                                <h3 class="fw-bold mt-3 mb-3">Gestiona tus Citas Médicas</h3>
                                <p class="lead mb-4">Agenda nuevas citas o revisa las que ya tienes programadas</p>
                                <div class="d-flex gap-3 justify-content-center flex-wrap">
                                    <a href="new-appointment.html" class="btn btn-light btn-lg">
                                        <i class="bi bi-plus-circle me-2"></i>
                                        Nueva Cita
                                    </a>
                                    <a href="my-appointments.html" class="btn btn-outline-light btn-lg">
                                        <i class="bi bi-calendar-check me-2"></i>
                                        Mis Citas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-primary-soft text-primary mx-auto mb-3">
                                    <i class="bi bi-calendar"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${appointments.length}</h3>
                                <p class="text-muted mb-0">Total de Citas</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-success-soft text-success mx-auto mb-3">
                                    <i class="bi bi-clock"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${appointments.filter(apt => apt.status === 'scheduled').length}</h3>
                                <p class="text-muted mb-0">Citas Programadas</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card dashboard-card border-0 h-100">
                            <div class="card-body text-center">
                                <div class="stat-icon bg-info-soft text-info mx-auto mb-3">
                                    <i class="bi bi-check-circle"></i>
                                </div>
                                <h3 class="fw-bold mb-1">${appointments.filter(apt => apt.status === 'completed').length}</h3>
                                <p class="text-muted mb-0">Citas Completadas</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Appointments -->
                <div class="row">
                    <div class="col-12">
                        <div class="card dashboard-card border-0">
                            <div class="card-header bg-white border-bottom">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-calendar-event me-2"></i>
                                    Próximas Citas
                                </h5>
                            </div>
                            <div class="card-body">
                                ${this.renderUserUpcomingAppointments(upcomingAppointments)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            throw error;
        }
    }

    // Métodos auxiliares para calcular estadísticas
    static getTotalUsers(users) {
        return users ? users.reduce((total, user) => total + parseInt(user.count), 0) : 0;
    }

    static getTotalAppointments(appointments) {
        return appointments ? appointments.reduce((total, apt) => total + parseInt(apt.count), 0) : 0;
    }

    static getScheduledAppointments(appointments) {
        const scheduled = appointments ? appointments.find(apt => apt.status === 'scheduled') : null;
        return scheduled ? parseInt(scheduled.count) : 0;
    }

    static getCompletedAppointments(appointments) {
        const completed = appointments ? appointments.find(apt => apt.status === 'completed') : null;
        return completed ? parseInt(completed.count) : 0;
    }

    // Renderizar citas recientes (Admin)
    static renderRecentAppointments(appointments) {
        if (!appointments || appointments.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="bi bi-calendar-x text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2 mb-0">No hay citas recientes</p>
                </div>
            `;
        }

        return appointments.map(appointment => `
            <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                    <h6 class="mb-1">${appointment.patient_name}</h6>
                    <p class="text-muted mb-1 small">
                        Dr. ${appointment.doctor_name} - ${appointment.specialty_name}
                    </p>
                    <p class="text-muted mb-0 small">
                        <i class="bi bi-calendar me-1"></i>
                        ${Utils.formatDateShort(appointment.appointment_date)} - ${Utils.formatTime(appointment.appointment_time)}
                    </p>
                </div>
                <div>
                    ${Utils.createStatusBadge(appointment.status)}
                </div>
            </div>
        `).join('');
    }

    // Renderizar citas de hoy (Doctor)
    static renderTodayAppointments(appointments) {
        if (!appointments || appointments.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="bi bi-calendar-check text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2 mb-0">No tienes citas programadas para hoy</p>
                </div>
            `;
        }

        return `
            <div class="row">
                ${appointments.map(appointment => `
                    <div class="col-md-6 mb-3">
                        <div class="card border-primary border-2">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h6 class="card-title mb-0">${appointment.patient_name}</h6>
                                    ${Utils.createStatusBadge(appointment.status)}
                                </div>
                                <p class="card-text small text-muted mb-1">
                                    <i class="bi bi-telephone me-1"></i>
                                    ${appointment.patient_phone || 'Sin teléfono'}
                                </p>
                                <p class="card-text small">
                                    <i class="bi bi-clock me-1"></i>
                                    ${Utils.formatTime(appointment.appointment_time)}
                                </p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Renderizar próximas citas (Doctor)
    static renderUpcomingAppointments(appointments) {
        if (!appointments || appointments.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="bi bi-calendar-week text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2 mb-0">No tienes próximas citas programadas</p>
                </div>
            `;
        }

        return appointments.map(appointment => `
            <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                    <h6 class="mb-1">${appointment.patient_name}</h6>
                    <p class="text-muted mb-0 small">
                        <i class="bi bi-calendar me-1"></i>
                        ${Utils.formatDateShort(appointment.appointment_date)} - ${Utils.formatTime(appointment.appointment_time)}
                    </p>
                </div>
                <div>
                    ${Utils.createStatusBadge('scheduled')}
                </div>
            </div>
        `).join('');
    }

    // Renderizar próximas citas (Usuario)
    static renderUserUpcomingAppointments(appointments) {
        if (!appointments || appointments.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x text-muted" style="font-size: 3rem;"></i>
                    <h6 class="text-muted mt-3 mb-3">No tienes citas programadas</h6>
                    <a href="new-appointment.html" class="btn btn-primary">
                        <i class="bi bi-plus-circle me-2"></i>
                        Agendar Primera Cita
                    </a>
                </div>
            `;
        }

        return appointments.map(appointment => `
            <div class="card border-success border-2 mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="card-title mb-1">${appointment.specialty_name}</h6>
                            <p class="card-text text-muted mb-1">Dr. ${appointment.doctor_name}</p>
                            <p class="card-text small">
                                <i class="bi bi-calendar me-1"></i>
                                ${Utils.formatDate(appointment.appointment_date)} a las ${Utils.formatTime(appointment.appointment_time)}
                            </p>
                            ${appointment.notes ? `<p class="card-text small text-muted mt-2">${appointment.notes}</p>` : ''}
                        </div>
                        <div>
                            ${Utils.createStatusBadge('scheduled')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}