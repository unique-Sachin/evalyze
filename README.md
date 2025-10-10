# 🎯 Evalyze

> AI-powered real-time performance evaluator for interviews, teaching, and enterprise training.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Evalyze is a cutting-edge AI interview platform that conducts real-time voice-based technical interviews with intelligent proctoring, automatic evaluation, and detailed performance analytics. Built with the latest technologies, it provides a seamless experience for both candidates and recruiters.

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

## 📋 Prerequisites

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
