"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export function GravityScene() {
    const sceneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sceneRef.current) return;

        // Module aliases
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composite = Matter.Composite,
            Composites = Matter.Composites,
            Common = Matter.Common,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            Bodies = Matter.Bodies;

        // Create engine
        const engine = Engine.create();
        const world = engine.world;

        // Disable gravity for zero-gravity effect
        engine.gravity.y = 0;
        engine.gravity.x = 0;

        // Create renderer
        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: sceneRef.current.clientWidth,
                height: 600,
                showAngleIndicator: false,
                wireframes: false,
                background: "transparent",
            },
        });

        Render.run(render);

        // Create runner
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Create bounds (walls) so bodies stay on screen
        const width = sceneRef.current.clientWidth;
        const height = 600;
        const wallOptions = {
            isStatic: true,
            render: { fillStyle: 'transparent' } // Invisible walls
        };

        Composite.add(world, [
            Bodies.rectangle(width / 2, -50, width, 100, wallOptions), // Top
            Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions), // Bottom
            Bodies.rectangle(-50, height / 2, 100, height, wallOptions), // Left
            Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions), // Right
        ]);

        // Add bodies (Sponsor Bubbles)
        const logos = ['Spotify', 'Google', 'Netflix', 'Airbnb', 'Uber', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Tesla'];

        // Helper to create texture bodies (simplified as circles for MVP, ideally sprites)
        const stack = Composites.stack(50, 50, 5, 2, 80, 80, function (x: number, y: number) {
            return Bodies.circle(x, y, 40 + Math.random() * 20, {
                restitution: 0.9,
                friction: 0.005,
                frictionAir: 0.02, // Higher resistance for floaty feel
                render: {
                    fillStyle: 'rgba(255, 255, 255, 0.05)',
                    strokeStyle: 'rgba(255, 255, 255, 0.2)',
                    lineWidth: 1
                }
            });
        });

        Composite.add(world, stack);

        // Add mouse control
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false,
                },
            },
        });

        // Add magnetic repulsion on mouse move
        Matter.Events.on(mouseConstraint, "mousemove", function (event) {
            const mousePosition = event.mouse.position;
            Composite.allBodies(world).forEach((body) => {
                if (body.isStatic) return;
                const dx = body.position.x - mousePosition.x;
                const dy = body.position.y - mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    const forceMagnitude = (200 - distance) / 200 * 0.0005; // Gentle force
                    Matter.Body.applyForce(body, body.position, {
                        x: dx * forceMagnitude,
                        y: dy * forceMagnitude
                    });
                }
            });
        });

        Composite.add(world, mouseConstraint);

        // Keep the mouse in sync with rendering
        render.mouse = mouse;

        // Cleanup
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) {
                render.canvas.remove();
            }
        };
    }, []);

    return (
        <section className="relative w-full h-[600px] overflow-hidden border-y border-white/10 bg-black/20">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
                <h2 className="text-2xl text-gray-400 font-orbitron tracking-widest uppercase mb-2">Trusted By Industry Leaders</h2>
                <p className="text-gray-600 text-sm">Interact to scatter</p>
            </div>
            <div ref={sceneRef} className="w-full h-full" />
        </section>
    );
}
