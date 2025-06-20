// js/appointments.js
class AppointmentForm {
    static currentStep = 1;
    static formData = {};

    // Inicializar formulario
    static async init() {
        await this.loadSpecialties();
        this.setupEventListeners();
        this.generateAvailableDates();
    }

    // Cargar especialidades
    static async loadSpecialties() {
        try {
            const specialties = await api.getSpecialties();
            const select = document.getElementById('specialtyId');
            
            Utils.populateSelect(select, specialties, 'Selecciona una especialidad');
            
        } catch (error) {
            Utils.showAlert('Error al cargar especialidades', 'danger');
        }
    }

    // Configurar event listeners
    static setupEventListeners() {
        // Cambio de especialidad
        document.getElementById('specialtyId').addEventListener('change', async (e) => {
            const specialtyId = e.target.value;
            const nextBtn = document.getElementById('step1-next');
            
            if (specialtyId) {
                nextBtn.disabled = false;
                await this.loadDoctors(specialtyId);
            } else {
                nextBtn.disabled = true;
                this.clearDoctors();
            }
        });

        // Cambio de doctor
        document.getElementById('doctorId').addEventListener('change', (e) => {
            const doctorId = e.target.value;
            const nextBtn = document.getElementById('step2-next');
            nextBtn.disabled = !doctorId;
        });

        // Cambio de fecha
        document.getElementById('appointmentDate').addEventListener('change', async (e) => {
            const date = e.target.value;
            const doctorId = document.getElementById('doctorId').value;
            
            if (date && doctorId) {
                await this.loadAvailableSlots(doctorId, date);
            } else {
                this.clearTimeSlots();
            }
        });

        // Cambio de hora
        document.getElementById('appointmentTime').addEventListener('change', (e) => {
            const time = e.target.value;
            const nextBtn = document.getElementById('step3-next');
            nextBtn.disabled = !time;
        });

        // Submit del formulario
        document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitAppointment();
        });
    }

    // Cargar doctores por especialidad
    static async loadDoctors(specialtyId) {
        try {
            const doctors = await api.getDoctorsBySpecialty(specialtyId);
            const select = document.getElementById('doctorId');
            
            Utils.populateSelect(select, doctors, 'Selecciona un doctor');
            
        } catch (error) {
            Utils.showAlert('Error al cargar doctores', 'danger');
        }
    }

    // Limpiar doctores
    static clearDoctors() {
        const select = document.getElementById('doctorId');
        select.innerHTML = '<option value="">Selecciona una especialidad primero</option>';
        document.getElementById('step2-next').disabled = true;
    }

    // Generar fechas disponibles
    static generateAvailableDates() {
        const dates = Utils.getAvailableDates();
        const select = document.getElementById('appointmentDate');
        
        Utils.populateSelect(select, dates, 'Selecciona una fecha');
    }

    // Cargar horarios disponibles
    static async loadAvailableSlots(doctorId, date) {
        try {
            const response = await api.getAvailability(doctorId, date);
            const select = document.getElementById('appointmentTime');
            
            if (response.availableSlots && response.availableSlots.length > 0) {
                const slots = response.availableSlots.map(slot => ({
                    value: slot.time,
                    label: slot.displayTime
                }));
                
                Utils.populateSelect(select, slots, 'Selecciona una hora');
            } else {
                select.innerHTML = '<option value="">No hay horarios disponibles</option>';
            }
            
        } catch (error) {
            Utils.showAlert('Error al cargar horarios disponibles', 'danger');
            this.clearTimeSlots();
        }
    }

    // Limpiar horarios
    static clearTimeSlots() {
        const select = document.getElementById('appointmentTime');
        select.innerHTML = '<option value="">Selecciona una fecha primero</option>';
        document.getElementById('step3-next').disabled = true;
    }

    // Siguiente paso
    static nextStep() {
        if (this.currentStep < 4) {
            // Ocultar paso actual
            document.getElementById(`step-${this.currentStep}`).classList.add('d-none');
            
            // Mostrar siguiente paso
            this.currentStep++;
            document.getElementById(`step-${this.currentStep}`).classList.remove('d-none');
            
            // Actualizar progreso
            this.updateProgress();
            
            // Si es el paso de confirmación, generar resumen
            if (this.currentStep === 4) {
                this.generateSummary();
            }
        }
    }

    // Paso anterior
    static prevStep() {
        if (this.currentStep > 1) {
            // Ocultar paso actual
            document.getElementById(`step-${this.currentStep}`).classList.add('d-none');
            
            // Mostrar paso anterior
            this.currentStep--;
            document.getElementById(`step-${this.currentStep}`).classList.remove('d-none');
            
            // Actualizar progreso
            this.updateProgress();
        }
    }

    // Actualizar barra de progreso
    static updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const currentStepSpan = document.getElementById('current-step');
        
        const percentage = (this.currentStep / 4) * 100;
        progressBar.style.width = `${percentage}%`;
        currentStepSpan.textContent = this.currentStep;
    }

    // Generar resumen
    static generateSummary() {
        const form = document.getElementById('appointmentForm');
        const formData = new FormData(form);
        
        // Obtener textos de los selects
        const specialtyText = document.getElementById('specialtyId').selectedOptions[0]?.text;
        const doctorText = document.getElementById('doctorId').selectedOptions[0]?.text;
        const dateText = document.getElementById('appointmentDate').selectedOptions[0]?.text;
        const timeText = document.getElementById('appointmentTime').selectedOptions[0]?.text;
        const notes = formData.get('notes');
        
        const summaryHtml = `
            <div class="row">
                <div class="col-sm-4 text-muted">Especialidad:</div>
                <div class="col-sm-8 fw-bold">${specialtyText}</div>
            </div>
            <hr class="my-2">
            <div class="row">
                <div class="col-sm-4 text-muted">Doctor:</div>
                <div class="col-sm-8 fw-bold">${doctorText}</div>
            </div>
            <hr class="my-2">
            <div class="row">
                <div class="col-sm-4 text-muted">Fecha:</div>
                <div class="col-sm-8 fw-bold">${dateText}</div>
            </div>
            <hr class="my-2">
            <div class="row">
                <div class="col-sm-4 text-muted">Hora:</div>
                <div class="col-sm-8 fw-bold">${timeText}</div>
            </div>
            ${notes ? `
                <hr class="my-2">
                <div class="row">
                    <div class="col-sm-4 text-muted">Notas:</div>
                    <div class="col-sm-8">${notes}</div>
                </div>
            ` : ''}
        `;
        
        document.getElementById('appointment-summary').innerHTML = summaryHtml;
    }

    // Enviar cita
    static async submitAppointment() {
        const confirmBtn = document.getElementById('confirmBtn');
        const loading = Utils.showLoading(confirmBtn, 'Agendando cita...');
        
        try {
            const form = document.getElementById('appointmentForm');
            const formData = new FormData(form);
            
            const appointmentData = {
                doctorId: parseInt(formData.get('doctorId')),
                appointmentDate: formData.get('appointmentDate'),
                appointmentTime: formData.get('appointmentTime'),
                notes: formData.get('notes') || ''
            };
            
            await api.createAppointment(appointmentData);
            
            Utils.showAlert('¡Cita agendada exitosamente!', 'success');
            
            setTimeout(() => {
                window.location.href = 'my-appointments.html';
            }, 2000);
            
        } catch (error) {
            Utils.showAlert(error.message || 'Error al agendar la cita', 'danger');
        } finally {
            loading.hide();
        }
    }
}

