# Draw It! 🎨

A creative daily drawing challenge app built with React Native, Expo, and Supabase. Draw It! helps artists of all levels improve their skills through AI-powered daily challenges, interactive coaching, and streak tracking.

**🔗 [Live Demo](https://draw-it-pearl.vercel.app/)**

## ✨ Features

- **Daily Drawing Challenges**: Fresh, AI-generated drawing prompts every day with reference images
- **AI Drawing Coach**: Interactive chatbot powered by GPT-4o to provide feedback and guidance
- **Streak Tracking**: Stay motivated by building and maintaining your daily drawing streak
- **Image Upload**: Share your artwork and get personalized feedback

## 🚀 Tech Stack

**Frontend:**
- React Native (0.81.4) - Cross-platform mobile development
- Expo (54.0.7) - Development framework and tooling
- Expo Router (6.0.4) - File-based routing
- TypeScript - Type-safe development
- React Native Paper - Material Design components

**Backend & Services:**
- Supabase - Authentication, database, and storage
- OpenAI API - GPT-4o for chat and DALL-E 3 for image generation

**Key Libraries:**
- Lucide React Native - Beautiful icons
- React Native Reanimated - Smooth animations
- date-fns - Date manipulation

## 📂 Project Structure

```
draw-it/
├── app/                   # App routes and screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation screens
│   ├── api/               # API routes (server-side)
│   └── chatbot/           # AI chat interface
├── components/            # Reusable UI components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Third-party service configurations
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── assets/                # Images, fonts, and static files
```

## 🔑 Key Features

### Daily Challenges
The app generates a new drawing challenge every day using GPT-4o and DALL-E 3. Challenges are stored in Supabase and persist across sessions.

### AI Coach
Users can chat with an AI drawing coach that provides personalized feedback, technique tips, and creative suggestions using OpenAI's GPT-4o model.

### Streak System
Users earn streaks by completing daily challenges. The streak counter resets if a day is missed, encouraging consistent practice.

## 💻 For Developers

Want to run this locally or contribute? See the development setup below.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/jacobptnguyen/draw-it.git
cd draw-it

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env

# Run for web
npm run web
```

### Environment Variables

Required for local development:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_API_URL=your_api_url
```

## 🚀 Deployment

Deployed on Vercel with automatic deployments from the main branch.

**Build Configuration:**
- Build Command: `npx expo export --platform web`
- Output Directory: `dist`
- Framework: Expo (React Native for Web)

## 📱 Mobile Apps

While the web version is available now, native iOS and Android apps are in development using Expo Application Services (EAS).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

**Jacob Nguyen**

- GitHub: [@jacobptnguyen](https://github.com/jacobptnguyen)

## 🙏 Acknowledgments

- OpenAI for GPT-4o and DALL-E 3 APIs
- Supabase for backend infrastructure
- Expo team for excellent development tools
- The React Native community

---

Built with ❤️ using React Native, Expo, Supabase, and modern web technologies