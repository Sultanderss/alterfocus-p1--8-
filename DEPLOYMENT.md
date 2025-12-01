# 🚀 AlterFocus - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Before Deploying
- [x] All TypeScript errors resolved
- [x] Production build successful
- [x] All components tested
- [x] Environment variables documented
- [x] README.md complete

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Required: Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Firebase Config (for cloud sync features)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

---

## 🏗️ Build for Production

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# Output will be in the /dist folder
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**✅ Easy, Fast, Free Tier Available**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: alterfocus
# - Directory: ./
# - Override settings: No
```

**Environment Variables in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `VITE_GEMINI_API_KEY`
3. Redeploy if needed

**Custom Domain (Optional):**
- Settings → Domains → Add Domain
- Follow DNS instructions

---

### Option 2: Netlify

**✅ Great for Static Sites, Free Tier**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# For production:
netlify deploy --prod
```

**Via Netlify UI:**
1. Go to [app.netlify.com](https://app.netlify.com/)
2. Drag and drop the `dist` folder
3. Done!

**Environment Variables:**
- Site Settings → Build & Deploy → Environment
- Add `VITE_GEMINI_API_KEY`

---

### Option 3: Firebase Hosting

**✅ Google Integration, Free Tier**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase in your project
firebase init hosting

# Select:
# - dist as public directory
# - Configure as single-page app: Yes
# - Automatic builds: No

# Deploy
firebase deploy --only hosting
```

**Environment Variables:**
- Add to `.env` file before build
- Rebuild with `npm run build`
- Deploy new build

---

### Option 4: GitHub Pages

**✅ Free, Version Controlled**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Setup:**
1. Create a GitHub repository
2. Push your code
3. Run `npm run deploy`
4. Enable GitHub Pages in repo settings
5. Select `gh-pages` branch

---

### Option 5: Custom Server (VPS)

**For Nginx/Apache on Ubuntu/CentOS:**

```bash
# 1. Build locally
npm run build

# 2. Upload dist folder to server
scp -r dist/* user@your-server:/var/www/alterfocus

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/alterfocus

# Add:
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/alterfocus;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/alterfocus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Security Best Practices

### 1. API Key Security
```javascript
// ✅ Good: Use environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ Bad: Hardcode keys
const apiKey = "AIzaSy..."; // DON'T DO THIS
```

### 2. Rate Limiting
- Implement request throttling for API calls
- Consider using a backend proxy for sensitive operations

### 3. HTTPS
- Always use HTTPS in production
- Most hosting providers (Vercel, Netlify) provide it automatically

---

## 📊 Performance Optimization

### Bundle Size Optimization

Current build:
```
index.html:      2.27 kB │ gzip:   1.00 kB
index.css:       4.33 kB │ gzip:   1.45 kB
index.js:    1,110.59 kB │ gzip: 296.03 kB ⚠️
```

**Optimization Strategies:**

1. **Code Splitting** (Future)
```javascript
// Lazy load heavy components
const Analytics = lazy(() => import('./components/Analytics'));
const AIGuide = lazy(() => import('./components/AIGuide'));
```

2. **Tree Shaking**
```javascript
// Import only what you need
import { motion } from 'framer-motion'; // ✅
// vs
import * as motion from 'framer-motion'; // ❌
```

3. **Image Optimization**
- Use WebP format
- Compress images before deployment
- Consider CDN for static assets

---

## 🧪 Testing on Production

### 1. Functionality Checklist
- [ ] Onboarding flow works
- [ ] Intervention system triggers correctly
- [ ] Analytics loads data
- [ ] Settings save properly
- [ ] AI Guide responds (with API key)

### 2. Performance Testing
```bash
# Run Lighthouse audit
npm install -g lighthouse

# Test your deployed URL
lighthouse https://your-app.com --view
```

### 3. Cross-browser Testing
- Chrome/Edge ✅ (Tested)
- Firefox (Manual test recommended)
- Safari (Manual test recommended)
- Mobile browsers (Chrome, Safari iOS)

---

## 🐛 Troubleshooting

### Issue: White Screen After Deploy
```bash
# Fix: Check vite.config.ts base path
export default defineConfig({
  base: '/', // For root deploy
  // base: '/alterfocus/', // For subdirectory
})
```

### Issue: 404 on Page Refresh
```
# Solution: Configure hosting for SPA routing

# Vercel: Create vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# Netlify: Create _redirects file
/*    /index.html   200

# Firebase: Already configured in firebase.json
```

### Issue: API Calls Failing
```
1. Check environment variables are set
2. Verify API key is valid
3. Check CORS settings (Gemini API should work)
4. Open browser console for errors
```

### Issue: Large Bundle Size
```
Current: 296 KB gzipped (acceptable)
If >500 KB: Implement code splitting
```

---

## 📱 PWA Setup (Optional)

Transform AlterFocus into a Progressive Web App:

```bash
# 1. Install vite-plugin-pwa
npm install -D vite-plugin-pwa

# 2. Update vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AlterFocus',
        short_name: 'AlterFocus',
        description: 'AI-Powered Anti-Procrastination System',
        theme_color: '#6366f1',
        icons: [...]
      }
    })
  ]
})

# 3. Rebuild and deploy
```

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

---

## 📈 Analytics Setup (Optional)

### Google Analytics 4

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Vercel Analytics

```bash
npm install @vercel/analytics

# Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

---

## 🎯 Post-Deployment Checklist

- [ ] Deployed URL is accessible
- [ ] All pages load correctly
- [ ] API integration works
- [ ] Analytics tracking (if enabled)
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Performance tested (Lighthouse)
- [ ] Mobile responsiveness verified
- [ ] SEO metadata present
- [ ] Error tracking setup (optional)

---

## 🆘 Support & Resources

### Official Documentation
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

### Community
- GitHub Issues (for AlterFocus-specific questions)
- React Community Discord
- Stack Overflow

---

## 📝 Maintenance

### Regular Updates
```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API usage (Gemini quotas)
- Check performance metrics
- User feedback collection

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ All intervention types work
- ✅ Data persists in localStorage
- ✅ AI features respond (with API key)
- ✅ Mobile experience is smooth
- ✅ Page load < 3 seconds
- ✅ Lighthouse score > 80

---

**Ready to deploy?** Choose your hosting option and follow the steps above!

**Recommended for beginners:** Vercel (easiest, fastest)
**Recommended for control:** Custom VPS server
**Recommended for Google ecosystem:** Firebase Hosting

---

**Created by:** Antigravity AI Assistant
**Last Updated:** 2025-11-24
