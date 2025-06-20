// js/auth.js
class AuthManager {
    static TOKEN_KEY = 'token';
    static USER_KEY = 'user';

    // Verificar si el usuario está autenticado
    static isAuthenticated() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const user = localStorage.getItem(this.USER_KEY);
        return !!(token && user);
    }

    // Obtener el token almacenado
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Obtener el usuario almacenado
    static getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error al parsear usuario:', error);
            return null;
        }
    }

    // Verificar si el usuario tiene un rol específico
    static hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    }

    // Verificar si el usuario tiene alguno de los roles especificados
    static hasAnyRole(roles) {
        const user = this.getUser();
        return user && roles.includes(user.role);
    }

    // Iniciar sesión
    static async login(email, password) {
        try {
            const response = await api.login(email, password);
            
            // Guardar token y usuario
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Registrar usuario
    static async register(userData) {
        try {
            const response = await api.register(userData);
            
            // Guardar token y usuario
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Cerrar sesión
    static async logout() {
        try {
            // Intentar cerrar sesión en el servidor
            await api.logout();
        } catch (error) {
            console.log('Error al cerrar sesión en el servidor:', error);
        } finally {
            // Limpiar datos locales
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
            
            // Actualizar token en el cliente API
            api.setToken(null);
            
            // Redirigir al login
            window.location.href = 'login.html';
        }
    }

    // Obtener información actualizada del usuario
    static async getCurrentUser() {
        try {
            const response = await api.getCurrentUser();
            
            // Actualizar usuario almacenado
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            
            return response.user;
        } catch (error) {
            // Si hay error, probablemente el token expiró
            this.logout();
            throw error;
        }
    }

    // Verificar y renovar autenticación
    static async checkAuth() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    // Middleware para proteger rutas
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Middleware para verificar roles
    static requireRole(roles) {
        if (!this.requireAuth()) {
            return false;
        }

        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!this.hasAnyRole(userRoles)) {
            Utils.showAlert('No tienes permisos para acceder a esta página', 'danger');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    // Inicializar autenticación en la página
    static async initAuth() {
        // Verificar autenticación si existe token
        if (this.isAuthenticated()) {
            try {
                await this.getCurrentUser();
                return true;
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                return false;
            }
        }
        return false;
    }

    // Crear navbar con información del usuario
    static createNavbar() {
        const user = this.getUser();
        if (!user) return '';

        const roleText = {
            'admin': 'Administrador',
            'doctor': 'Doctor',
            'user': 'Usuario'
        };

        return `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div class="container-fluid">
                    <a class="navbar-brand fw-bold" href="dashboard.html">
                        <i class="bi bi-heart-pulse me-2"></i>
                        MEDIAGENDA
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="navbarNav">
                        ${this.getNavLinks()}
                        
                        <div class="navbar-nav ms-auto">
                            <div class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-person-circle me-1"></i>
                                    ${user.name}
                                    <span class="badge bg-light text-primary ms-1">${roleText[user.role]}</span>
                                </a>
                                <ul class="dropdown-menu">
                                    <li><h6 class="dropdown-header">${user.email}</h6></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="dashboard.html">
                                        <i class="bi bi-speedometer2 me-2"></i>Dashboard
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="AuthManager.logout()">
                                        <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    // Obtener enlaces de navegación según el rol
    static getNavLinks() {
        const user = this.getUser();
        if (!user) return '';

        const commonLinks = `
            <li class="nav-item">
                <a class="nav-link" href="dashboard.html">
                    <i class="bi bi-speedometer2 me-1"></i>Dashboard
                </a>
            </li>
        `;

        switch (user.role) {
            case 'admin':
                return `
                    <ul class="navbar-nav me-auto">
                        ${commonLinks}
                        <li class="nav-item">
                            <a class="nav-link" href="admin-appointments.html">
                                <i class="bi bi-calendar-check me-1"></i>Todas las Citas
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="admin-doctors.html">
                                <i class="bi bi-people me-1"></i>Doctores
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="admin-dashboard.html">
                                <i class="bi bi-bar-chart me-1"></i>Estadísticas
                            </a>
                        </li>
                    </ul>
                `;
            case 'doctor':
                return `
                    <ul class="navbar-nav me-auto">
                        ${commonLinks}
                        <li class="nav-item">
                            <a class="nav-link" href="doctor-appointments.html">
                                <i class="bi bi-calendar-heart me-1"></i>Mis Citas
                            </a>
                        </li>
                    </ul>
                `;
            case 'user':
            default:
                return `
                    <ul class="navbar-nav me-auto">
                        ${commonLinks}
                        <li class="nav-item">
                            <a class="nav-link" href="new-appointment.html">
                                <i class="bi bi-plus-circle me-1"></i>Nueva Cita
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="my-appointments.html">
                                <i class="bi bi-calendar-check me-1"></i>Mis Citas
                            </a>
                        </li>
                    </ul>
                `;
        }
    }

    // Renderizar navbar en el elemento especificado
    static renderNavbar(containerId = 'navbar-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.createNavbar();
        }
    }

    // Auto-logout cuando el token expire
    static setupAutoLogout() {
        const token = this.getToken();
        if (!token) return;

        try {
            // Decodificar el token para obtener la fecha de expiración
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convertir a milisegundos
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;

            if (timeUntilExpiration > 0) {
                // Configurar timeout para logout automático
                setTimeout(() => {
                    Utils.showAlert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
                    this.logout();
                }, timeUntilExpiration);

                // Mostrar advertencia 5 minutos antes del logout
                const warningTime = timeUntilExpiration - (5 * 60 * 1000);
                if (warningTime > 0) {
                    setTimeout(() => {
                        Utils.showAlert('Tu sesión expirará en 5 minutos.', 'warning');
                    }, warningTime);
                }
            } else {
                // El token ya expiró
                this.logout();
            }
        } catch (error) {
            console.error('Error al configurar auto-logout:', error);
        }
    }

    // Obtener el nombre del rol en español
    static getRoleName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'doctor': 'Doctor',
            'user': 'Usuario'
        };
        return roleNames[role] || role;
    }

    // Verificar permisos para una acción específica
    static canPerformAction(action) {
        const user = this.getUser();
        if (!user) return false;

        const permissions = {
            'view_all_appointments': ['admin'],
            'edit_appointments': ['admin'],
            'manage_doctors': ['admin'],
            'view_stats': ['admin'],
            'manage_users': ['admin'],
            'view_doctor_appointments': ['doctor', 'admin'],
            'create_appointment': ['user'],
            'view_my_appointments': ['user'],
            'cancel_own_appointment': ['user', 'admin']
        };

        const allowedRoles = permissions[action];
        return allowedRoles ? allowedRoles.includes(user.role) : false;
    }
}

// Inicializar autenticación cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Configurar auto-logout si está autenticado
    if (AuthManager.isAuthenticated()) {
        AuthManager.setupAutoLogout();
    }
});

// Interceptar errores de red para manejar tokens expirados
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('401')) {
        AuthManager.logout();
    }
});