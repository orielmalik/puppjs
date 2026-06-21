function isValid(field, value) {
  switch (field) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'phone':
      return /^[+\d\s\-()]{7,}$/.test(value);
    case 'name':
      return /^[a-zA-ZÀ-ÿ\u0590-\u05FF\s'-]{2,}$/.test(value);
    case 'company':
      return /^[a-zA-Z0-9\s&._'-]{2,}$/.test(value);
    default:
      return true;
  }
}

function findPassValue(field, values) {
  for (const value of values) {
    if (isValid(field, value)) {
      return value;
    }
  }
  return '';
}

function findFailValue(field, values) {
  for (const value of values) {
    if (!isValid(field, value)) {
      return value;
    }
  }
  return '';
}

function buildCase(indexMap, mode, settings) {
  const normalizedMode = mode.toUpperCase();
  const testCase = {
    employees: settings.employeesValue || '51-500'
  };

  for (const [key, entry] of Object.entries(indexMap)) {
    if (key === 'primarybutton' || key === 'employees') continue;

    const values = entry.values || [];

    if (normalizedMode === 'PASS') {
      testCase[key] = findPassValue(key, values);
    } else if (normalizedMode === 'FAIL') {
      testCase[key] = findFailValue(key, values);
    } else {
      testCase[key] = values[0] ?? '';
    }
  }

  return testCase;
}

function buildArgentinaRunPlan({ requestedCount, requestedMode, settings, indexMap, thankYouSelector }) {
  const mode = (requestedMode || 'PASS').toUpperCase();
  const cases = [];

  for (let i = 0; i < requestedCount; i++) {
    cases.push(buildCase(indexMap, mode, settings));
  }

  return {
    iterations: requestedCount,
    mode,
    cases,
    thankYouSelector,
    employeesValue: settings.employeesValue || '51-500'
  };
}

module.exports = { buildArgentinaRunPlan };
