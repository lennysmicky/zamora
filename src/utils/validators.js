// src/utils/validators.js

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 caractères)
export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

// Password strength
export const getPasswordStrength = (password) => {
  if (!password) return null;
  
  let strength = 0;
  
  // Longueur
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Contient des chiffres
  if (/\d/.test(password)) strength++;
  
  // Contient des minuscules et majuscules
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  
  // Contient des caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Required field
export const isRequired = (value) => {
  return value && value.trim().length > 0;
};

// Passwords match
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};
 // Address validation (min 5 caractères)
export const isValidAddress = (address) => {
  return address && address.trim().length >= 5;
};

// Restaurant name (min 2 caractères)
export const isValidRestaurantName = (name) => {
  return name && name.trim().length >= 2;
};

// Validate form fields
export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!isRequired(email)) {
    errors.email = 'required';
  } else if (!isValidEmail(email)) {
    errors.email = 'invalidEmail';
  }
  
  if (!isRequired(password)) {
    errors.password = 'required';
  } else if (!isValidPassword(password)) {
    errors.password = 'invalidPassword';
  }
   
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (data) => {
  const errors = {};
  
  // Restaurant name
  if (!isRequired(data.restaurantName)) {
    errors.restaurantName = 'required';
  } else if (!isValidRestaurantName(data.restaurantName)) {
    errors.restaurantName = 'invalidRestaurantName';
  }
  
  // Email
  if (!isRequired(data.email)) {
    errors.email = 'required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'invalidEmail';
  }
  
  // Phone
  if (!isRequired(data.phone)) {
    errors.phone = 'required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'invalidPhone';
  }

  // Address
  if (!isRequired(data.address)) {
    errors.address = 'required';
  } else if (!isValidAddress(data.address)) {
    errors.address = 'invalidAddress';
  }
  
  
  // Password
  if (!isRequired(data.password)) {
    errors.password = 'required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'invalidPassword';
  }
  
  // Confirm password
  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = 'required';
  } else if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'passwordMismatch';
  }
  
  // Terms
  if (!data.acceptTerms) {
    errors.acceptTerms = 'termsRequired';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};