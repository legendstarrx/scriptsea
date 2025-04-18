export const validateInput = {
  email: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;
    
    const domain = email.split('@')[1].toLowerCase();
    return !TEMP_EMAIL_DOMAINS.includes(domain);
  },
  
  password: (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpper && hasLower && 
           hasNumber && hasSpecial;
  },
  
  sanitize: (input) => {
    return input.replace(/[<>]/g, '');
  }
}; 