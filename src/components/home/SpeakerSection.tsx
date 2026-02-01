"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Globe } from "lucide-react";

const speakers = [
  {
    name: "Dr. Sarah Connor",
    role: "AI Research Lead, Cyberdyne",
    image: "bg-purple-500/20",
    bio: "Dr. Sarah Connor is a pioneer in Generative Adversarial Networks. With over 15 years of experience, she has led groundbreaking projects in autonomous systems and neural interfaces.",
    talk: "The Future of Conscious AI",
    socials: { twitter: "#", linkedin: "#", website: "#" }
  },
  {
    name: "Elon M.",
    role: "Technoking",
    image: "bg-blue-500/20",
    bio: "Eccentric billionaire and space enthusiast. Obsessed with making humanity multi-planetary.",
    talk: "Mars: The Next Frontier",
    socials: { twitter: "#", linkedin: "#" }
  },
  {
    name: "Ada Lovelace II",
    role: "Quantum Computing Expert",
    image: "bg-green-500/20",
    bio: "Descendant of the first programmer, continuing the legacy in the realm of Qubits and Superposition.",
    talk: "Quantum Supremacy in 2026",
    socials: { linkedin: "#", website: "#" }
  },
];

export function SpeakerSection() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
           <h2 className="text-3xl md:text-5xl font-bold font-orbitron text-white mb-4">Keynote Speakers</h2>
           <p className="text-gray-400">Hear from the visionaries shaping tomorrow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {speakers.map((speaker, i) => (
              <Dialog key={i}>
                 <DialogTrigger asChild>
                    <motion.div
                       initial={{ opacity: 0, scale: 0.9 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                       className="group cursor-pointer"
                    >
                       <div className={`aspect-square ${speaker.image} rounded-2xl mb-4 relative overflow-hidden border border-white/10 group-hover:border-secondary/50 transition-colors`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-4 left-4">
                             <h3 className="text-xl font-bold text-white font-orbitron">{speaker.name}</h3>
                             <p className="text-sm text-secondary">{speaker.role}</p>
                          </div>
                       </div>
                    </motion.div>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[425px] bg-black/95 border-secondary/20">
                    <DialogHeader>
                       <DialogTitle className="text-2xl text-secondary">{speaker.name}</DialogTitle>
                       <DialogDescription className="text-gray-400 text-base">
                          {speaker.role}
                       </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                       <div className={`h-48 w-full ${speaker.image} rounded-xl mb-4`} />
                       <div>
                          <h4 className="text-white font-semibold mb-2">About</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{speaker.bio}</p>
                       </div>
                       <div>
                          <h4 className="text-white font-semibold mb-1">Keynote Session</h4>
                          <p className="text-secondary text-sm font-medium">"{speaker.talk}"</p>
                       </div>
                    </div>
                    <div className="flex space-x-4 pt-4 border-t border-white/10">
                       {speaker.socials.twitter && <a href={speaker.socials.twitter} className="text-gray-400 hover:text-white"><Twitter size={20} /></a>}
                       {speaker.socials.linkedin && <a href={speaker.socials.linkedin} className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>}
                       {speaker.socials.website && <a href={speaker.socials.website} className="text-gray-400 hover:text-white"><Globe size={20} /></a>}
                    </div>
                 </DialogContent>
              </Dialog>
           ))}
        </div>
      </div>
    </section>
  );
}
