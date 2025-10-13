# Contributing to apollyo

Thank you for your interest in contributing to apollyo! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/apollyo.git
   cd apollyo
   \`\`\`
3. Add the upstream repository:
   \`\`\`bash
   git remote add upstream https://github.com/apollyo/apollyo.git
   \`\`\`
4. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Workflow

1. **Create a branch** for your feature or fix:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly

4. **Commit your changes** with clear, descriptive messages

5. **Push to your fork**:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

6. **Open a Pull Request** on GitHub

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization

\`\`\`
apollyo/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx             # Feature components
├── lib/                   # Core logic
│   ├── agent/            # AI agents
│   ├── core/             # Core engines
│   ├── filters/          # Filter system
│   └── types/            # TypeScript types
└── public/               # Static assets
\`\`\`

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic design tokens from globals.css
- Maintain consistent spacing and typography

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Keep lines under 100 characters when possible

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

\`\`\`
feat(hyper-mode): add domain category filtering

Add support for filtering by 19 domain categories in Hyper Mode.
This allows users to focus their search on specific industries.

Closes #123
\`\`\`

\`\`\`
fix(session-manager): prevent duplicate results

Fix bug where duplicate words could appear in the same session
when using different filter combinations.
\`\`\`

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features

2. **Ensure all tests pass** and add new tests for new features

3. **Update the README.md** if needed

4. **Fill out the PR template** completely:
   - Description of changes
   - Related issues
   - Screenshots (for UI changes)
   - Testing steps

5. **Request review** from maintainers

6. **Address feedback** promptly and professionally

7. **Squash commits** if requested before merging

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Speed Mode**: Test with various filter combinations
2. **Hyper Mode**: Test web scraping with different depths
3. **Responsive Design**: Test on mobile, tablet, and desktop
4. **Error Handling**: Test edge cases and error scenarios
5. **Session Management**: Verify no duplicate results

### Browser Testing

Test in multiple browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Areas for Contribution

### High Priority

- Improve web scraping efficiency
- Add more domain sources
- Enhance AI agent intelligence
- Optimize performance
- Add unit tests

### Medium Priority

- Add more export formats
- Improve accessibility
- Add keyboard shortcuts
- Enhance mobile experience
- Add dark mode toggle

### Documentation

- Improve API documentation
- Add code examples
- Create video tutorials
- Translate documentation

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search existing issues
3. Open a new issue with the "question" label
4. Email us at admin@apollyo.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to apollyo!