// Clase para gestionar las citas del usuario
class MyAppointments {
    static async init() {
        await this.loadAppointments();
    }

    static async loadAppointments() {
        const container = document.getElementById('appointments-container');
        
        try {
            // Mostrar loading
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-muted mt-2">Cargando tus citas...</p>
                </div>
            `;
            
            const appointments = await api.getMyAppointments();
            
            if (appointments.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-calendar-x text-muted" style="font-size: 4rem;"></i>
                        <h4 class="text-muted mt-3">No tienes citas agendadas</h4>
                        <p class="text-muted">¿Quieres agendar tu primera cita?</p>
                        <a href="new-appointment.html" class="btn btn-primary">
                            <i class="bi bi-plus-circle me-2"></i>
                            Agendar Nueva Cita
                        </a>
                    </div>
                `;
                return;
            }

            // Separar citas por estado
            const upcoming = appointments.filter(apt => 
                apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date()
            );
            const past = appointments.filter(apt => 
                apt.status !== 'scheduled' || new Date(apt.appointment_date) < new Date()
            );

            container.innerHTML = `
                <!-- Próximas Citas -->
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="text-primary mb-3">
                            <i class="bi bi-calendar-event me-2"></i>
                            Próximas Citas (${upcoming.length})
                        </h5>
                        ${upcoming.length > 0 ? this.renderAppointments(upcoming, true) : this.renderNoAppointments('próximas')}
                    </div>
                </div>

                <!-- Historial -->
                <div class="row">
                    <div class="col-12">
                        <h5 class="text-muted mb-3">
                            <i class="bi bi-clock-history me-2"></i>
                            Historial (${past.length})
                        </h5>
                        ${past.length > 0 ? this.renderAppointments(past, false) : this.renderNoAppointments('historial')}
                    </div>
                </div>
            `;
            
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar las citas. Por favor, recarga la página.
                </div>
            `;
        }
    }

    static renderAppointments(appointments, canCancel = false) {
        return appointments.map(appointment => `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="card-title mb-2">
                                ${appointment.specialty_name}
                                ${Utils.createStatusBadge(appointment.status)}
                            </h6>
                            <p class="card-text text-muted mb-1">
                                <i class="bi bi-person-badge me-1"></i>
                                Dr. ${appointment.doctor_name}
                            </p>
                            <p class="card-text text-muted mb-1">
                                <i class="bi bi-calendar me-1"></i>
                                ${Utils.formatDate(appointment.appointment_date)} a las ${Utils.formatTime(appointment.appointment_time)}
                            </p>
                            ${appointment.notes ? `
                                <p class="card-text small text-muted mt-2">
                                    <i class="bi bi-sticky me-1"></i>
                                    ${appointment.notes}
                                </p>
                            ` : ''}
                        </div>
                        <div class="col-md-4 text-md-end">
                            ${canCancel && appointment.status === 'scheduled' ? `
                                <button class="btn btn-outline-danger btn-sm" 
                                        onclick="MyAppointments.cancelAppointment(${appointment.id})">
                                    <i class="bi bi-x-circle me-1"></i>
                                    Cancelar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static renderNoAppointments(type) {
        return `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-calendar-x" style="font-size: 2rem;"></i>
                <p class="mt-2 mb-0">No tienes citas en el ${type}</p>
            </div>
        `;
    }

    static async cancelAppointment(appointmentId) {
        const confirmed = await Utils.confirmAction(
            '¿Estás seguro de que deseas cancelar esta cita?',
            'Cancelar Cita'
        );

        if (!confirmed) return;

        try {
            await api.cancelAppointment(appointmentId);
            Utils.showAlert('Cita cancelada exitosamente', 'success');
            await this.loadAppointments(); // Recargar lista
        } catch (error) {
            Utils.showAlert(error.message || 'Error al cancelar la cita', 'danger');
        }
    }
}