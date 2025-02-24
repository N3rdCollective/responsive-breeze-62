
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const News = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
              alt="Newsroom"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">Latest News</h1>
              <p className="text-xl text-gray-300">
                Stay updated with the latest happenings in music, entertainment, and local events
              </p>
            </div>
          </div>
        </section>

        {/* Featured News */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b4aba04b"
                  alt="Breaking News"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div>
                <span className="text-primary font-semibold">Breaking News</span>
                <h2 className="text-3xl font-bold mt-2 mb-4">Major Music Festival Announced</h2>
                <p className="text-gray-600 mb-6">
                  Get ready for the biggest music event of the year! Our radio station is proud to announce
                  an incredible lineup featuring both local talents and international stars.
                </p>
                <Button>Read More</Button>
              </div>
            </article>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "New Morning Show Host",
                  image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
                  excerpt: "Meet our newest addition to the morning show team and discover what's in store for your daily commute.",
                  date: "March 15, 2024"
                },
                {
                  title: "Community Event Success",
                  image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c",
                  excerpt: "Last weekend's community outreach program exceeded all expectations. See the highlights and hear from participants.",
                  date: "March 14, 2024"
                },
                {
                  title: "Technology Update",
                  image: "https://images.unsplash.com/photo-1488590528505-98d2b4aba04b",
                  excerpt: "Our station embraces new broadcasting technology to enhance your listening experience.",
                  date: "March 13, 2024"
                }
              ].map((article, index) => (
                <article 
                  key={index}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                    <h3 className="text-xl font-bold mb-3">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <Button variant="outline">Read Article</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
