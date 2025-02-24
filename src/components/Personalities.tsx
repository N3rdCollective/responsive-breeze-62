
const personalities = [
  {
    name: "Sarah Johnson",
    role: "Morning Show Host",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    bio: "Wake up with Sarah as she brings you the best music and entertainment to start your day right."
  },
  {
    name: "Mike Reynolds",
    role: "Afternoon Drive",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    bio: "Your afternoon companion, keeping you energized with the latest hits and engaging conversations."
  },
  {
    name: "James Wilson",
    role: "Evening Mix",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
    bio: "Experience the perfect evening blend of smooth R&B and soul with James."
  }
];

const Personalities = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get to know the voices that make our station unique and bring you the best in music and entertainment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personalities.map((personality, index) => (
            <div 
              key={personality.name}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 animate-fadeIn"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={personality.image}
                  alt={personality.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">{personality.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{personality.role}</p>
                <p className="text-gray-600 mb-4">{personality.bio}</p>
                <a 
                  href="#" 
                  className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                >
                  Learn more →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Personalities;
