#### Rishan Baweja, Tyler Dang, Shane Billups, Adriel Cortez

#### Zielke, Chris

#### CSC 307

#### 19 October 2025

# <p align="center"> Lowballers' Product Vision </p>

## Product Vision

**For** home owners **Who** are those looking to get rid of their household items that clutter their space, **The** Lowballers **is a** web application **That** lists items that they no longer use to be given away for free. **Unlike** Facebook Marketplace or EBay, **Our Product** focuses on free items and locations for pickup. Come and list your own items, or simply browse around. See something you like? Send a message to meetup! Or also modify your profile to make it extra appealing to any potential **Lowballers** looking for free goods.

## UI Prototype (Last modified 10/30)
- https://www.figma.com/design/z7bFkwgJs3Sz1fpo6f3fTb/Schematic?node-id=0-1&t=MuqgWuLVq0VVcU8E-1



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
