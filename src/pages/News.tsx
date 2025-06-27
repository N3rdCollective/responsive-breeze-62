
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NewsList from "@/components/news/NewsList";

const News = () => {
  const navigate = useNavigate();
  
  console.log('🗞️ News page rendering...');

  const handleAuthRedirect = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">
        <section className="relative bg-muted text-foreground py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
              alt="Newsroom"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
                Latest News
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-medium text-foreground bg-background/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg inline-block leading-relaxed">
                Stay updated with the latest happenings in music, entertainment, and local events. Use the search bar to find specific content.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsList />
          </div>
        </section>

        <section className="bg-muted py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">Stay Updated</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base min-h-[44px]"
              />
              <Button type="submit" className="w-full sm:w-auto min-h-[44px] px-6">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default News;
