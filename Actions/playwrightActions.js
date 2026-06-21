function playwrightXPathQuery(xpath) {
  return `xpath=${xpath}`;
}

function resolveLocator(page, raw) {
  if (raw.startsWith('xpath=')) {
    return page.locator(playwrightXPathQuery(raw.replace(/^xpath=/, '')));
  }
  return page.locator(raw);
}

function mapWaitUntil(waitUntil) {
  if (waitUntil === 'networkidle2' || waitUntil === 'networkidle0') {
    return 'networkidle';
  }
  return waitUntil || 'load';
}

async function navigate(page, url, waitUntil) {
  await page.goto(url, { waitUntil: mapWaitUntil(waitUntil) });
}

async function type(page, selector, value, timeout) {
  const locator = resolveLocator(page, selector);
  await locator.waitFor({ state: 'visible', timeout });
  await locator.fill(String(value));
}

async function click(page, selector, timeout, retries = 2) {
  const locator = resolveLocator(page, selector);
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      await locator.click({ timeout });
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function snapshot(page, filePath, settleMs) {
  if (settleMs && settleMs > 0) {
    await page.waitForTimeout(settleMs);
  }
  await page.screenshot({ path: filePath, type: 'png' });
}

async function queryHandle(page, raw) {
  const locator = resolveLocator(page, raw);
  try {
    await locator.waitFor({ state: 'attached', timeout: 1000 });
    const count = await locator.count();
    return count > 0 ? locator.first() : null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  navigate,
  type,
  click,
  snapshot,
  queryHandle,
  playwrightXPathQuery
};
