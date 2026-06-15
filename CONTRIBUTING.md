# Contributing to Multi-Client Astro

Thank you for your interest in contributing to Multi-Client Astro! This document provides guidelines and instructions for contributing to the project.

## 🎯 Project Goals

Multi-Client Astro is designed to be a robust, production-ready framework for hosting multiple client sites from a single codebase. We welcome contributions that:

- Fix bugs and improve stability
- Enhance existing features
- Improve documentation
- Add useful features that benefit multi-tenant use cases
- Optimize performance

## 🐛 Reporting Bugs

Before creating a bug report, please:

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** to ensure it's not expected behavior
3. **Test with the latest version** to see if the issue has been fixed

When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (Node version, OS, browser)
- **Code samples** or repository links if applicable
- **Screenshots** if relevant

## ✨ Suggesting Features

We're open to feature suggestions! When proposing a new feature:

1. **Check existing issues** to see if it's already been suggested
2. **Explain the use case** — why would this be useful?
3. **Describe the solution** — how should it work?
4. **Consider alternatives** — are there other ways to achieve this?
5. **Keep scope reasonable** — smaller, focused features are easier to implement

## 🔧 Development Setup

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm (recommended) or npm

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/keyanfayaz/client-sites.git
cd client-sites

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm preview` — Preview production build
- `pnpm typecheck` — Run TypeScript type checking
- `pnpm lint` — Run ESLint
- `pnpm format` — Format code with Prettier
- `pnpm new:client <slug> "Name"` — Create new client

## 📝 Pull Request Process

### Before Submitting

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```

4. **Update documentation** if needed (README, comments, etc.)

5. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "feat: add new feature X"
   git commit -m "fix: resolve issue with Y"
   git commit -m "docs: update README for Z"
   ```

### Commit Message Convention

We follow a simple commit message convention:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code refactoring
- `perf:` — Performance improvements
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

### Submitting the PR

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers (if applicable)
   - Testing performed
   - Screenshots (if UI changes)

4. **Wait for review** — maintainers will review and provide feedback

5. **Address feedback** — make requested changes and push updates

6. **Merge** — once approved, a maintainer will merge your PR

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Prefer functional programming patterns where appropriate

### Astro Components

- Keep components focused and single-purpose
- Use props for configuration
- Follow Astro's component conventions
- Use TypeScript for prop types

### CSS/Styling

- Use TailwindCSS utility classes
- Follow existing styling patterns
- Keep styles scoped to components
- Use CSS custom properties for theming

### File Organization

- Place files in appropriate directories
- Keep related code together
- Use clear, descriptive file names
- Follow existing project structure

## 🧪 Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

For now, please manually test:

1. **Build succeeds**: `pnpm build`
2. **Type checking passes**: `pnpm typecheck`
3. **Linting passes**: `pnpm lint`
4. **Features work** in development and production modes
5. **Multiple clients** work correctly
6. **No console errors** in browser

## 📚 Documentation

Good documentation is crucial! When contributing:

- Update README.md for new features
- Add JSDoc comments to functions and types
- Include code examples where helpful
- Update CONTRIBUTING.md if process changes

## 🤔 Questions?

If you have questions about contributing:

- Check existing [Issues](https://github.com/keyanfayaz/client-sites/issues)
- Start a [Discussion](https://github.com/keyanfayaz/client-sites/discussions)
- Review the [README](README.md) documentation

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate for a professional setting

## 📄 License

By contributing to Multi-Client Astro, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Multi-Client Astro! 🎉



