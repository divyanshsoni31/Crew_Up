import { ArrowRight, Users, Calendar, Award, Sparkles, CheckCircle2, Target } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import WhiteLogo from "../../assets/White_logo.png";

export function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Find Your Tribe",
      description: "Connect with like-minded volunteers and build lasting friendships",
    },
    {
      icon: Calendar,
      title: "Flexible Events",
      description: "Choose events that fit your schedule and interests",
    },
    {
      icon: Award,
      title: "Earn Recognition",
      description: "Build your profile with badges, levels, and certificates",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Profile",
      description: "Tell us about your skills and interests in under 2 minutes",
    },
    {
      step: "2",
      title: "Discover Events",
      description: "Browse events matched to your unique skillset",
    },
    {
      step: "3",
      title: "Make an Impact",
      description: "Show up, help out, and level up your volunteer journey",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pb-36 z-10">
          <div className="text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* <img
                src={WhiteLogo}
                alt="CrewUp Logo"
                className="w-48 h-48 sm:w-50 sm:h-50 mx-auto mb-6 drop-shadow-2xl"
              /> */}
              <h1 className="text-5xl sm:text-6xl lg:text-9xl font-bold text-white mb-6 leading-tight">
                CrewUp
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Where Skills Meet Service
              </h1>
              <p className="text-xl sm:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto">
                Connect with meaningful events, grow your impact, and level up as a volunteer
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(217,249,157,0.5)]"
              >
                Get Started
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg className="block w-full h-[60px] md:h-[120px]" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#ffffff" />
          </svg>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose CrewUp?</h2>
          <p className="text-xl text-muted-foreground">Make volunteering easier, rewarding, and fun</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] transition-all border border-white/50"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-inner">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How CrewUp Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-accent -z-10"></div>

            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] transition-all border border-white/60">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto shadow-inner">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 text-center">{item.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-lg h-80"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758599668547-2b1192c10abb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdm9sdW50ZWVycyUyMHRlYW13b3JrJTIwY29tbXVuaXR5fGVufDF8fHx8MTc3MTgyNTQzM3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Diverse volunteers"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-lg h-80"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1658377937952-d5b7423579f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlb3BsZSUyMG9yZ2FuaXppbmclMjBldmVudHxlbnwxfHx8fDE3NzE4MjU0MzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Young people organizing"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-lg h-80"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760992003987-efc5259bcfbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzZXJ2aWNlJTIwdm9sdW50ZWVycyUyMGhlbHBpbmd8ZW58MXx8fHwxNzcxODA2MzA2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Community service"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 blur-[100px] rounded-full"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-14 h-14 text-accent mx-auto mb-6" />
            <h2 className="text-5xl font-extrabold text-white mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl text-purple-100 mb-10 font-medium tracking-wide">Join thousands of volunteers making an impact every day</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-5 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(217,249,157,0.5)]"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={WhiteLogo} alt="CrewUp Logo" className="w-10 h-10" />
                <h3 className="text-white font-bold text-xl">CrewUp</h3>
              </div>
              <p className="text-sm">Where Skills Meet Service</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white">Find Events</Link></li>
                <li><Link to="/login" className="hover:text-white">Post Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/about#contact" className="hover:text-white">Contact</Link></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><Link to="/admin/login" className="hover:text-white opacity-50">Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 CrewUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}