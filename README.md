# CreatOK UI Clone

A pixel-perfect recreation of the CreatOK.ai landing page built with Next.js 14, TypeScript, Tailwind CSS, and Radix UI.

## Features

- ✨ **Modern Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS
- 🎨 **Custom Components**: Built with Radix UI primitives for accessibility
- 🌈 **Glowing Effects**: Custom gradient border animations matching the original
- 📱 **Fully Responsive**: Mobile-first design with tablet and desktop breakpoints
- 🎭 **Smooth Animations**: CSS-based fade-in animations for page elements
- 🎯 **Dark Theme**: Professional dark theme with carefully crafted color system

## Project Structure

```
rocket-plan-ui/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles and theme variables
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   └── glowing-card.tsx
│   ├── header.tsx          # Navigation header
│   ├── hero-section.tsx    # Hero section with title
│   ├── video-generator-form.tsx  # Core video generation form
│   ├── stats-section.tsx   # Statistics display
│   └── features-section.tsx # Features grid
└── lib/
    └── utils.ts            # Utility functions (cn helper)
```

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

## Key Components

### Header
- Responsive navigation with mobile hamburger menu
- Language selector with Radix UI Select
- Smooth hover transitions

### VideoGeneratorForm
- Tab switcher for Reference Image / First Frame modes
- File upload with preview
- Auto-expanding textarea with character count
- Model selector and settings controls
- Generate button with credit display

### GlowingCard
- Custom gradient border effect with CSS variables
- Multiple color gradients animated in conic pattern
- Configurable intensity levels (low, medium, high)

### Stats & Features
- 3-column grid layout
- Icon-based cards with glowing borders
- Responsive breakpoints for mobile/tablet/desktop

## Design System

### Colors
- Background: `hsl(0 0% 3.9%)`
- Primary (Orange): `hsl(24.6 95% 53.1%)`
- Muted: `hsl(0 0% 14.9%)`
- Foreground: `hsl(0 0% 98%)`

### Typography
- Font: Geist Sans & Geist Mono
- Headings: 3xl to 5xl with semibold weight
- Body: sm to base with responsive scaling

### Spacing
- Max width: 7xl (1280px)
- Padding: 4 to 6 units
- Gaps: 2 to 12 units

## API Integration Ready

The form components are structured to easily integrate with backend APIs:

- `VideoGeneratorForm` has state management for prompt, files, and settings
- Event handlers ready for API calls
- TypeScript interfaces can be extended for API types

## Next Steps

1. **Backend Integration**: Connect form to video generation API
2. **Authentication**: Add user login and credit system
3. **Video Gallery**: Display generated videos
4. **Model Management**: Fetch available models from API
5. **Analytics**: Track user interactions and conversions

## License

This is a UI clone for educational and development purposes.
