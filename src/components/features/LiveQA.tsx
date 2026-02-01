"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ThumbsUp } from "lucide-react";

interface Question {
    id: string;
    user: string;
    text: string;
    votes: number;
}

export function LiveQA() {
    const [questions, setQuestions] = useState<Question[]>([
        { id: "1", user: "Alex dev", text: "Will the hackathon have hardware labs?", votes: 12 },
        { id: "2", user: "Sarah L.", text: "Can we form teams across different colleges?", votes: 8 },
    ]);
    const [newQ, setNewQ] = useState("");

    const askQuestion = () => {
        if (!newQ.trim()) return;
        const q: Question = {
            id: Date.now().toString(),
            user: "Guest User",
            text: newQ,
            votes: 0,
        };
        setQuestions([q, ...questions]);
        setNewQ("");
    };

    return (
        <div className="w-full max-w-md bg-black/50 border border-white/10 rounded-xl p-4 h-[400px] flex flex-col backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 className="font-orbitron text-lg text-white">LIVE Q&A</h3>
                <span className="text-xs text-green-400 animate-pulse">● Live</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                <AnimatePresence initial={false}>
                    {questions.map((q) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white/5 p-3 rounded-lg border border-white/5"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs text-gray-400">{q.user}</span>
                                <div className="flex items-center gap-1 text-xs text-accent">
                                    <ThumbsUp size={12} /> {q.votes}
                                </div>
                            </div>
                            <p className="text-sm text-gray-200">{q.text}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-4 flex gap-2">
                <Input
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    placeholder="Ask a question..."
                    className="bg-white/5 border-white/20 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                />
                <Button size="icon" onClick={askQuestion} className="bg-accent hover:bg-accent/80">
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
}
