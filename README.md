## Local Development

Clone the repository and install dependencies:

npm install
npm run dev

To run this project locally, start the development server and open:

http://localhost:5173/

## OrbitAI — Student Productivity AI Agent

OrbitAI is an intelligent student productivity assistant designed to help students manage tasks, organize study schedules, boost focus, and streamline academic workflows using AI-powered automation.

Built with modern AI technologies, OrbitAI combines the flexibility of TypeScript with the power of LangChain to create a scalable and smart productivity ecosystem for students.

# Project Structure

OrbitAI/
│── src/
│   ├── agents/
│   ├── tools/
│   ├── prompts/
│   ├── services/
│   ├── utils/
│   └── index.ts
│
│── public/
│── package.json
│── tsconfig.json
│── .env
│── README.md

## How OrbitAi works

How OrbitAI Works

OrbitAI leverages LangChain agents and AI workflows to:

Understand student queries
Organize academic tasks
Generate productivity recommendations
Help manage study sessions efficiently
Provide conversational assistance in real time


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
