import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.z = 3.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    // Objects
    // Torus Knot with custom metallic wireframe styling
    const geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 120, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x0062ff,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: true,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Add particle background
    const particlesCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8; // x
      positions[i + 1] = (Math.random() - 0.5) * 8; // y
      positions[i + 2] = (Math.random() - 0.5) * 4; // z
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
    });

    const particlePoints = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlePoints);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0062ff, 3, 15);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 3, 15);
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);

    // Interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to -0.5 to 0.5
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.parentElement?.clientWidth || 500;
      const height = canvasRef.current.parentElement?.clientHeight || 500;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Slow idle rotations
      torusKnot.rotation.y = elapsedTime * 0.15;
      torusKnot.rotation.x = elapsedTime * 0.1;

      // Mouse parallax tracking
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;

      torusKnot.rotation.y += (targetX - torusKnot.rotation.y) * 0.05;
      torusKnot.rotation.x += (targetY - torusKnot.rotation.x) * 0.05;

      // Slowly rotate particle field
      particlePoints.rotation.y = elapsedTime * -0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-sans backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
              <span>Tailored Next-Generation AI Architectures</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.1] md:leading-[1.05]">
              Build Smarter <br className="hidden sm:inline" />
              Business With <span className="gradient-text">AI Automation</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg text-gray-400 font-sans leading-relaxed max-w-xl">
              We engineer premium, custom AI automations, elegant high-converting websites, digital templates, and enterprise workflows to streamline your business and boost conversions.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-dark font-sans font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5"
              >
                Schedule Consultation
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/store"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 font-sans font-semibold text-white transition-all duration-300 backdrop-blur-md"
              >
                Explore templates
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-display flex items-center gap-1">
                  <Zap className="w-5 h-5 text-primary" />
                  10x
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Speedup</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-display flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-accent-purple" />
                  99.9%
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Reliability</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-display">
                  $2.4M+
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Saved For Clients</div>
              </div>
            </div>
          </div>

          {/* 3D Visuals Column */}
          <div className="lg:col-span-5 h-[350px] sm:h-[450px] lg:h-[500px] relative flex justify-center items-center">
            {/* Ambient background glows */}
            <div className="absolute w-72 h-72 rounded-full bg-primary/20 blur-[80px] pointer-events-none -z-10 animate-pulse-slow"></div>
            
            {/* The 3D Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing max-w-[500px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
