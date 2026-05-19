export function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function hasLetterOrNumber(value) {
  return /[A-Za-z0-9]/.test(String(value || ''));
}

export function isValidName(value) {
  const text = cleanText(value);
  return text.length >= 2 && /^[A-Za-z][A-Za-z\s'.-]*$/.test(text);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanText(value).toLowerCase());
}

export function isValidPassword(value, required = true) {
  const text = String(value || '').trim();

  if (!required && !text) {
    return true;
  }

  return (
    text.length >= 8 &&
    /[A-Za-z]/.test(text) &&
    /\d/.test(text) &&
    /[A-Za-z0-9]/.test(text)
  );
}

export function isUsefulCode(value, minLength = 1) {
  const text = cleanText(value);
  return text.length >= minLength && hasLetterOrNumber(text) && /^[A-Za-z0-9\s#/-]+$/.test(text);
}

export function isUsefulText(value, minLength) {
  const text = cleanText(value);
  const meaningfulChars = (text.match(/[A-Za-z0-9]/g) || []).length;
  return text.length >= minLength && meaningfulChars >= minLength;
}

export function validateAccountForm(form, { passwordRequired = true } = {}) {
  const errors = {};
  const payload = {
    name: cleanText(form.name),
    email: cleanText(form.email).toLowerCase(),
    password: String(form.password || '').trim(),
  };

  if (!isValidName(payload.name)) {
    errors.name = 'Enter a real name using letters and spaces.';
  }

  if (!isValidEmail(payload.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isValidPassword(payload.password, passwordRequired)) {
    errors.password = passwordRequired
      ? 'Password must be at least 8 characters and include letters and numbers.'
      : 'New password must be at least 8 characters and include letters and numbers.';
  }

  return { errors, payload };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
