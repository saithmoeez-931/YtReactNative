function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function hasLetterOrNumber(value) {
  return /[A-Za-z0-9]/.test(String(value || ''));
}

function isValidName(value) {
  const text = cleanText(value);
  return text.length >= 2 && /^[A-Za-z][A-Za-z\s'.-]*$/.test(text);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanText(value).toLowerCase());
}

function isValidPassword(value, required = true) {
  const text = String(value || '').trim();

  if (!required && !text) {
    return true;
  }

  return text.length >= 8 && /[A-Za-z]/.test(text) && /\d/.test(text);
}

function isUsefulCode(value, minLength = 1) {
  const text = cleanText(value);
  return text.length >= minLength && hasLetterOrNumber(text) && /^[A-Za-z0-9\s#/-]+$/.test(text);
}

function isUsefulText(value, minLength) {
  const text = cleanText(value);
  const meaningfulChars = (text.match(/[A-Za-z0-9]/g) || []).length;
  return text.length >= minLength && meaningfulChars >= minLength;
}

module.exports = {
  cleanText,
  isUsefulCode,
  isUsefulText,
  isValidEmail,
  isValidName,
  isValidPassword,
};
