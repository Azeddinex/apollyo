# Development Guide

Complete guide for setting up and developing apollyo locally.

## Prerequisites

### Required Software

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn 1.22.0+)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions

\`\`\`json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens"
  ]
}
\`\`\`

## Initial Setup

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/apollyo/apollyo.git
cd apollyo
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create `.env.local` file (optional):

\`\`\`bash
# Optional: OpenAI API key for enhanced agent
OPENAI_API_KEY=sk-...

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
apollyo/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── search/         # Main search endpoint
│   │   └── validate/       # Word validation endpoint
│   ├── page.tsx            # Main page
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   └── loading.tsx         # Loading state
│
├── components/              # React components
│   ├── ui/                 # Reusable UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   ├── apollyo-logo.tsx    # Brand logo
│   ├── mode-selector.tsx   # Mode selection
│   ├── filter-panel.tsx    # Filter configuration
│   ├── results-manager.tsx # Results display
│   └── api-settings.tsx    # API key settings
│
├── lib/                     # Core logic
│   ├── agent/              # AI agents
│   │   ├── internal-intelligence.ts
│   │   └── enhanced-filter-analyzer.ts
│   ├── core/               # Core engines
│   │   ├── speed-mode-engine.ts
│   │   ├── hyper-crawler.ts
│   │   ├── search-engine.ts
│   │   └── session-manager.ts
│   ├── filters/            # Filter system
│   │   └── filter-manager.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils.ts            # Utility functions
│
├── public/                  # Static assets
│   └── ...
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── CONTRIBUTING.md
│   └── DEVELOPMENT.md
│
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── README.md
└── LICENSE
\`\`\`

## Development Workflow

### 1. Create Feature Branch

\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

### 2. Make Changes

Follow coding standards in CONTRIBUTING.md

### 3. Test Locally

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### 4. Commit Changes

\`\`\`bash
git add .
git commit -m "feat: add new feature"
\`\`\`

### 5. Push and Create PR

\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

## Common Development Tasks

### Adding a New Filter

1. Update types in `lib/types/index.ts`:
\`\`\`typescript
export interface FilterConfig {
  // ... existing filters
  newFilter?: string;
}
\`\`\`

2. Add UI in `components/filter-panel.tsx`:
\`\`\`tsx
<div>
  <Label>New Filter</Label>
  <Input
    value={filters.newFilter}
    onChange={(e) => setFilters({...filters, newFilter: e.target.value})}
  />
</div>
\`\`\`

3. Implement logic in `lib/filters/filter-manager.ts`:
\`\`\`typescript
applyNewFilter(words: Word[], value: string): Word[] {
  return words.filter(word => /* your logic */);
}
\`\`\`

### Adding a New Component

1. Create component file:
\`\`\`bash
touch components/my-component.tsx
\`\`\`

2. Implement component:
\`\`\`tsx
'use client';

import { FC } from 'react';

interface MyComponentProps {
  // props
}

export const MyComponent: FC<MyComponentProps> = ({ /* props */ }) => {
  return (
    <div>
      {/* component content */}
    </div>
  );
};
\`\`\`

3. Export from index (if needed):
\`\`\`typescript
export { MyComponent } from './my-component';
\`\`\`

### Debugging

Use console.log with [apollyo] prefix:

\`\`\`typescript
console.log('[apollyo] Search started', { mode, filters });
\`\`\`

Enable verbose logging:

\`\`\`typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('[apollyo] Debug info', data);
}
\`\`\`

### Testing Different Modes

**Speed Mode**:
\`\`\`typescript
// Test with minimal filters
{
  mode: 'speed',
  filters: { minLength: 5, maxLength: 8 },
  maxResults: 100
}

// Test with complex filters
{
  mode: 'speed',
  filters: {
    minLength: 6,
    maxLength: 10,
    startsWith: 'app',
    vowelRatio: 0.4,
    allowDoubleConsonants: true
  },
  maxResults: 200
}
\`\`\`

**Hyper Mode**:
\`\`\`typescript
// Test with basic filters
{
  mode: 'hyper',
  filters: {
    minLength: 6,
    rarityThreshold: 0.5
  },
  crawlDepth: 2,
  maxResults: 50
}

// Test with all filters
{
  mode: 'hyper',
  filters: {
    minLength: 7,
    maxLength: 12,
    rarityThreshold: 0.8,
    marketPotential: 0.9,
    brandability: 0.9,
    domainCategories: ['technology', 'business']
  },
  crawlDepth: 4,
  maxResults: 100
}
\`\`\`

## Performance Optimization

### Profiling

Use React DevTools Profiler:

\`\`\`bash
npm install -g react-devtools
react-devtools
\`\`\`

### Bundle Analysis

\`\`\`bash
npm run build
npm run analyze  # If configured
\`\`\`

### Lighthouse Testing

\`\`\`bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
\`\`\`

## Troubleshooting

### Port Already in Use

\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
\`\`\`

### Module Not Found

\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Build Errors

\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

### Type Errors

\`\`\`bash
# Check TypeScript
npx tsc --noEmit
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Configure domain
4. Deploy

### Manual Deployment

\`\`\`bash
# Build
npm run build

# Start
npm start
\`\`\`

### Docker (Future)

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)

## Getting Help

- Check documentation first
- Search existing issues
- Ask in discussions
- Email: admin@apollyo.com

---

Happy coding!
