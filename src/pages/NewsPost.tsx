
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsPostComponent from "@/components/news/NewsPost";

const NewsPostPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto py-12">
          <NewsPostComponent />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPostPage;
