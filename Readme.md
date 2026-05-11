# PuppJS - Puppeteer Test Automation Framework

**Advanced Form Automation Framework** built with **Puppeteer** for reliable web form testing.

---

## Overview

**PuppJS** is a well-structured test automation framework designed to automatically fill, submit, and validate web forms. 

The framework currently targets the demo form at:  
**https://testsite.getjones.com/ExampleForm/**

It fills all fields (Name, Email, Phone, Company, Number of Employees), captures screenshots, submits the form, verifies successful submission on the "Thank You" page, and cleans the form for the next test iteration.

The project is built using professional design patterns and a **Finite State Machine (FSM)** to manage the test flow efficiently.

---

## What This Code Does

- Launches a Puppeteer browser (headless or headful)
- Navigates to the target form page
- Loads test data from JSON files
- Fills every form field according to the selected test mode
- Selects dropdown value (Number of Employees)
- Takes screenshots before submission
- Submits the form
- Validates that the success ("Thank You") page appears
- Clears the form
- Repeats the process for the requested number of iterations
- Provides clear console logging and final summary

Supports two main modes:
- **`PASS`** – Positive test cases (valid data)
- **`FAIL`** – Negative / Edge case testing

---

## Key Features

- Clean separation of concerns using design patterns (Adapter, Builder, Engine, etc.)
- JSON-driven test data (easy to add or modify test cases)
- Robust error handling and logging
- Automatic form cleanup between iterations
- Screenshot capture for every test
- Finite State Machine for reliable workflow control
- Highly maintainable and scalable architecture
- Easy configuration via `settings.json`

---

## Project Structure

```bash
puppjs/
├── index.js                    # Main entry point
├── Jsons/
│   ├── ArgentinaForm.json      # Test data
│   └── settings.json           # Configuration
├── Patterns/                   # Design patterns (Adapter, Builder, Logger...)
├── Engine/                     # Flow Engine & State Machine
├── Actions/                    # Puppeteer actions
├── Utils/                      # Helpers, validators, etc.
├── Selectors/                  # All element selectors
└── screenshots/                # Automatically created folder
