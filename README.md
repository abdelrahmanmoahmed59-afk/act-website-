# ACT website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/abdelrahmanmoahmed59-afks-projects/v0-act-website-development)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/o3kiJ7TfUXw)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/abdelrahmanmoahmed59-afks-projects/v0-act-website-development](https://vercel.com/abdelrahmanmoahmed59-afks-projects/v0-act-website-development)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/o3kiJ7TfUXw](https://v0.app/chat/o3kiJ7TfUXw)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Backend + Admin Dashboard (Local JSON)

This repo includes a file-based API + admin dashboard to manage site content using local JSON files (no online database).

Currently implemented:

- **News page content** (`/news`) with bilingual fields (English + Arabic)
- **Admin dashboard** (`/admin`) to add/edit/delete news items and edit page settings
- **Public API** (`/api/news?lang=en|ar`) for news content

### 1) Environment variables

Copy `.env.example` to `.env.local` and set:

- `JWT_SECRET` (long random string)
- `JWT_ISSUER` (optional; defaults to `act-admin`)
- `ADMIN_BOOTSTRAP_SECRET` (optional but recommended; enables one-time admin creation endpoint)

### 2) Local data files

By default, content is stored under `data/content/*.json`.
Private data (admin users, uploads, form submissions) is stored under `data/private/*`.

For VPS deployments, set `ACT_DATA_DIR` to a persistent directory (e.g. `/var/lib/act-website/data`) so edits made in the
admin dashboard persist across deploys.

The `data/` directory is runtime state and is gitignored.

### 3) Create the first admin user (one-time)

If `ADMIN_BOOTSTRAP_SECRET` is set, call:

- `POST /api/auth/bootstrap`
- Header: `x-bootstrap-secret: <ADMIN_BOOTSTRAP_SECRET>`
- Body: `{ "email": "...", "password": "..." }`

After an admin exists, this endpoint returns `409`.

### 4) Admin dashboard

- Visit `/admin/login`
- Manage News at `/admin/news`
- Use **Seed from template** to quickly restore sample content into the JSON store.

### SEO + performance notes

- `/news` is rendered SEO-friendly and cached with **1 minute revalidation**.
- Saving content in the dashboard triggers revalidation so updates show up quickly on the public page.
