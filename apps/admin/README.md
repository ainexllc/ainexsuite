# AINexSuite Admin

Admin dashboard for managing the AINexSuite platform.

## Features

- User management and analytics
- App configuration and settings
- Feedback review and AI insights
- Spaces management across all apps
- Theme and visual customization
- GitHub commit tracking

## Development

```bash
pnpm --filter admin dev
```

Runs on port 3020 by default.

## Environment Variables

Required environment variables:
- `GROK_API_KEY` - xAI API key for AI insights
- Firebase configuration variables

## Deployment

Deployed via Vercel to `admin.ainexspace.com`
