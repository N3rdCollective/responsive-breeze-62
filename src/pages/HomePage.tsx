
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page p-8">
      <header className="hero-section text-center py-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to Our Site</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Your journey starts here</p>
      </header>
      
      <main className="main-content mt-12">
        <section className="features">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700 dark:text-gray-200">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-item p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary-foreground">Feature One</h3>
              <p className="text-gray-600 dark:text-gray-300">Description of the first amazing feature we offer to our users.</p>
            </div>
            <div className="feature-item p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary-foreground">Feature Two</h3>
              <p className="text-gray-600 dark:text-gray-300">Discover the benefits of our second outstanding feature.</p>
            </div>
            <div className="feature-item p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary-foreground">Feature Three</h3>
              <p className="text-gray-600 dark:text-gray-300">Explore how our third feature can make your life easier.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
