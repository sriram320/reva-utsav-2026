"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
}

export function IntroOverlay({ onComplete }: { onComplete: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showLogo, setShowLogo] = useState(false);
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles: Particle[] = [];
        const particleCount = 400; // Optimized count
        const centerX = width / 2;
        const centerY = height / 2;

        // Initialize particles from edges
        for (let i = 0; i < particleCount; i++) {
            const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let x = 0, y = 0;

            switch (edge) {
                case 0: x = Math.random() * width; y = -10; break;
                case 1: x = width + 10; y = Math.random() * height; break;
                case 2: x = Math.random() * width; y = height + 10; break;
                case 3: x = -10; y = Math.random() * height; break;
            }

            particles.push({
                x,
                y,
                vx: (centerX - x) * 0.01 + (Math.random() - 0.5) * 2,
                vy: (centerY - y) * 0.01 + (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? "#FF6B35" : "#FFFFFF",
                life: 1.0
            });
        }

        let animationFrameId: number;
        let phase = "assemble"; // assemble, explode, end

        const render = () => {
            ctx.fillStyle = "#0A0A0A";
            ctx.fillRect(0, 0, width, height);

            particles.forEach((p, i) => {
                if (phase === "assemble") {
                    // Move towards center with easing
                    p.x += (centerX - p.x) * 0.05;
                    p.y += (centerY - p.y) * 0.05;

                    // Jitter
                    p.x += (Math.random() - 0.5) * 2;
                    p.y += (Math.random() - 0.5) * 2;

                    const dist = Math.hypot(centerX - p.x, centerY - p.y);
                    if (dist < 50) {
                        p.size *= 0.95; // Shrink as they converge
                    }
                } else if (phase === "explode") {
                    p.x += p.vx * 5;
                    p.y += p.vy * 5;
                    p.life -= 0.02;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            if (phase === "assemble" && particles[0].size < 0.5) {
                // Converged enough
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        // Timeline
        setTimeout(() => {
            phase = "explode";
            // Recalculate velocities for explosion
            particles.forEach(p => {
                const angle = Math.atan2(p.y - centerY, p.x - centerX);
                const speed = Math.random() * 5 + 2;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.life = 1.0;
                p.size = Math.random() * 3 + 1;
            });

            setShowLogo(true);
        }, 2000); // Assemble for 2 seconds

        setTimeout(() => {
            setExit(true);
        }, 4500); // Show logo for 2.5 seconds

        setTimeout(() => {
            onComplete();
        }, 5000); // Fully done

        return () => cancelAnimationFrame(animationFrameId);

    }, []);

    return (
        <AnimatePresence>
            {!exit && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                >
                    <canvas ref={canvasRef} className="absolute inset-0" />

                    {showLogo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div className="relative flex flex-col items-center">
                                <div className="absolute -inset-10 bg-[#FF6B35]/20 blur-3xl rounded-full" />
                                <img
                                    src="/logo-icon.png"
                                    alt="REVA Techfest Logo"
                                    className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10"
                                />
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl md:text-5xl font-black font-orbitron text-white mt-8 tracking-wider text-center relative z-10"
                                >
                                    REVA UNIVERSITY
                                </motion.h1>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
