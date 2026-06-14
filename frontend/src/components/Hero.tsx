import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const gold = isLight ? 0xb8860b : 0xd4a843;
    const goldDim = isLight ? 0x9a7209 : 0xb89038;
    const teal = isLight ? 0x0d9488 : 0x14b8a6;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 5.5;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.015, 24, 80),
      new THREE.MeshPhysicalMaterial({ color: teal, roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.25 })
    );
    outerRing.rotation.x = Math.PI / 2.5;
    scene.add(outerRing);

    const mainRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.025, 32, 64),
      new THREE.MeshPhysicalMaterial({ color: gold, roughness: 0.2, metalness: 0.9, transparent: true, opacity: 0.6 })
    );
    mainRing.rotation.x = Math.PI / 3;
    scene.add(mainRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.015, 24, 48),
      new THREE.MeshPhysicalMaterial({ color: goldDim, roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.4 })
    );
    innerRing.rotation.x = -Math.PI / 4;
    innerRing.rotation.z = Math.PI / 6;
    scene.add(innerRing);

    const centerOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.2, 2),
      new THREE.MeshPhysicalMaterial({
        color: gold, roughness: 0.05, metalness: 0.95,
        emissive: gold, emissiveIntensity: 0.25,
        transparent: true, opacity: 0.9
      })
    );
    scene.add(centerOrb);

    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({
        color: gold, transparent: true, opacity: 0.08,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(glowSphere);

    const outerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshBasicMaterial({
        color: gold, transparent: true, opacity: 0.04,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(outerGlow);

    const particleCount = 250;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) pos[i] = (Math.random() - 0.5) * 12;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.035, color: gold, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const orbitParticlesCount = 60;
    const orbitPos = new Float32Array(orbitParticlesCount * 3);
    const orbitAngles = new Float32Array(orbitParticlesCount);
    for (let i = 0; i < orbitParticlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.7 + Math.random() * 0.4;
      orbitAngles[i] = angle;
      orbitPos[i * 3] = Math.cos(angle) * radius;
      orbitPos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      orbitPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const oGeo = new THREE.BufferGeometry();
    oGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    const orbitParticles = new THREE.Points(
      oGeo,
      new THREE.PointsMaterial({ size: 0.04, color: teal, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, sizeAttenuation: true })
    );
    scene.add(orbitParticles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl = new THREE.PointLight(gold, 4, 10);
    pl.position.set(2, 2, 2);
    scene.add(pl);
    const pl2 = new THREE.PointLight(teal, 2, 8);
    pl2.position.set(-2, -1, 2);
    scene.add(pl2);

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth || 500;
      const h = canvas.parentElement.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      outerRing.rotation.y = t * -0.08 + mx * 0.05;
      outerRing.rotation.x = Math.PI / 2.5 + my * 0.03;
      mainRing.rotation.y = t * 0.15 + mx * 0.1;
      mainRing.rotation.x = Math.PI / 3 + my * 0.05;
      innerRing.rotation.y = t * -0.22 + mx * 0.08;
      innerRing.rotation.x = -Math.PI / 4 + my * 0.04;
      centerOrb.rotation.x = t * 0.12;
      centerOrb.rotation.y = t * 0.18;
      const orbScale = 1 + Math.sin(t * 1.2) * 0.04;
      centerOrb.scale.setScalar(orbScale);
      glowSphere.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08);
      glowSphere.material.opacity = 0.06 + Math.sin(t * 1.5) * 0.03;
      outerGlow.scale.setScalar(1 + Math.sin(t * 0.6) * 0.06);
      outerGlow.material.opacity = 0.03 + Math.sin(t * 0.9) * 0.015;
      particles.rotation.y = t * 0.015;
      particles.rotation.x = Math.sin(t * 0.01) * 0.02;

      const op = orbitParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < orbitParticlesCount; i++) {
        const angle = orbitAngles[i] + t * (0.1 + (i % 3) * 0.03);
        const radius = 0.7 + ((i % 5) * 0.1);
        const yOff = Math.sin(t * 0.5 + i) * 0.15;
        op[i * 3] = Math.cos(angle) * radius;
        op[i * 3 + 1] = yOff;
        op[i * 3 + 2] = Math.sin(angle) * radius;
      }
      orbitParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section class="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-36">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div class="lg:col-span-7 space-y-10">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans text-gold bg-gold/10 border border-gold/20">
              <Sparkles class="w-3.5 h-3.5" />
              <span>Premium AI Automation Agency</span>
            </div>
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-grotesk font-bold tracking-tight leading-[1.15] text-theme-primary">
              Scale Your Business<br />
              With <span class="gradient-gold">AI Automation</span>
            </h1>
            <p class="text-lg sm:text-xl font-sans leading-relaxed max-w-xl text-theme-secondary">
              We automate lead generation, customer support, and business workflows using AI — helping businesses save time and increase revenue.
            </p>
            <div class="flex flex-col sm:flex-row gap-5 pt-2">
              <a href="/contact" class="btn-primary text-base">
                Book Free Call <ArrowRight class="w-4 h-4" />
              </a>
              <a href="/portfolio" class="btn-secondary text-base">
                See Our Work
              </a>
            </div>
            <div class="pt-10 grid grid-cols-3 gap-8 border-t border-theme">
              <div>
                <div class="text-2xl lg:text-3xl font-bold font-grotesk text-theme-primary">150+</div>
                <div class="text-xs uppercase tracking-widest font-sans text-theme-muted">Projects Delivered</div>
              </div>
              <div>
                <div class="text-2xl lg:text-3xl font-bold font-grotesk text-theme-primary">99.9%</div>
                <div class="text-xs uppercase tracking-widest font-sans text-theme-muted">Uptime Reliability</div>
              </div>
              <div>
                <div class="text-2xl lg:text-3xl font-bold font-grotesk text-theme-primary">$2.4M+</div>
                <div class="text-xs uppercase tracking-widest font-sans text-theme-muted">Saved For Clients</div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-5 h-[380px] sm:h-[450px] lg:h-[520px] relative flex justify-center items-center">
            <div class="absolute w-72 h-72 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow opacity-25 glow-hero-primary" />
            <div class="absolute w-48 h-48 rounded-full blur-[80px] pointer-events-none -z-10 animate-drift opacity-20 top-[10%] right-[5%] glow-hero-primary" />
            <div class="absolute w-36 h-36 rounded-full blur-[60px] pointer-events-none -z-10 animate-bounce-gentle opacity-20 bottom-[15%] left-[5%] glow-hero-teal" />
            <canvas ref={canvasRef} class="w-full h-full cursor-grab active:cursor-grabbing max-w-[460px]" />

            <div class="hero-floating-card card-crm" aria-hidden="true">
              <div class="h-2 w-2 rounded-full bg-green-400 shrink-0" />
              <div class="text-xs font-grotesk font-semibold text-theme-primary">CRM</div>
              <div class="ml-auto flex gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-gold" />
                <div class="w-1.5 h-1.5 rounded-full bg-gold/50" />
              </div>
            </div>
            <div class="hero-floating-card card-whatsapp" aria-hidden="true">
              <svg class="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div class="text-xs font-grotesk font-semibold text-theme-primary">WhatsApp Bot</div>
              <div class="ml-auto text-[10px] text-green-400 font-semibold">Live</div>
            </div>
            <div class="hero-floating-card card-analytics" aria-hidden="true">
              <svg class="w-4 h-4 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg>
              <div class="text-xs font-grotesk font-semibold text-theme-primary">Analytics</div>
              <div class="ml-auto text-[10px] text-gold font-semibold">+40%</div>
            </div>

            <svg class="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 460 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <line x1="230" y1="260" x2="100" y2="120" stroke="rgba(212,168,67,0.15)" stroke-width="1" stroke-dasharray="4 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="2s" repeatCount="indefinite" />
              </line>
              <line x1="230" y1="260" x2="360" y2="100" stroke="rgba(212,168,67,0.15)" stroke-width="1" stroke-dasharray="4 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="2.5s" repeatCount="indefinite" />
              </line>
              <line x1="230" y1="260" x2="80" y2="380" stroke="rgba(20,184,166,0.15)" stroke-width="1" stroke-dasharray="4 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="3s" repeatCount="indefinite" />
              </line>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
