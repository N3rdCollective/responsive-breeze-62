import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import NewsList from "@/components/news/NewsList";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-muted text-foreground py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
              alt="Newsroom"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Latest News</h1>
              <p className="text-xl font-medium text-foreground bg-background/50 backdrop-blur-sm p-4 rounded-lg inline-block">
                Stay updated with the latest happenings in music, entertainment, and local events
              </p>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsList />
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-muted py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Stay Updated</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
