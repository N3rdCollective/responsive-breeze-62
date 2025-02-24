
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-24">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1487958449943-2429e8be8625"
              alt="Office building"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">About Our Radio Station</h1>
              <p className="text-xl text-gray-300">
                Broadcasting the best in music and entertainment since 1995
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-4">
                  We strive to create compelling content that entertains, informs, and brings our community together through the power of radio.
                </p>
                <p className="text-gray-600">
                  With a commitment to quality programming and local engagement, we aim to be the leading voice in our region's media landscape.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
                  alt="Radio station control room"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">28</div>
                <div className="text-gray-600">Years On Air</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">1M+</div>
                <div className="text-gray-600">Weekly Listeners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Broadcasting</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600">Team Members</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-gray-600">
                  Committed to delivering the highest quality programming and service to our listeners.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-600">
                  Building strong connections and supporting our local community.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Embracing new technologies and ideas to enhance the listening experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Contact our team during business hours or send us a message anytime.
            </p>
            <div className="inline-flex gap-4">
              <a href="/contact" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Contact Us
              </a>
              <a href="/careers" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Join Our Team
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
