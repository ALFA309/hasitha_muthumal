// Contact Page JavaScript for Velvet Vogue

// DOM Elements
const contactForm = document.getElementById('contact-form');
const faqItems = document.querySelectorAll('.faq-item');

// Initialize contact page
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    setupContactForm();
    setupFAQ();
    setupFormValidation();
}

// Setup contact form
function setupContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        if (window.VelvetVogue && window.VelvetVogue.showNotification) {
            window.VelvetVogue.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        }
        
        // Reset form
        contactForm.reset();
        clearAllErrors();
        
        // Log form data (for demonstration)
        console.log('Form submitted:', data);
        
    }, 2000);
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'firstName', message: 'First name is required' },
        { id: 'lastName', message: 'Last name is required' },
        { id: 'email', message: 'Email address is required' },
        { id: 'subject', message: 'Please select a subject' },
        { id: 'message', message: 'Message is required' }
    ];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input.value.trim()) {
            showFieldError(input, field.message);
            isValid = false;
        }
    });
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation (if provided)
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        showFieldError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Message length validation
    const messageInput = document.getElementById('message');
    if (messageInput.value && messageInput.value.length < 10) {
        showFieldError(messageInput, 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous error
    clearFieldError(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        const fieldName = field.previousElementSibling.textContent.replace(' *', '');
        showFieldError(field, `${fieldName} is required`);
        return false;
    }
    
    // Specific validations
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'tel':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
    }
    
    // Message length validation
    if (field.id === 'message' && value && value.length < 10) {
        showFieldError(field, 'Message must be at least 10 characters long');
        return false;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Add error styles to field
    field.style.borderColor = '#dc3545';
    field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
}

// Clear field error
function clearFieldError(field) {
    // Remove error class
    field.classList.remove('error');
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    
    // Reset field styles
    field.style.borderColor = '';
    field.style.boxShadow = '';
}

// Clear all form errors
function clearAllErrors() {
    const errorElements = contactForm.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const errorFields = contactForm.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
        field.style.borderColor = '';
        field.style.boxShadow = '';
    });
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Check if it's a valid length (10-15 digits)
    return digits.length >= 10 && digits.length <= 15;
}

// Setup FAQ accordion
function setupFAQ() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Update answer height for smooth animation
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    });
}

// Setup form validation styles
function setupFormValidation() {
    // Add validation styles to the document
    const validationStyles = `
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
        
        .form-group input.success,
        .form-group select.success,
        .form-group textarea.success {
            border-color: #28a745 !important;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1) !important;
        }
        
        .field-error {
            animation: fadeInError 0.3s ease;
        }
        
        @keyframes fadeInError {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .contact-form button[type="submit"]:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
    
    // Create and append style element
    const styleElement = document.createElement('style');
    styleElement.textContent = validationStyles;
    document.head.appendChild(styleElement);
}

// Auto-resize textarea
function setupTextareaAutoResize() {
    const textarea = document.getElementById('message');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

// Format phone number as user types
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length > 0) {
        if (value.length <= 3) {
            formattedValue = `(${value}`;
        } else if (value.length <= 6) {
            formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    
    input.value = formattedValue;
}

// Add phone formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
    
    // Setup textarea auto-resize
    setupTextareaAutoResize();
});

// Character counter for message field
function setupCharacterCounter() {
    const messageField = document.getElementById('message');
    if (messageField) {
        const maxLength = 1000;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        `;
        
        messageField.parentNode.appendChild(counter);
        
        // Update counter
        function updateCounter() {
            const remaining = maxLength - messageField.value.length;
            counter.textContent = `${messageField.value.length}/${maxLength} characters`;
            
            if (remaining < 50) {
                counter.style.color = '#dc3545';
            } else if (remaining < 100) {
                counter.style.color = '#ffc107';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        }
        
        messageField.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
}

// Initialize character counter
document.addEventListener('DOMContentLoaded', function() {
    setupCharacterCounter();
});

// Export functions for use in other scripts
window.ContactPage = {
    validateForm,
    clearAllErrors,
    isValidEmail,
    isValidPhone
};