# Onia Website — Personal Portfolio

<p align="center">
  A fully-featured, highly customizable personal portfolio website
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#directory-structure">Directory</a> •
  <a href="#production-deployment">Deployment</a> •
  <a href="#admin-panel-overview">Admin Panel</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js 14">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## Features

- 🌙☀️ **Night / Day Dual Themes** — Visitors can switch freely, colors and fonts editable in real-time via admin panel
- 🎨 **Glassmorphism UI** — Modern glass morphism design style
- 🛡️ **First-time Setup Wizard** — Auto-detects initialization status and guides admin account creation
- 🎛️ **Full-featured Admin Panel** — Theme, layout, content, feature toggles, and asset management in one place
- ⚡ **SSE Real-time Sync** — After admin saves configuration, all visitors receive instant updates without refresh
- 🚫 **Security Protection** — Route-level right-click/DevTools disable configuration, admin paths automatically exempt
- 🌐 **Bilingual Support** — Lightweight i18n implementation, Markdown content supports bilingual suffixes
- 📝 **Markdown Content Management** — Projects and page content stored in Markdown format
- 🔒 **JWT Authentication** — HttpOnly Cookie storage, login rate limiting prevents brute force attacks
- 💾 **Automatic Backup** — Auto-backup configurations, retains last 10 versions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion |
| State Management | Zustand |
| UI Components | shadcn/ui (deeply customized) |
| Authentication | JWT + bcryptjs |
| Real-time Sync | Server-Sent Events (SSE) |
| Content | Markdown + gray-matter |
| Validation | Zod |

---

## Quick Start

### Requirements

- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`, the system will auto-detect initialization status and redirect to `/setup` wizard.

### Complete Initialization

Fill in the following information on the setup page:

| Field | Description |
|-------|-------------|
| Site Name | Chinese and English versions |
| Admin Account | Username and password (min 8 characters) |
| Default Theme | Night (dark) or Day (light) |

After initialization, the system automatically redirects to `/login` page.

### Access Admin Panel

Log in with the credentials set during initialization, then access `/admin` panel for full site configuration.

---

## Directory Structure

```
OniaWebsite/
├── config.json              # Admin credentials & server config (auto-generated, DO NOT commit)
├── config.example.json      # Configuration example file
├── .setup.lock              # Setup lock file (marks initialization complete)
├── data/                    # All persistent data
│   ├── site-config.json     # Site editable config (theme, layout, content, etc.)
│   ├── backups/             # Auto-backup files
│   ├── content/
│   │   ├── projects/        # Project Markdown files
│   │   └── pages/           # Page Markdown files
│   ├── i18n/                # UI translation language packs
│   │   ├── zh-CN.json       # Chinese translations
│   │   └── en-US.json       # English translations
│   └── uploads/             # Uploaded images and font files
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (site)/          # Frontend main site pages
│   │   ├── admin/           # Admin panel pages
│   │   ├── api/             # REST API endpoints
│   │   ├── login/           # Login page
│   │   └── setup/           # Setup wizard page
│   ├── components/          # React components
│   │   ├── ui/              # UI base components
│   │   ├── site/            # Site business components
│   │   └── admin/           # Admin panel components
│   ├── lib/                 # Server-side utilities
│   ├── hooks/               # Client-side Hooks
│   ├── store/               # Zustand state management
│   └── styles/              # CSS variables & theme definitions
├── public/                  # Static assets
├── scripts/
│   └── backup.mjs           # Backup script
├── docker-compose.yml       # Docker compose configuration
├── ecosystem.config.js      # PM2 process manager configuration
└── package.json
```

---

## Production Deployment

### Option 1: Direct Run

```bash
# Build production version
npm run build

# Start production server
npm start
```

### Option 2: PM2 Process Management (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start with config file
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Enable startup on boot
pm2 startup
```

### Option 3: Docker Deployment

```bash
# First complete initialization locally (generates config.json and .setup.lock)
npm run dev

# Then start Docker
docker compose up -d
```

### Nginx Reverse Proxy Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Backup & Restore

```bash
# Manual backup (backs up data/ directory and config.json)
npm run backup

# Backup files stored in ./backups/ directory
# Automatically retains last 5 backups
```

---

## Security Notes

| Security Item | Implementation |
|---------------|----------------|
| Config File | `config.json` added to `.gitignore`, contains password hash and JWT secret |
| Password Storage | bcrypt (cost=12) hashing algorithm |
| Auth Token | JWT stored in HttpOnly Cookie, prevents XSS attacks |
| Login Protection | Same IP locked for 15 minutes after 5 failed login attempts |
| Config Write | All write APIs require JWT auth + Zod schema validation |
| Atomic Write | Config files use atomic write to prevent corruption |

> ⚠️ Note: Right-click/DevTools disable is for UX layer protection only and cannot prevent professional users from viewing source code.

---

## Admin Panel Overview

| Module | Path | Description |
|--------|------|-------------|
| Dashboard | `/admin` | Site statistics overview and quick links |
| Theme Editor | `/admin/theme` | Night/Day color schemes, fonts, glass effect settings |
| Layout Manager | `/admin/layout-editor` | Navbar, footer config, homepage section drag-and-drop |
| Content Manager | `/admin/content` | Hero, about, skills, contact, project content editing |
| Feature Toggles | `/admin/features` | Right-click disable, DevTools detection, animations, etc. |
| Asset Manager | `/admin/assets` | Image/font file upload and management |
| Security Settings | `/admin/security` | Change admin password, view login logs |

---

## Roadmap

- [x] Basic framework and initialization flow
- [x] JWT authentication and permission management
- [x] Night/Day theme switching
- [x] Glassmorphism UI components
- [x] SSE real-time config sync
- [x] Admin panel
- [x] Markdown content management
- [x] Multi-language support
- [x] Config backup mechanism
- [x] Docker support
- [ ] More theme presets
- [ ] Plugin extension system
- [ ] Analytics and statistics

---

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

---

## License

[MIT](LICENSE) © 2026 Onia

---

<p align="center">
  <sub>Built with ❤️ by Onia</sub>
</p>

tips: This repository may no longer receive functional updates.