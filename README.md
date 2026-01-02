<<<<<<< HEAD
<<<<<<< HEAD
# CrewSync - Volunteer Coordination & Shift Manager

A modern web application for efficiently managing student volunteers across sessions, duties, and time slots during large events.

## 🚀 Features

### 🔸 Organizer Dashboard
- Create and manage events
- Add volunteer roles (registration, crowd control, help desk)
- Create time slots and shifts (9AM–11AM, 11AM–1PM)
- Assign volunteers to tasks
- Mark attendance or check-in/out
- View comprehensive statistics (volunteer turnout, no-shows)

### 🔸 Volunteer Panel
- Personalized shift list view
- Task details: duty, time, location
- Real-time notifications and reminders
- Mark availability or request changes
- Check-in/out functionality

### 🔸 Real-time Updates
- Live attendance tracking
- Instant notifications
- Seamless communication between organizers and volunteers

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Backend**: Custom database and authentication system
- **Deployment**: Vercel (recommended)

## 🎨 Design System

### Color Palette
- **Primary**: #4F46E5 (Indigo 600)
- **Success**: #10B981 (Green 500)
- **Warning**: #F59E0B (Amber 500)
- **Danger**: #EF4444 (Red 500)

### Dark Mode Support
Full dark mode support with carefully selected colors for both light and dark themes.

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crewsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Add your database and authentication configuration here
   # DATABASE_URL=your_database_url
   # AUTH_SECRET=your_auth_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
crewsync/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── events/           # Event management
│   ├── shifts/           # Shift management
│   ├── volunteers/       # Volunteer management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
├── lib/                  # Utility functions and types
│   ├── auth.ts           # Authentication utilities
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

The application supports multiple authentication methods:
- Email/Password authentication
- Google Sign-In
- Role-based access control (Organizer, Volunteer, Admin)

## 📱 Responsive Design

Fully responsive design that works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Hosting Options
1. Build the project: `npm run build`
2. Deploy the `out` or `.next` directory to your preferred hosting service

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- Optimized bundle size with Next.js
- Image optimization with Next.js Image component
- Lazy loading for better performance
- Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- All contributors and open-source libraries that made this project possible

---

**CrewSync** - Making volunteer coordination simple, efficient, and reliable. 🚀 
=======
# crew-sync-hackathon-project
>>>>>>> 383373446afd75afb7d5b436bd606daeb903f0fe
=======
# Crewsync
>>>>>>> 01737fd2ffae1f86ef819391df0b30424c744869
