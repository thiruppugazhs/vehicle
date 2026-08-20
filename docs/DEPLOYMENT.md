# Production Deployment Guide

## 1. Production Build
```bash
npm run build
```
Outputs optimized distribution bundle into `/dist`.

## 2. Nginx Server Configuration
Enable gzip/brotli compression and long-lived cache headers on `/assets/*`.
