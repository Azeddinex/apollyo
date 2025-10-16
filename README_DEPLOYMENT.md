# APOLLYO - Deployment Guide for Vercel

## Prerequisites
- Node.js 18+ installed
- Vercel account
- GitHub repository connected to Vercel

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Build Configuration

The project is configured with:
- **Framework**: Next.js 15.5.5
- **Node Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Output Directory**: `.next`

## Environment Variables (Optional)

If you want to enable AI-enhanced features, add these environment variables in Vercel:

```
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Post-Deployment

After deployment:
1. Your app will be available at `https://your-project.vercel.app`
2. Test all features:
   - Speed Mode (internal generation)
   - Hyper Mode (web scraping)
   - Filter configurations
   - Results export

## Troubleshooting

### Build Fails
- Ensure `npm install --legacy-peer-deps` is used
- Check Node.js version is 18+
- Verify all dependencies are installed

### Runtime Errors
- Check Vercel logs in dashboard
- Verify API routes are working
- Test locally first with `npm run build && npm start`

## Performance Optimization

The project includes:
- ✅ Image optimization
- ✅ Code splitting
- ✅ Static page generation
- ✅ API route optimization
- ✅ Compression enabled
- ✅ Security headers configured

## Support

For issues or questions:
- Email: admin@apollyo.com
- GitHub Issues: [Repository Issues](https://github.com/Azeddinex/apollyo/issues)

## License

MIT License - See LICENSE file for details