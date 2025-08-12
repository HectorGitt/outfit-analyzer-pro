# 👗 Outfit Analyzer Pro

A modern AI-powered fashion analysis platform that provides personalized style recommendations and wardrobe insights.

## ✨ Features

### 🏠 Dashboard

-   Modern, responsive dashboard with outfit analytics
-   Style preferences management and user profile overview
-   Quick access to all platform features

### 📸 Smart Upload

-   Drag-and-drop outfit image upload
-   Instant AI-powered fashion analysis
-   Comprehensive style breakdown and recommendations

### 📱 Live Camera Analysis

-   Real-time camera integration with WebRTC
-   Live fashion analysis with periodic capture
-   Instant feedback on outfit combinations

### 👤 User Management

-   Secure authentication with JWT tokens
-   Personalized style preferences
-   Profile customization and settings

### 🎨 Style Intelligence

-   AI-powered color analysis and recommendations
-   Occasion-based outfit suggestions
-   Style compatibility scoring
-   Trend analysis and fashion insights

## 🛠️ Tech Stack

### Frontend

-   **React 18** - Modern React with hooks and concurrent features
-   **TypeScript** - Type-safe development experience
-   **Vite** - Lightning-fast build tool and dev server
-   **Tailwind CSS** - Utility-first CSS framework
-   **shadcn/ui** - Beautiful, accessible UI components
-   **Zustand** - Lightweight state management
-   **Axios** - HTTP client for API communication
-   **Lucide React** - Beautiful icon library

### Build & Development

-   **ESLint** - Code linting and quality enforcement
-   **PostCSS** - CSS processing and optimization
-   **Bun** - Fast package manager and runtime

### Camera & Media

-   **WebRTC** - Real-time camera access
-   **Canvas API** - Image processing and manipulation
-   **MediaDevices API** - Device access management

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── navigation/     # Navigation components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── pages/             # Application pages/routes
├── services/          # API service layer
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

## 🔧 API Integration

### Authentication Endpoints

-   `POST /auth/login` - User authentication
-   `POST /auth/register` - User registration
-   `GET /auth/me` - Get current user profile

### Analysis Endpoints

-   `POST /api/fashion/upload-analyze` - Upload and analyze outfit images
-   `POST /api/fashion/camera-analyze` - Real-time camera analysis

### Response Format

```typescript
interface FashionAnalysisResponse {
	data: {
		analysis: {
			style_description: string;
			colors: string[];
			occasion: string[];
			style_tips: string[];
			compatibility_score: number;
		};
	};
}
```

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+ or Bun
-   Modern web browser with camera support

### Installation

1. **Clone the repository**

    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2. **Install dependencies**

    ```sh
    npm i
    # or with bun
    bun install
    ```

3. **Start development server**

    ```sh
    npm run dev
    # or with bun
    bun dev
    ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Key Files

### Core Pages

-   `src/pages/Index.tsx` - Landing page with hero section
-   `src/pages/Dashboard.tsx` - Main user dashboard
-   `src/pages/Upload.tsx` - Image upload and analysis
-   `src/pages/Camera.tsx` - Live camera analysis
-   `src/pages/Profile.tsx` - User profile and preferences

### Components

-   `src/components/ui/fashion-analysis-card.tsx` - Analysis results display
-   `src/components/ui/image-upload.tsx` - File upload widget
-   `src/components/navigation/navbar.tsx` - Main navigation

### Services

-   `src/services/api.ts` - API endpoint definitions
-   `src/lib/api.ts` - Axios HTTP client configuration

## 🔐 Authentication

The app uses JWT token-based authentication with Zustand for state management:

```typescript
interface AuthState {
	token: string | null;
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}
```

## 📷 Camera Features

### Live Analysis

-   Automatic periodic capture every 3 seconds
-   Real-time fashion analysis feedback
-   Optimized image encoding with Canvas blob conversion

### Image Processing

```typescript
// Blob-based encoding for better quality
canvas.toBlob(
	(blob) => {
		if (blob) {
			const formData = new FormData();
			formData.append("file", blob, "camera-capture.jpg");
			// Send to API
		}
	},
	"image/jpeg",
	0.8
);
```

## 🎨 Styling System

### Theme Configuration

-   Custom Tailwind CSS configuration
-   CSS variables for consistent theming
-   Dark/light mode support
-   Responsive design patterns

### Component Library

-   shadcn/ui components with custom styling
-   Consistent design tokens
-   Accessible UI patterns

## 🏗️ Deployment

### Build for Production

```sh
npm run build
# or with bun
bun run build
```

### Preview Build

```sh
npm run preview
# or with bun
bun run preview
```

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/d3573312-2a60-4e47-81b4-adff1f6603b1) and click on Share → Publish.

### Custom Domain

Navigate to Project > Settings > Domains and click Connect Domain.
Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🧩 Development

### Code Quality

-   TypeScript for type safety
-   ESLint for code linting
-   Prettier for code formatting
-   Component-based architecture

### Best Practices

-   Proper error handling throughout the application
-   Type-safe API integration
-   Responsive design implementation
-   Performance optimizations

### Edit Options

-   **Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/d3573312-2a60-4e47-81b4-adff1f6603b1) and start prompting
-   **Local IDE**: Clone repo and push changes (reflected in Lovable)
-   **GitHub Direct**: Edit files directly in GitHub interface
-   **GitHub Codespaces**: Launch cloud development environment

## 📦 Dependencies

### Core Dependencies

```json
{
	"react": "^18.3.1",
	"react-dom": "^18.3.1",
	"typescript": "^5.6.2",
	"vite": "^5.4.2",
	"tailwindcss": "^3.4.1",
	"axios": "^1.7.7",
	"zustand": "^5.0.0"
}
```

### UI & Styling

-   `@radix-ui/*` - Accessible UI primitives
-   `lucide-react` - Icon library
-   `class-variance-authority` - Component variants
-   `clsx` & `tailwind-merge` - Utility combining

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**
