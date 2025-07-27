import { Outlet } from 'react-router-dom';
import Navbar from './ui/Navbar.tsx';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}