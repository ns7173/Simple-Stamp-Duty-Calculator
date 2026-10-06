# Stamp Duty and Registration Fees Calculator

A comprehensive property valuation and stamp duty calculator for Open Plots, Buildings, Flats, and Lease Deeds with unit conversions and government guideline rates.

## Features

- Property valuation calculations
- Stamp Duty computation
- Registration Fees calculation
- Support for multiple property types
- Unit conversions
- Government guideline rates
- Offline capability with PWA

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ns7173/Simple-Stamp-Duty-Calculator.git
cd Simple-Stamp-Duty-Calculator
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Build the application:
```bash
npm run build
```

## Running the Application

### As a Desktop App (Electron)

```bash
npx electron .
```

**Note:** Always use `npx electron .` to launch the app. Do not use `node .\node_modules\electron\dist\electron.exe .` directly, as it may result in binary corruption issues.

### Development Server

For development with hot reload:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Clean dist and build artifacts
- `npm run lint` - Run TypeScript type checking

## Project Structure

```
├── src/                 # Source code
├── dist/                # Production build (generated)
├── electron.cjs         # Electron main process entry point
├── package.json         # Project metadata and dependencies
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Configuration Notes

- **Vite Base**: Set to `./` to support Electron file:// URLs with relative asset paths
- **Electron Entry Point**: Uses `electron.cjs` (CommonJS format) for compatibility with ES modules
- **Type**: Project uses ES modules (`"type": "module"` in package.json)

## Build Information

- **Framework**: React 19
- **Build Tool**: Vite 8
- **CSS**: Tailwind CSS with Vite plugin
- **Desktop**: Electron 31
- **PWA**: vite-plugin-pwa with Workbox

## Troubleshooting

### Blank White Screen in Electron

If the app opens but shows only a blank white screen:

1. Ensure `base: './'` is set in `vite.config.ts`
2. Rebuild: `npm run build`
3. Launch: `npx electron .`

### Asset Loading Errors

The app uses relative asset paths (`./assets/...`) for Electron compatibility. This is intentional and required for the desktop app to work correctly.

## License

See LICENSE file for details.

## Author

Stamp Duty Calculator
