# Lowballers Group Project - Rishan Baweja, Tyler Dang, Shane Billups, Adriel Cortez

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

