import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold font-orbitron tracking-wider text-white">
                            REVA<span className="text-secondary">UTSAV</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The flagship techno-cultural fest of REVA University. Celebrating innovation, creativity, and the spirit of technology.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-secondary transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-secondary transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-secondary transition-colors"><Linkedin size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-secondary transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-orbitron font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {['Events', 'Workshops', 'Sponsors'].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item.toLowerCase()}`} className="text-gray-400 hover:text-secondary text-sm transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-orbitron font-semibold mb-4">Events</h3>
                        <ul className="space-y-2">
                            {['Robotics', 'Coding', 'Gaming', 'Cultural', 'Design'].map((item) => (
                                <li key={item}>
                                    <Link href={`/events?category=${item.toLowerCase()}`} className="text-gray-400 hover:text-secondary text-sm transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-orbitron font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-gray-400 text-sm">
                                <MapPin size={18} className="mt-1 text-secondary shrink-0" />
                                <span>REVA University, Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bangalore 560064</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 text-sm">
                                <Mail size={18} className="text-secondary shrink-0" />
                                <span>contact@revautsav.com</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400 text-sm">
                                <Phone size={18} className="text-secondary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} REVA University. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
