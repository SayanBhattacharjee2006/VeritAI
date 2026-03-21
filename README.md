# VeritAI - AI-Powered Fact-Checking Platform

VeritAI is a modern, feature-rich fact-checking application that uses AI to verify claims against real-time web evidence. Built with Next.js, React, and advanced animations.

## Features

- **Claim Verification**: Submit claims and get instant AI-powered fact-checking results
- **Verdict Badges**: Clear TRUE/FALSE/MIXED verdict indicators with confidence scores
- **History Tracking**: View, search, and export all your verified claims
- **User Accounts**: Secure authentication with email/password or social login
- **Multiple Pricing Tiers**: Free, Pro, and Enterprise plans with different limits
- **Real-time Processing**: Live terminal-style logs showing the verification process
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark/Light Mode**: Theme toggle for comfortable viewing

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom design tokens
- **Animations**: Framer Motion
- **State Management**: Zustand
- **UI Components**: shadcn/ui, custom VeritAI components
- **Fonts**: Syne (headlines), Inter (body), JetBrains Mono (code)

## Project Structure

```
/app
  /api              # API routes (verification endpoint)
  /dashboard        # Protected dashboard routes
    /history        # Verification history page
    /settings       # User settings page
    /upgrade        # Pricing page
  /login            # Authentication page
  /forgot-password  # Password recovery page
  page.tsx          # Landing page

/components
  /veritai          # Custom VeritAI components
    /landing        # Landing page sections
    /app            # Dashboard components
    *.tsx           # Reusable components

/lib
  /stores           # Zustand stores
  utils-veritai.ts  # Utility functions

/public
  /fonts            # Custom fonts
```

## Key Components

### Landing Page
- **Navbar**: Responsive navigation with auth buttons
- **Hero Section**: Eye-catching main CTA with animations
- **Stats Section**: Key metrics and social proof
- **Features Section**: Highlight main capabilities
- **How It Works**: Step-by-step process explanation
- **Processing Demo**: Live verification demonstration
- **Pricing Section**: Tiered pricing options
- **FAQ Section**: Common questions answered
- **Footer**: Links and copyright

### Dashboard
- **Dashboard Home**: Main claim verification interface
- **Processing View**: Live progress with terminal logs
- **Results View**: Detailed verdict with sources
- **History**: Search and filter all verifications
- **Settings**: User preferences and account management
- **Upgrade**: Pricing and plan comparison

### Auth Pages
- **Login/Signup**: Combined auth form with validation
- **Forgot Password**: Password recovery flow

## Stores (Zustand)

### `auth-store`
- User authentication state
- Login/logout/signup functions
- User profile management
- Subscription status

### `ui-store`
- Dark/light mode toggle
- Toast notifications
- Modal/dialog state
- Global UI preferences

### `verification-store`
- Claim verification history
- Recent verifications
- Verification details
- Export/delete functionality

## API Routes

### `POST /api/verify`
Submits a claim for verification.

**Request:**
```json
{
  "claim": "The Earth is flat"
}
```

**Response:**
```json
{
  "id": "123456",
  "claim": "The Earth is flat",
  "verdict": "FALSE",
  "confidence": 98.5,
  "reasoning": "Multiple reliable sources confirm this claim is false.",
  "sources": ["NASA", "Scientific American", "Wikipedia"],
  "summary": "...",
  "timestamp": "2024-03-21T12:00:00Z"
}
```

## Styling

The project uses Tailwind CSS v4 with custom design tokens defined in `/app/globals.css`:

- **Colors**: Primary, success, destructive, warning, info
- **Fonts**: Syne (headlines), Inter (body), JetBrains Mono (code)
- **Spacing**: Standard 4px grid
- **Radii**: Consistent border radius tokens

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000 to see the app.

## Features To Implement

- [ ] Real AI backend integration
- [ ] Database setup (Supabase/Neon)
- [ ] Email verification
- [ ] OAuth social login
- [ ] Payment processing (Stripe)
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Batch verification
- [ ] Custom reports

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Performance

- Optimized images with Next.js Image component
- Code splitting and lazy loading
- CSS and JS minification
- Font optimization with `font-display: swap`

## Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

## License

MIT License - Feel free to use this project for personal or commercial use.

## Support

For issues or questions, please open an issue on GitHub or contact support@veritai.app
