# Deploy to VPS (Ubuntu/Debian) + Nginx

This project is a Next.js app with a file-backed CMS stored as JSON on disk.

## 0) Prereqs

- VPS has DNS pointing `act-kw.com` (and optionally `www.act-kw.com`) to the server IP.
- Ports `80` and `443` open (and `22` for SSH).
- Node.js LTS installed (recommended Node 20+).

## 1) Create a deploy user (recommended)

```bash
adduser act
usermod -aG sudo act
```

## 2) Clone and install

```bash
sudo -iu act
cd ~
git clone https://github.com/abdelrahmanmoahmed59-afk/act-website- act-website
cd act-website
npm ci
npm run build
```

## 3) Configure environment + persistent data directory

Create `/var/lib/act-website/data` to persist JSON/uploads across deployments:

```bash
sudo mkdir -p /var/lib/act-website/data
sudo chown -R act:act /var/lib/act-website
```

Create `~act/act-website/.env.local`:

```bash
ACT_DATA_DIR=/var/lib/act-website/data
JWT_SECRET=replace-with-a-long-random-string
ADMIN_BOOTSTRAP_SECRET=replace-with-a-long-random-string
JWT_ISSUER=act-admin
```

## 4) Run with systemd

Copy the unit file and enable it:

```bash
sudo cp deploy/act-website.service /etc/systemd/system/act-website.service
sudo systemctl daemon-reload
sudo systemctl enable --now act-website
sudo systemctl status act-website --no-pager
```

## 5) Nginx reverse proxy + SSL

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx-act-kw.com.conf /etc/nginx/sites-available/act-kw.com
sudo ln -sf /etc/nginx/sites-available/act-kw.com /etc/nginx/sites-enabled/act-kw.com
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d act-kw.com -d www.act-kw.com
```

## 6) Updates (pull + restart)

```bash
sudo -iu act
cd ~/act-website
git pull
npm ci
npm run build
sudo systemctl restart act-website
```

