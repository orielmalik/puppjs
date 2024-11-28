# Puppeteer Test Automation Script

This repository contains a Puppeteer script that performs automated testing on a form. The script types values into form fields, takes screenshots, and interacts with the page. It also handles different test scenarios like validating multiple inputs and checking if the user reaches the "Thank You" page.

## Overview

The automation flow includes the following steps:

1. Type values in the Name, Email, Phone, and Company fields from a predefined set of test values.
2. Create a screenshot of the page before clicking the “Request a call back” button.(Exist screenshots file)
3. Change the "Number of Employees" from 1-10 to 51-500 (Bonus feature).
4. Click the "Request a call back" button.
5. Log the URL when reaching the "Thank You" page.
6. Clean the form fields after each test to prepare for the next input.

## The Test Map

The values for the form fields are provided in a `Map` object. Each key corresponds to a field's selector, and the values are an array of test inputs.

```javascript
const myMap = new Map();

myMap.set("#name", ["", "Bo99@b", "Charlie", "Charlie ", "Ch arlie", "Charlie"]);
myMap.set("#email", ["", "example.com", "charlie@example.com", "ch arlie@example.com", "charlie@example.com", "charlie@example.com"]);
myMap.set("#phone", ["", "--9876543210", "+5412345678", "+5412345678 ", "+54 12345678", "+5412345678"]);
myMap.set("#company", ["", "-Com+pan@y", "BBB", "BBB ", "BB B", "BBB"]);


### Explanation:

- **Test Steps**: Describes the sequence of actions (typing values, taking screenshots, clicking buttons, and validating the result).
- **Map**: Specifies the test data used for the fields (Name, Email, Phone, Company).
- **Script**: Full Puppeteer script for automation.
- **Installation & Usage**: Instructions to clone the repo, install dependencies, and run the script.