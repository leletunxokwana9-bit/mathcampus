#!/usr/bin/env bash
# ================================================================
# MathCampus — AWS EC2 Server Setup Script
# Run once on a fresh Ubuntu 22.04 EC2 instance
# Usage: curl -sSL https://raw.githubusercontent.com/your-org/mathcampus/main/scripts/setup-server.sh | bash
# ================================================================
set -euo pipefail

echo "
╔══════════════════════════════════════╗
║  MathCampus Server Setup             ║
║  AWS EC2 · Ubuntu 22.04              ║
╚══════════════════════════════════════╝
"

# ── System update ────────────────────────────────────────────
echo "→ Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ── Install Docker ────────────────────────────────────────────
echo "→ Installing Docker..."
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# ── Install Docker Compose ────────────────────────────────────
echo "→ Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ── Install AWS CLI ───────────────────────────────────────────
echo "→ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
sudo /tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws

# ── Install Nginx (for SSL termination) ───────────────────────
echo "→ Installing Nginx..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# ── Install Certbot for SSL ───────────────────────────────────
echo "→ SSL will be configured separately with certbot --nginx"

# ── Application directory ─────────────────────────────────────
echo "→ Setting up /opt/mathcampus..."
sudo mkdir -p /opt/mathcampus
sudo chown -R $USER:$USER /opt/mathcampus

# ── Firewall ──────────────────────────────────────────────────
echo "→ Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ── Swap (for t3.micro) ───────────────────────────────────────
echo "→ Adding 2GB swap..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# ── Log rotation ──────────────────────────────────────────────
sudo tee /etc/logrotate.d/mathcampus > /dev/null <<'EOF'
/opt/mathcampus/logs/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  sharedscripts
  postrotate
    docker-compose -f /opt/mathcampus/docker/docker-compose.prod.yml kill -s USR1 nginx
  endscript
}
EOF

echo "
✅ Server setup complete!

Next steps:
  1. Clone the repo:       cd /opt/mathcampus && git clone https://github.com/your-org/mathcampus .
  2. Configure .env:       cp backend/.env.example backend/.env && nano backend/.env
  3. Get SSL certificate:  sudo certbot --nginx -d mathcampus.co.za -d www.mathcampus.co.za
  4. Run migrations:       node database/migrate.js --seed
  5. Start services:       docker-compose -f docker/docker-compose.prod.yml up -d
"
