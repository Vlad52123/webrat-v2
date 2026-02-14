#!/bin/bash
# Update Nginx security headers to allow Telegram Mini App
cat > /etc/nginx/conf.d/security-headers.conf << 'EOF'
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy no-referrer always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://challenges.cloudflare.com https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' wss://webcrystal.sbs wss://ua.webcrystal.sbs wss://ru.webcrystal.sbs wss://kz.webcrystal.sbs https://webcrystal.sbs; font-src 'self'; frame-src https://challenges.cloudflare.com; frame-ancestors 'self' https://web.telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'" always;
EOF
nginx -t && systemctl reload nginx && echo "NGINX RELOADED OK"
