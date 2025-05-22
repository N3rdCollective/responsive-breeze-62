
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const SharedLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Your App</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/auth" className="hover:underline">Auth</Link>
            <Link to="/pricing" className="hover:underline">Pricing</Link>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/radio" className="hover:underline">Radio</Link>
            <Link to="/events" className="hover:underline">Events</Link>
            <Link to="/store" className="hover:underline">Store</Link>
            <Link to="/news" className="hover:underline">News</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </nav>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 Your App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SharedLayout;
