
const personalities = [
  {
    name: "Sarah Johnson",
    role: "Morning Show Host",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    bio: "Wake up with Sarah as she brings you the best music and entertainment to start your day right. Join her every weekday from 6AM to 10AM for the perfect morning mix."
  },
  {
    name: "Mike Reynolds",
    role: "Afternoon Drive",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    bio: "Your afternoon companion, keeping you energized with the latest hits and engaging conversations. Catch Mike's show weekdays from 2PM to 6PM."
  },
  {
    name: "James Wilson",
    role: "Evening Mix",
    image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
    bio: "Experience the perfect evening blend of smooth R&B and soul with James. Tune in weeknights from 8PM to midnight for the best in evening entertainment."
  }
];

export const Personalities = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-700 dark:text-muted-foreground max-w-2xl mx-auto">
            Get to know the voices that make our station unique and bring you the best in music and entertainment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {personalities.map((personality, index) => (
            <div 
              key={personality.name}
              className="group bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn border border-border"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative w-full pt-[100%]">
                <img
                  src={personality.image}
                  alt={personality.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-2">{personality.name}</h3>
                <p className="text-lg text-[#FFD700] mb-4 font-medium">{personality.role}</p>
                <p className="text-gray-700 dark:text-muted-foreground mb-6 line-clamp-3">{personality.bio}</p>
                <a 
                  href={`/personalities/${personality.name.toLowerCase().replace(' ', '-')}`}
                  className="inline-flex items-center text-sm font-semibold text-[#FFD700] hover:text-[#FFD700]/80 transition-colors group-hover:translate-x-1 duration-300"
                >
                  Learn more 
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
