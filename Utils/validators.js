const FIELD_RULES = {
  name:    /^[A-Za-z\s]{2,}$/,
  email:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone:   /^\+?[\d]{7,15}$/,
  company: /^[A-Za-z0-9\s]{2,}$/,
};

const BUCKETS = {
  PASS:         'PASS',
  FAIL_EMPTY:   'FAIL_EMPTY',
  FAIL_SPACE:   'FAIL_SPACE',
  FAIL_FORMAT:  'FAIL_FORMAT',
};

const { readJson } =
    require('../Utils/helpers');

function validateByKey(field, value) {

  // ריק תמיד לא תקין מבחינת "valid"
  if (value === '' || value === null || value === undefined) {
    return false;
  }

  switch (field) {

    case 'name':
      return /^[a-zA-ZÀ-ÿ\u0590-\u05FF\s'-]{2,}$/.test(value);

    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    case 'phone':
      return /^[+\d\s\-()]{7,15}$/.test(value);

    case 'company':
      return /^[a-zA-Z0-9\s&._'-]{2,}$/.test(value);

    default:
      return true;
  }
}
function classifyField(field, values) {

  let hasValid = false;
  let allEmpty = true;

  for (const value of values) {

    if (value !== '' && value !== null && value !== undefined) {
      allEmpty = false;
    }

    if (validateByKey(field, value)) {
      hasValid = true;
    }
  }

  if (allEmpty) {
    return 'FAIL';
  }

  return hasValid ? 'PASS' : 'FAIL';
}


const MAPPING_ARGFORM = {
  name: '[name="name"]',
  email: '[name="email"]',
  phone: '[name="phone"]',
  company: '[name="company"]',
  employees: '[name="employees"]',
  submitbutton: '/html/body/div/div[2]/div[2]/div/form/p[6]/button'
};

module.exports = {
  classifyField,MAPPING_ARGFORM
};


