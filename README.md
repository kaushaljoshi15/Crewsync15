# CrewSync 🚀

CrewSync is a modern platform designed for team coordination, volunteer management, and project execution. Built with Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL, and secure authentication (JWT, Google OAuth, and Email OTP verification).

---

## 🌟 Features

- 🔐 **Multi-Role Authentication**: Secure registration and login for volunteers, coordinators, and administrators with role-based access control.
- 📧 **Email OTP Verification**: Automated one-time passcode verification using Nodemailer.
- 🌐 **Google OAuth 2.0 Integration**: One-click sign-in and account linking using `@react-oauth/google` and `google-auth-library`.
- 🛡️ **JWT Session Management**: Fast, secure token-based authentication.
- 🗄️ **PostgreSQL Database**: Direct database integration with connection pooling and Prisma ORM schema.
- ⚡ **Modern UI / UX**: Responsive, accessible interface built with Tailwind CSS.

---

## 📁 Project Structure

```text
crew sync Major Project/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── google/        # Google OAuth verification & sign-in
│   │       ├── login/         # Email/password authentication
│   │       ├── register/      # User registration & OTP generation
│   │       └── verify-otp/    # Email OTP validation
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── verify/                # Email verification page
│   ├── globals.css            # Global Tailwind CSS styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home & Dashboard page
├── lib/
│   ├── db.ts                  # PostgreSQL connection pool
│   └── email.ts               # Nodemailer transporter & email templates
├── prisma/
│   └── schema.prisma          # Database models (User, VerificationCode)
├── public/                    # Static assets & SVG icons
├── .env                       # Environment variables
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify your `.env` file in the root directory:
```env
# Database Connection
DATABASE_URL="postgres://postgres:password@localhost:5432/crewsync_db"

# JWT Secret
JWT_SECRET="your-jwt-secret-key"

# Email Configuration (Gmail SMTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Security Highlights

- Passwords hashed using **bcryptjs** (salt rounds: 10).
- OTPs expire automatically after 10 minutes.
- Email verification enforced before dashboard access.
- Role-based authorization guarding administrative actions.

---

## 📄 License
This project is licensed under the MIT License.
