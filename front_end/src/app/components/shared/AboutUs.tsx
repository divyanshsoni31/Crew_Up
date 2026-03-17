import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, Send, Sparkles, Target, Users, Heart } from "lucide-react";
import { Link, useLocation } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function AboutUs() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash === '#contact') {
            const element = document.getElementById('contact');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent successfully! We'll be in touch soon.");
    };

    const team = [
        {
            name: "Sarah Jenkins",
            role: "Community Director",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdHxlbnwxfHx8fDE3NzE4MDYzMDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
        },
        {
            name: "David Chen",
            role: "Head of Partnerships",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxwb3J0cmFpdHxlbnwxfHx8fDE3NzE4MDYzMDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
        },
        {
            name: "Elena Rodriguez",
            role: "Volunteer Success",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwb3J0cmFpdHxlbnwxfHx8fDE3NzE4MDYzMDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
        }
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

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pb-36 z-10 text-center">
                    {/* Back Navigation Bar */}
                    <div className="absolute top-8 left-4 sm:left-6 lg:left-8">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 font-medium z-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="mt-12 md:mt-0"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium tracking-wide">Our Story</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            We Believe in the <br className="hidden md:block" />
                            Power of Community
                        </h1>

                        <p className="mt-8 text-xl sm:text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                            CrewUp bridges the gap between passionate volunteers and meaningful causes, creating a world where every skill finds its purpose.
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
                    <svg className="block w-full h-[60px] md:h-[120px]" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#ffffff" />
                    </svg>
                </div>
            </motion.div>

            {/* Mission Section */}
            <div className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold text-foreground mb-6">Our Mission</h2>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                We're on a mission to democratize volunteering. By leveraging technology, we make it effortless for anyone, anywhere, to find causes they care about and contribute their unique talents.
                            </p>

                            <div className="grid gap-6">
                                {[
                                    { icon: Target, title: "Purpose-Driven", desc: "Every connection made on CrewUp drives tangible real-world impact." },
                                    { icon: Users, title: "Inclusive", desc: "A platform built for everyone, regardless of background or experience level." },
                                    { icon: Heart, title: "Community-First", desc: "Fostering authentic relationships between organizers and volunteers." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * i, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        className="flex gap-4 p-6 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] transition-all border border-white/50"
                                    >
                                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-inner shrink-0">
                                            <item.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-foreground">{item.title}</h4>
                                            <p className="text-muted-foreground mt-2">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] transition-all border border-white/60 h-[600px]"
                        >
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxoZWxwaW5nfGVufDF8fHx8MTc3MTkwODI4NXww&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Community helping"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 text-white max-w-xs">
                                    <p className="text-3xl font-bold mb-2">10,000+</p>
                                    <p className="text-sm font-medium text-gray-200">Volunteers matched with causes globally</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Meet the Crew</h2>
                        <p className="text-xl text-muted-foreground">
                            The passionate people working behind the scenes to make volunteering better for everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group relative rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] transition-all border border-white/50"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <ImageWithFallback
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80" />
                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                                    <p className="text-purple-200 font-medium">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section Checkout Landing Page Style */}
            <div id="contact" className="pt-20 pb-28 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 blur-[100px] rounded-full"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/60">

                        {/* Contact Info */}
                        <div className="lg:w-2/5 p-12 lg:p-16 relative">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="relative z-10 h-full flex flex-col"
                            >
                                <h2 className="text-4xl font-bold mb-4 text-foreground">Get in Touch</h2>
                                <p className="text-muted-foreground mb-12 text-lg">
                                    Have questions about CrewUp? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                                </p>

                                <div className="space-y-8 mt-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner">
                                            <Mail className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-lg font-bold text-foreground">Email Us</h4>
                                            <p className="text-muted-foreground mt-1">hello@crewup.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner">
                                            <Phone className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-lg font-bold text-foreground">Call Us</h4>
                                            <p className="text-muted-foreground mt-1">+1 (555) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner">
                                            <MapPin className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-lg font-bold text-foreground">Office Location</h4>
                                            <p className="text-muted-foreground mt-1">100 Volunteering Way<br />San Francisco, CA 94105</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:w-3/5 p-12 lg:p-16 bg-white/50">
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-bold text-foreground mb-2">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            required
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-[1rem] border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none shadow-sm"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-bold text-foreground mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            required
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-[1rem] border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none shadow-sm"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-[1rem] border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none shadow-sm"
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-bold text-foreground mb-2">Subject</label>
                                    <select
                                        id="subject"
                                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-[1rem] border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none shadow-sm"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Volunteer Support</option>
                                        <option>Organizer Support</option>
                                        <option>Partnership Opportunities</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-foreground mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        required
                                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-[1rem] border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none resize-none shadow-sm"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(217,249,157,0.5)] group"
                                >
                                    Send Message
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
