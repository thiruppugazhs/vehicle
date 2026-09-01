# Production Deployment Guide

## 1. Production Build
```bash
npm run build
```
Outputs optimized distribution bundle into `/dist`.

## 2. Nginx Server Configuration
Enable gzip/brotli compression and long-lived cache headers on `/assets/*`.

## 3. PWA Offline Caching
Cache core assets for seamless field operations in low-connectivity environments.
