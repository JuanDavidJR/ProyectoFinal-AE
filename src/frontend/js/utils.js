// js/utils.js
class Utils {
    // Mostrar alertas
    static showAlert(message, type = 'info', duration = 5000) {
        // Crear el elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
        `;
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Agregar al body
        document.body.appendChild(alertDiv);
        
        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }

    // Mostrar loading spinner
    static showLoading(element, text = 'Cargando...') {
        const originalContent = element.innerHTML;
        element.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${text}
        `;
        element.disabled = true;
        
        return {
            hide: () => {
                element.innerHTML = originalContent;
                element.disabled = false;
            }
        };
    }

    // Formatear fecha
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Formatear fecha corta
    static formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Formatear hora
    static formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    // Generar fechas disponibles (próximos 30 días laborables)
    static getAvailableDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayOfWeek = date.getDay();
            // Excluir sábados (6) y domingos (0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                dates.push({
                    value: date.toISOString().split('T')[0],
                    label: Utils.formatDate(date.toISOString())
                });
            }
        }
        
        return dates;
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar formulario
    static validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const errorElement = input.parentNode.querySelector('.text-danger');
            
            // Remover mensaje de error anterior
            if (errorElement) {
                errorElement.remove();
            }
            
            // Validar campo requerido
            if (!value) {
                Utils.showFieldError(input, 'Este campo es requerido');
                isValid = false;
                return;
            }
            
            // Validar email
            if (input.type === 'email' && !Utils.isValidEmail(value)) {
                Utils.showFieldError(input, 'Formato de email inválido');
                isValid = false;
                return;
            }
            
            // Validar contraseña
            if (input.type === 'password' && value.length < 6) {
                Utils.showFieldError(input, 'La contraseña debe tener al menos 6 caracteres');
                isValid = false;
                return;
            }
            
            // Validar confirmación de contraseña
            if (input.name === 'confirmPassword') {
                const passwordInput = formElement.querySelector('input[name="password"]');
                if (passwordInput && value !== passwordInput.value) {
                    Utils.showFieldError(input, 'Las contraseñas no coinciden');
                    isValid = false;
                    return;
                }
            }
        });
        
        return isValid;
    }

    // Mostrar error en campo específico
    static showFieldError(input, message) {
        input.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-danger small mt-1';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        
        // Remover error cuando el usuario empiece a escribir
        input.addEventListener('input', function() {
            input.classList.remove('is-invalid');
            const errorElement = input.parentNode.querySelector('.text-danger');
            if (errorElement) {
                errorElement.remove();
            }
        }, { once: true });
    }

    // Limpiar errores de formulario
    static clearFormErrors(formElement) {
        const invalidInputs = formElement.querySelectorAll('.is-invalid');
        const errorMessages = formElement.querySelectorAll('.text-danger');
        
        invalidInputs.forEach(input => input.classList.remove('is-invalid'));
        errorMessages.forEach(message => message.remove());
    }

    // Obtener datos del formulario
    static getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Llenar select con opciones
    static populateSelect(selectElement, options, placeholder = 'Seleccionar...') {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value || option.id;
            optionElement.textContent = option.label || option.name;
            selectElement.appendChild(optionElement);
        });
    }

    // Crear badge de estado
    static createStatusBadge(status) {
        const statusConfig = {
            'scheduled': { class: 'badge-scheduled', text: 'Programada' },
            'completed': { class: 'badge-completed', text: 'Completada' },
            'cancelled': { class: 'badge-cancelled', text: 'Cancelada' }
        };
        
        const config = statusConfig[status] || { class: 'badge-secondary', text: status };
        
        return `<span class="badge ${config.class}">${config.text}</span>`;
    }

    // Confirmar acción
    static async confirmAction(message, title = 'Confirmar acción') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirm-btn">Confirmar</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            modal.querySelector('#confirm-btn').addEventListener('click', () => {
                modalInstance.hide();
                resolve(true);
            });
            
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Escapar HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showAlert('Copiado al portapapeles', 'success', 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
            Utils.showAlert('Error al copiar al portapapeles', 'danger');
        }
    }

    // Scroll suave al elemento
    static scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Detectar dispositivo móvil
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Formatear número con separadores de miles
    static formatNumber(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    }

    // Capitalizar primera letra
    static capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Truncar texto
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}