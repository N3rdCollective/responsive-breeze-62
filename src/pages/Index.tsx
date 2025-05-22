
import React from "react";
import FeaturedBlogPost from "@/components/home/FeaturedBlogPost"; // Import the blog post component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming you might use Card for features

// Mock data for "What We Offer" section, similar to the image
const features = [
  {
    title: "Feature One",
    description: "Description of the first amazing feature we offer to our users.",
  },
  {
    title: "Feature Two",
    description: "Discover the benefits of our second outstanding feature.",
  },
  {
    title: "Feature Three",
    description: "Explore how our third feature can make your life easier.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-hot97-black text-hot97-white py-8 px-4">
      {/* Welcome Section */}
      <section className="text-center py-12 md:py-16 bg-slate-800 rounded-lg shadow-xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 hot97-text-gradient">Welcome to Our Site</h1>
        <p className="text-lg md:text-xl text-hot97-light-pink">Your journey starts here</p>
      </section>

      {/* What We Offer Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 hot97-text-gradient">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="hot97-dark-bg border-hot97-pink/30 hover:shadow-hot97-pink/20 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-hot97-pink">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-hot97-white/80">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Blog Post Section */}
      <section className="mb-16">
        {/* The FeaturedBlogPost component will render "From The Blog" and the latest post */}
        <FeaturedBlogPost />
      </section>
      
    </div>
  );
};

export default Index;
