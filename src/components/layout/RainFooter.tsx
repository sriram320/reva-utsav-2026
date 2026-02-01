"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RainFooter() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!sceneRef.current) return;

        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composite = Matter.Composite,
            Bodies = Matter.Bodies,
            Events = Matter.Events;

        const engine = Engine.create();
        engine.gravity.y = 0.5; // Lower gravity for style

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: sceneRef.current.clientWidth,
                height: 400,
                background: "transparent",
                wireframes: false,
            },
        });

        // Create static bodies for UI elements (Invisible Colliders)
        // We need to calculate where the "Subscribe" box is relative to the canvas
        // For MVP, we'll place a static block where the visual UI is roughly located
        const width = sceneRef.current.clientWidth;
        const height = 400;

        const ground = Bodies.rectangle(width / 2, height + 30, width, 60, { isStatic: true, render: { visible: false } });

        // Static collider for the Subscribe Box (Centered)
        const subscribeBox = Bodies.rectangle(width / 2, height / 2, 400, 80, {
            isStatic: true,
            render: {
                fillStyle: 'transparent',
                strokeStyle: '#333',
                lineWidth: 1
            }
        });

        Composite.add(engine.world, [ground, subscribeBox]);

        // Rain Emitter
        const interval = setInterval(() => {
            const x = Math.random() * width;
            const size = 15 + Math.random() * 15;
            const body = Bodies.circle(x, -50, size, {
                restitution: 0.6,
                friction: 0.1,
                render: {
                    fillStyle: Math.random() > 0.5 ? '#2E5CFF' : '#FF4F00',
                    opacity: 0.5
                }
            });
            Composite.add(engine.world, body);
        }, 400);

        // Cleanup bodies that fall off screen
        Events.on(engine, 'beforeUpdate', function () {
            Composite.allBodies(engine.world).forEach((body) => {
                if (body.position.y > height + 100) {
                    Composite.remove(engine.world, body);
                }
            });
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            clearInterval(interval);
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
        };
    }, []);

    return (
        <footer className="relative h-[400px] w-full bg-black border-t border-white/10 overflow-hidden">
            {/* Physics Canvas Layer */}
            <div ref={sceneRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* Visual UI Layer */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center pointer-events-auto max-w-md w-full">
                    <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">Stay Updated</h3>
                    <p className="text-gray-400 mb-6">Catch the latest drops before they hit the stream.</p>
                    <div className="flex gap-2">
                        <Input placeholder="Enter email" className="bg-white/5 border-white/20" />
                        <Button variant="primary" ref={buttonRef}>Subscribe</Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
