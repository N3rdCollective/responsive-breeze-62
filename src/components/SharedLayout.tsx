
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const SharedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-hot97-black text-hot97-white">
      <header className="hot97-primary-bg text-hot97-white p-4 shadow-lg">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hot97-text-gradient">HOT 97 App</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-hot97-pink transition-colors">Home</Link>
            <Link to="/auth" className="hover:text-hot97-pink transition-colors">Auth</Link>
            <Link to="/pricing" className="hover:text-hot97-pink transition-colors">Pricing</Link>
            <Link to="/blog" className="hover:text-hot97-pink transition-colors">Blog</Link>
            <Link to="/dashboard" className="hover:text-hot97-pink transition-colors">Dashboard</Link>
            <Link to="/radio" className="hover:text-hot97-pink transition-colors">Radio</Link>
            <Link to="/events" className="hover:text-hot97-pink transition-colors">Events</Link>
            <Link to="/store" className="hover:text-hot97-pink transition-colors">Store</Link>
            <Link to="/news" className="hover:text-hot97-pink transition-colors">News</Link>
            <Link to="/contact" className="hover:text-hot97-pink transition-colors">Contact</Link>
          </div>
        </nav>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
      
      <footer className="bg-hot97-dark-purple text-hot97-light-pink p-4 text-center">
        <p>&copy; {new Date().getFullYear()} HOT 97 App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SharedLayout;
