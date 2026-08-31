import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import { reviews } from "@/lib/data";
import { fetchCategories, fetchMealsByCategory } from "@/lib/api";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Map, Truck } from "lucide-react";
import ContactForm from "@/components/ContactForm";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  const categories = await fetchCategories();
  const featuredItems = await fetchMealsByCategory('Seafood');
  
  // Take only the first 4 for featured
  const topFeatured = featuredItems.slice(0, 4);

  let customerReviews = reviews;
  try {
    const dbReviews = await prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
    if (dbReviews.length > 0) {
      customerReviews = dbReviews.map((r) => ({
        id: r.id as any,
        user: r.user?.name || r.user?.email?.split("@")[0] || "Happy Food Lover",
        rating: r.rating,
        comment: r.comment,
        avatar: "",
      }));
    }
  } catch (err) {
    console.warn("Could not fetch db reviews:", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat w-full"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full mt-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Delicious Food,<br /> <span className="text-brand">Delivered To You</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow">
            Experience the best meals from top chefs in your city. Fresh ingredients, authentic flavors, and lightning-fast delivery.
          </p>
          <Link 
            href="/menu" 
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-brand/50"
          >
            Order Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Category</h2>
            <div className="h-1 w-20 bg-brand mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((category: any) => (
              <Link href={`/menu?category=${category.name}`} key={category.id}>
                <div className="bg-card hover:bg-brand group border border-border rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-2 flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Image src={category.icon} alt={category.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-white transition-colors text-lg">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Zone Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Offer Zone</h2>
            <div className="h-1 w-20 bg-brand mx-auto rounded-full"></div>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">Grab these exclusive deals before they are gone!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden h-64 shadow-lg group">
              <Image src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop" alt="Offer 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center p-8">
                <div>
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Limited Time</span>
                  <h3 className="text-3xl font-bold text-white mb-2">50% OFF</h3>
                  <p className="text-gray-300 mb-4">On all Italian pizzas</p>
                  <Link href="/menu?search=pizza" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors inline-block text-center">Claim Now</Link>
                </div>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden h-64 shadow-lg group">
              <Image src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop" alt="Offer 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand/90 to-brand/30 flex items-center p-8">
                <div>
                  <span className="bg-white text-brand text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">New Users</span>
                  <h3 className="text-3xl font-bold text-white mb-2">Free Delivery</h3>
                  <p className="text-gray-100 mb-4">On your first 3 orders</p>
                  <Link href="/menu" className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-900 transition-colors inline-block text-center">Order Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-black/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" alt="About Us" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About Foodiee</h2>
              <div className="h-1 w-20 bg-brand mb-8"></div>
              <p className="text-lg text-foreground/80 mb-6">
                Foodiee started with a simple vision: to connect hungry people with the best local restaurants. We believe that great food brings people together and that ordering it should be fast, simple, and reliable.
              </p>
              <p className="text-lg text-foreground/80 mb-8">
                Our platform partners with top chefs and local eateries to bring a world of flavors right to your doorstep. From comforting classics to exotic new cuisines, we ensure every meal is delivered fresh and hot.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">✓</span> Quality Ingredients</li>
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">✓</span> Fastest Delivery</li>
                <li className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">✓</span> 24/7 Customer Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Foodiee Section */}
      <section className="py-20 bg-gray-900 dark:bg-black/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-brand">Why Foodiee?</h2>
            <div className="h-1 w-20 bg-brand mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-6 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <ShieldCheck className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500 drop-shadow-sm">300+</h3>
              <p className="text-xl font-medium text-gray-300">Restaurants</p>
            </div>
            <div className="p-6 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Map className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500 drop-shadow-sm">50+</h3>
              <p className="text-xl font-medium text-gray-300">Cities</p>
            </div>
            <div className="p-6 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Truck className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 drop-shadow-sm">3M+</h3>
              <p className="text-xl font-medium text-gray-300">Orders Delivered</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50 dark:bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Dishes</h2>
              <div className="h-1 w-20 bg-brand rounded-full"></div>
            </div>
            <Link href="/menu" className="hidden md:flex items-center gap-1 text-brand font-medium hover:underline">
              View All Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topFeatured.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/menu" className="inline-flex items-center gap-1 text-brand font-medium hover:underline">
              View All Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <div className="h-1 w-20 bg-brand mx-auto rounded-full mb-16"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customerReviews.map((review) => (
              <div key={review.id} className="bg-card p-8 rounded-2xl shadow-sm border border-border relative">
                <div className="text-brand text-4xl absolute -top-5 left-8 bg-background px-2">"</div>
                <p className="text-foreground/80 mb-6 relative z-10 italic">
                  "{review.comment}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{review.user}</span>
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <div className="h-1 w-20 bg-brand mx-auto rounded-full"></div>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">We'd love to hear from you. Get in touch with our team.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Our Location</h4>
                  <p className="text-foreground/70">123 Food Street, Culinary District, FL 33101</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Phone Number</h4>
                  <p className="text-foreground/70">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Email Address</h4>
                  <p className="text-foreground/70">support@foodiee.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Working Hours</h4>
                  <p className="text-foreground/70">Mon-Sun: 8:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
            
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
