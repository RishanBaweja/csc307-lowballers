#### Rishan Baweja, Tyler Dang, Shane Billups, Adriel Cortez

#### Zielke, Chris

#### CSC 307

#### 19 October 2025

# <p align="center"> Lowballers' Product Vision </p>

## Product Vision

**For** home owners **Who** are those looking to get rid of their household items that clutter their space, **The** Lowballers **is a** web application **That** lists items that they no longer use to be given away for free **Unlike** Facebook Marketplace or EBay, **Our Product** focuses on free items and scheduling specific times for pickup. The issue with current applications to list your items is that there is too many people who do not respond, in order to send a request for pickup on the Lowballers application, you must send a pickup time that works for you.

# Contributing:

- ESLint: Currently abiding by default ESLint rules, we may make changes in the future depending on requirements.
- Prettier: Following the formatting rules at the moment.
  - "semi": true,
  - "trailingComma": "es5",
  - "singleQuote": false,
  - "printWidth": 80,
  - "tabWidth": 2,
  - "useTabs": false,
  - "bracketSpacing": true,
  - "arrowParens": "avoid"

# Install Info

- ESLint: npm init @eslint/config@latest, then add rules into configuration file
- Prettier:
  - npm install --save-dev --save-exact prettier
  - Then, create empty config file: node --eval "fs.writeFileSync('.prettierrc','{}\n')"
  - To avoid formatting certain files: node --eval "fs.writeFileSync('.prettierignore','# Ignore artifacts:\nbuild\ncoverage\n')"
