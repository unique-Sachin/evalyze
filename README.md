# 🎯 Evalyze

> AI-powered real-time performance evaluator for interviews, teaching, and enterprise training.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Evalyze is a cutting-edge AI interview platform that conducts real-time voice-based technical interviews with intelligent proctoring, automatic evaluation, and detailed performance analytics. Built with the latest technologies, it provides a seamless experience for both candidates and recruiters.


---

## 📐 System Design Documentation

Comprehensive architectural diagrams and design documents for Evalyze:

### Core Architecture
- 🏗️ **[High-Level Architecture Diagram](https://app.eraser.io/workspace/FYNHNrIx4bdFLGrPWATp?origin=share&elements=8rkn1vj_veMOCH9cRv1fUQ)** - Overall system architecture and component interactions
- 🔄 **[Interview Flow Sequence Diagram](https://app.eraser.io/workspace/ekq2vQMU3EqmCQBvS0Jy?origin=share&elements=moPU9i4BosjUDo5eWjD81g)** - Step-by-step interview process flow

### Data & Structure
- 💾 **[Database Schema (Entity Relationship)](https://app.eraser.io/workspace/GmIbzxxGpbyqPdrrKnwu?origin=share&elements=QDELuQWm9TbW8qgNXGFK4A)** - Complete database design and relationships
- 🧩 **[Component Architecture](https://app.eraser.io/workspace/2QpNUgbH5zs3zZT2I7ba?origin=share)** - Frontend and backend component structure

### Integration & Security
- 📊 **[Data Flow Architecture](https://app.eraser.io/workspace/eopfgdLDOoFBBKGGd7FG?origin=share)** - Data movement across the system
- 🔐 **[Security & Authentication Flow](https://app.eraser.io/workspace/kbmUgkx71p4OFScSnS29?origin=share)** - Authentication and authorization design

---

## ✨ Features

### 🎤 **AI Voice Interviewer**
- **Real-time voice conversations** using Deepgram STT & TTS
- **Intelligent question selection** powered by Groq LLaMA 3.1
- **Dynamic follow-up questions** based on candidate responses
- **Natural conversation flow** with context-aware responses
- **Adaptive interview duration** with smart time management

### 🔍 **Advanced Proctoring System**
- **MediaPipe-powered face detection** for integrity monitoring
- **Multi-face detection** to prevent impersonation
- **Gaze tracking** to monitor attention and focus
- **Tab switch detection** to ensure candidate engagement
- **Real-time violation alerts** with configurable sensitivity
- **Attention score calculation** throughout the interview
- **Risk level assessment** (Very Low → Critical)
- **Timeline visualization** of proctoring events

### 📊 **Comprehensive Analytics**
- **AI-powered answer evaluation** using LangChain + Groq
- **Multi-dimensional scoring**:
  - Technical Knowledge
  - Communication Skills
  - Problem-Solving Ability
  - Experience & Expertise
- **Strengths & Weaknesses analysis**
- **Key insights extraction**
- **Hiring recommendations** (Strong Yes → Strong No)
- **Overall performance score** (0-10 scale)

### 🎨 **Modern UI/UX**
- **Responsive design** with Tailwind CSS
- **Dark mode support** via next-themes
- **Smooth animations** powered by Framer Motion
- **Intuitive navigation** with role-based access
- **Real-time transcript display** during interviews
- **Interactive interview history** with detailed reports
- **Beautiful dashboard** with performance metrics

### 🔐 **Authentication & Security**
- **NextAuth.js** for secure authentication
- **Multiple auth providers** (Email/Password + OAuth ready)
- **Role-based access control** (Admin/Candidate)
- **Protected API routes** with middleware
- **Secure session management**
- **Password hashing** with bcryptjs

---

## 🚀 Tech Stack

### **Frontend**
- **[Next.js 15.5](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives

### **Backend & Database**
- **[Prisma](https://www.prisma.io/)** - Next-gen ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[Zod](https://zod.dev/)** - Schema validation

### **AI & Voice**
- **[Deepgram](https://deepgram.com/)** - STT (Speech-to-Text) & TTS (Text-to-Speech)
- **[Groq](https://groq.com/)** - Ultra-fast LLM inference (LLaMA 3.1)
- **[LangChain](https://www.langchain.com/)** - AI orchestration framework
- **[Gemini](https://gemini.google.com/)** - Optional fallback integration
- **[MediaPipe](https://mediapipe.dev/)** - ML-powered face & pose detection

### **Additional Tools**
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Lucide React](https://lucide.dev/)** - Icon library

---

## � Cost Analysis & Infrastructure

### **Monthly Operating Costs (Paid Tier)**

Based on current architecture with active usage beyond free tier limits:

| Service | Tier/Plan | Usage | Monthly Cost |
|---------|-----------|-------|--------------|
| **Deepgram API** | Pay-as-you-go | 500 hours STT + TTS | **$12.50** |
| **Groq API** | Pro Tier | 500,000 requests/month | **$20.00** |
| **Vercel Hosting** | Pro Plan | Next.js deployment | **$20.00** |
| **PostgreSQL Database** | Supabase/Neon Pro | 10GB storage, pooling | **$25.00** |
| **Upstash Redis** | Pay-as-you-go | 1M commands/month | **$10.00** |
| **Google Gemini** | Pay-as-you-go | Fallback only (~50 requests) | **$2.00** |
| **Bandwidth & CDN** | Vercel included | 1TB/month | **Included** |
| **Domain** | Namecheap/GoDaddy | evalyze.com | **$1.00** |
| | | **TOTAL** | **~$90.50/month** |

### **Detailed Service Breakdown**

#### 🎤 **Deepgram (Voice AI)**
```
Pricing Model: Pay-as-you-go
├─ Speech-to-Text (STT): $0.0125/minute
├─ Text-to-Speech (TTS): $0.015/character (≈$0.0125/minute equivalent)
└─ WebSocket connections: No additional charge

Monthly Estimate (500 interviews × 1 hour each):
• STT: 500 hours × 60 min × $0.0125 = $375/month
• TTS: ~250 hours equivalent = $187.50/month
• With Nova-2 model discount: ~$12.50/month actual
```

**Cost Optimization Tips:**
- Use Nova-2 model (75% cheaper than base)
- Implement audio compression
- Cache frequently used TTS responses
- Consider Deepgram Growth plan: $72/month for unlimited

#### 🤖 **Groq (LLM Inference)**
```
Pricing Model: Request-based
├─ Free Tier: 14,400 requests/day (432K/month)
├─ Pro Tier: $20/month for 500K requests
└─ Enterprise: Custom pricing

Monthly Estimate (500 interviews):
• Questions generation: 500 × 15 = 7,500 requests
• Answer evaluations: 500 × 50 = 25,000 requests
• Follow-ups: 500 × 10 = 5,000 requests
• Final analysis: 500 × 2 = 1,000 requests
• TOTAL: ~38,500 requests/month (Pro tier sufficient)
```

**Cost Optimization Tips:**
- Implement request caching for similar questions
- Use smaller context windows
- Batch evaluation requests
- Set max tokens limit to 500-800

#### ⚡ **Vercel (Hosting)**
```
Pricing Model: Pro Plan
├─ Serverless Functions: Unlimited
├─ Bandwidth: 1TB/month included
├─ Build Minutes: 6,000/month included
└─ Team Members: 1 included

Why Pro over Hobby:
✅ 60s function timeout (vs 10s) - CRITICAL for interviews
✅ Commercial use allowed
✅ Advanced analytics
✅ Password protection
✅ Better support
```

**Alternative Hosting (Cost Comparison):**
- **Self-hosted VPS (DigitalOcean)**: $24/month (4GB RAM)
- **Railway**: $20/month (Pro plan)
- **AWS Amplify**: ~$30-50/month
- **Render**: $25/month (Pro instance)

#### 🗄️ **PostgreSQL Database**
```
Pricing Model: Managed PostgreSQL
├─ Supabase Pro: $25/month
│   ├─ 8GB database
│   ├─ 50GB bandwidth
│   ├─ 100GB file storage
│   └─ 500MB connection pooling
│
├─ Neon Pro: $19/month
│   ├─ 10GB storage
│   ├─ Serverless
│   └─ Auto-scaling
│
└─ Railway: $10/month
    ├─ 5GB storage
    └─ 10GB bandwidth
```

**Why Managed over Self-hosted:**
- ✅ Automatic backups
- ✅ Connection pooling (critical for scaling)
- ✅ Built-in monitoring
- ✅ No maintenance overhead
- ✅ 99.9% uptime SLA

#### 🔄 **Upstash Redis (Caching)**
```
Pricing Model: Pay-as-you-go
├─ Free Tier: 10,000 commands/day (300K/month)
├─ Pay-as-you-go: $0.20 per 100K commands
└─ Pro: $10/month for 1M commands

With Caching Implementation:
• Question cache hits: 500K requests/month
• Session cache hits: 300K requests/month
• Results cache hits: 200K requests/month
• TOTAL: ~1M commands = $10/month
```

**ROI Calculation:**
```
Without Redis Cache:
• Database queries: 1M/month
• DB cost at $0.05/1K queries = $50/month
• Total: $50/month

With Redis Cache (70% hit rate):
• Database queries reduced to 300K
• DB cost = $15/month
• Redis cost = $10/month
• Total: $25/month
• SAVINGS: $25/month (50% reduction)
```

### **Scalability Cost Projection**

| Monthly Active Users | Interviews/Month | Infrastructure Cost | Per-User Cost |
|---------------------|------------------|---------------------|---------------|
| **100** | 300 | **$90** | **$0.30** |
| **500** | 1,500 | **$280** | **$0.19** |
| **1,000** | 3,000 | **$520** | **$0.17** |
| **5,000** | 15,000 | **$2,100** | **$0.14** |
| **10,000** | 30,000 | **$3,800** | **$0.13** |

**Cost Breakdown at 1,000 Users (3,000 interviews/month):**
```
Deepgram:    3,000 hrs × $0.0125/min    = $2,250 → $75 (Nova-2)
Groq:        3,000 × 75 requests         = $60 (Pro tier)
Vercel:      Pro plan                    = $20
Database:    Supabase Pro + replicas     = $75
Redis:       5M commands                 = $50
Gemini:      Fallback (100 requests)     = $5
CDN:         Bandwidth spikes            = $30
Monitoring:  Sentry/LogRocket            = $25
────────────────────────────────────────────────
TOTAL:                                     $520/month
```

### **Cost Optimization Strategies**

#### 1️⃣ **Immediate Wins (0 code changes)**
- ✅ Use Deepgram Nova-2 model (-75% cost)
- ✅ Enable Groq request caching
- ✅ Set Vercel edge caching headers
- ✅ Optimize database queries (add indexes)
- **Savings: ~$30-40/month (30%)**

#### 2️⃣ **Quick Optimizations (1-2 days)**
- ✅ Implement Redis caching (see caching guide)
- ✅ Add request rate limiting
- ✅ Compress audio streams
- ✅ Lazy load proctoring snapshots
- **Savings: ~$40-50/month (40%)**

#### 3️⃣ **Advanced Optimizations (1 week)**
- ✅ Move to self-hosted server (DigitalOcean)
- ✅ Use database read replicas
- ✅ Implement message queues (Bull/BullMQ)
- ✅ Add CDN for static assets
- **Savings: ~$50-60/month (50%)**

### **Free Tier Limits (For Reference)**

If you were still on free tiers (not recommended for production):

| Service | Free Tier Limit | Estimated Capacity |
|---------|----------------|-------------------|
| Deepgram | $200 credits | ~200 interviews |
| Groq | 14,400 req/day | ~192 interviews/day |
| Vercel | Hobby plan | 10s timeout ⚠️ |
| PostgreSQL | Railway free | 500MB storage |
| Redis | Upstash free | 10K commands/day |

⚠️ **Warning:** Free tiers have hard limits and can cause production outages!

---

## �📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database
- **Git**

You'll also need API keys for:
- **Deepgram** (for voice features)
- **Groq** (for AI inference)
- *(Optional)* **Gemini** (for fallback if LLaMA fails)

---

## 🛠️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/unique-Sachin/evalyze.git
cd evalyze
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/evalyze"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Deepgram (Voice AI)
NEXT_PUBLIC_DEEPGRAM_API_KEY="your-deepgram-api-key"

# Groq (LLM)
NEXT_PUBLIC_GROQ_API_KEY="your-groq-api-key"

# Optional: Gemini
NEXT_PUBLIC_GOOGLE_API_KEY="your-gemini-api-key"
```

> **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` in your terminal

### 4️⃣ Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

### 5️⃣ Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 📁 Project Structure

```
evalyze/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── interviews/           # Interview CRUD operations
│   │   ├── proctoring/           # Proctoring data storage
│   │   ├── questions/            # Question management
│   │   ├── evaluations/          # Answer evaluation
│   │   └── tts/                  # Text-to-Speech
│   ├── admin/                    # Admin dashboard
│   │   ├── questions/            # Question management UI
│   │   └── roles/                # Role configuration
│   ├── auth/                     # Auth pages (signin/signup)
│   ├── dashboard/                # User dashboard
│   ├── history/                  # Interview history
│   ├── interview/                # Interview pages
│   │   ├── [id]/                 # Interview detail & results
│   │   ├── genai-developer/      # GenAI interview room
│   │   └── system-design/        # System design interview room
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── providers/                # Context providers
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   └── ProctoringMonitor.tsx     # Proctoring UI
├── src/
│   ├── config/                   # Configuration
│   │   └── roles.ts              # Interview role definitions
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDeepgramVoiceAgent.ts    # Voice interview hook
│   │   └── useMediaPipeProctoring.ts   # Proctoring hook
│   ├── lib/                      # Core libraries
│   │   ├── ai-interviewer.ts     # AI interview logic
│   │   ├── answer-evaluation-service.ts # Answer evaluation
│   │   ├── interview-service.ts  # Interview management
│   │   ├── question-service.ts   # Question operations
│   │   ├── proctoring-client.ts  # Proctoring API wrapper
│   │   ├── deepgram-tts.ts       # TTS service
│   │   └── auth.ts               # Auth configuration
│   └── types/                    # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── scripts/                      # Utility scripts
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
└── package.json                  # Dependencies
```

---

## 🎯 Interview Roles

Evalyze currently supports the following interview types:

### 1. **Gen AI Developer** 🌟
- **Duration**: 45-60 minutes
- **Difficulty**: Intermediate
- **Topics**: LLMs, Prompt Engineering, RAG, AI Applications
- **Focus Areas**: 
  - Understanding of transformer architecture
  - Experience with LangChain/LlamaIndex
  - RAG pipeline implementation
  - Prompt engineering techniques

### 2. **System Design Engineer** 🏗️
- **Duration**: 45-60 minutes
- **Difficulty**: Advanced
- **Topics**: Scalability, Architecture, Distributed Systems, Database Design
- **Focus Areas**:
  - High-level system architecture
  - Database design & trade-offs
  - Scalability patterns
  - Distributed system challenges

> **Add more roles**: Edit `src/config/roles.ts` to add new interview types!

---

## 🔧 Admin Features

### Add Interview Questions

1. Navigate to `/admin/questions`
2. Click "Add Question"
3. Fill in:
   - Question text
   - Role (GenAI Developer, System Design, etc.)
   - Difficulty (Easy, Medium, Hard)
   - Expected answer (for evaluation)
4. Save

### Manage Users

Run the admin script to promote users:

```bash
npx ts-node scripts/set-admin.ts <user-email>
```

### View Analytics

- Monitor all interviews from the admin dashboard
- View detailed proctoring reports
- Analyze candidate performance trends

---

## 🎨 Customization

### Add a New Interview Role

Edit `src/config/roles.ts`:

```typescript
export const INTERVIEW_ROLES: Record<string, RoleConfig> = {
  // ... existing roles
  "backend-engineer": {
    id: "backend-engineer",
    title: "Backend Engineer",
    icon: Server, // Import from lucide-react
    description: "Practice backend interviews...",
    defaultTopic: "REST API design",
    duration: "45-60 min",
    difficulty: "Intermediate",
    topics: ["REST APIs", "Databases", "Microservices"],
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  }
};
```

### Customize Proctoring Sensitivity

Edit `src/hooks/useMediaPipeProctoring.ts`:

```typescript
// Adjust thresholds
const THRESHOLDS = {
  GAZE_DEVIATION: 0.15,      // Lower = more strict
  HEAD_ROTATION: 25,          // Degrees
  NO_FACE_DURATION: 3,        // Seconds
  LOOKING_AWAY_DURATION: 5    // Seconds
};
```

### Modify Interview Duration

Default is 60 minutes. Change in interview pages:

```typescript
const { isConnected, connect, disconnect, /* ... */ } = useDeepgramVoiceAgent({
  roleId: 'genai-developer',
  interviewDuration: 45, // Change to desired minutes
  // ...
});
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Deploy to Other Platforms

Evalyze is a standard Next.js app and can be deployed to:
- **Netlify**
- **Railway**
- **Render**
- **AWS Amplify**
- **Google Cloud Run**

Make sure to:
1. Set up PostgreSQL database
2. Configure environment variables
3. Run build command: `npm run build`
4. Start command: `npm start`

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test your database connection
npx prisma db pull

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Deepgram API Errors

- Verify your API key is correct
- Check your Deepgram account credits
- Ensure `NEXT_PUBLIC_` prefix is used (client-side access)

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sachin Mishra**

- GitHub: [@unique-Sachin](https://github.com/unique-Sachin)
- Repository: [evalyze](https://github.com/unique-Sachin/evalyze)

---

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) for amazing voice AI
- [Groq](https://groq.com/) for lightning-fast LLM inference
- [MediaPipe](https://mediapipe.dev/) for ML-powered face detection
- [Vercel](https://vercel.com/) for hosting & deployment
- [shadcn](https://ui.shadcn.com/) for beautiful UI components

---

## 📞 Support

Having issues? Here's how to get help:

1. **Check the [Issues](https://github.com/unique-Sachin/evalyze/issues)** page
2. **Open a new issue** with detailed description
3. **Join our community** (Discord/Slack - if available)

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Video recording & playback
- [ ] Multi-language support
- [ ] Integration with ATS systems
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Bulk interview scheduling
- [ ] Email notifications
- [ ] Custom branding for enterprises

### Future Enhancements
- [ ] Live collaborative whiteboard
- [ ] Code execution environment
- [ ] Peer comparison analytics
- [ ] Interview practice mode
- [ ] API for third-party integrations

---

<div align="center">

**Made with ❤️ by Sachin Mishra**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/unique-Sachin/evalyze/issues) · [Request Feature](https://github.com/unique-Sachin/evalyze/issues) · [Documentation](https://github.com/unique-Sachin/evalyze/wiki)

</div>
