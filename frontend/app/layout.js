import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Weekly Report & Team Dashboard',
  description: 'Submit weekly reports and track team progress',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-[#F5F6FA]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}