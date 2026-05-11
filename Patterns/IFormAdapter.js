class IFormAdapter {
  async goToForm()              { throw new Error('goToForm() not implemented'); }
  async fillForm(testCase)      { throw new Error('fillForm() not implemented'); }
  async selectEmployees(value)  { throw new Error('selectEmployees() not implemented'); }
  async takeScreenshot(index)   { throw new Error('takeScreenshot() not implemented'); }
  async submit()                { throw new Error('submit() not implemented'); }
  async isThankYouPage()        { throw new Error('isThankYouPage() not implemented'); }
  async clearForm()             { throw new Error('clearForm() not implemented'); }
}

module.exports = IFormAdapter;
