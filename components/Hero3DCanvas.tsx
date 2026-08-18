"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 32;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Central 3D Icosahedron Core (Distributed Node)
    const coreGeometry = new THREE.IcosahedronGeometry(7, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner Glowing Core
    const innerGeometry = new THREE.OctahedronGeometry(4, 0);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // 3. Floating Synchronized Orbit Particles (Crew Nodes)
    const particleCount = 140;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 12 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Star point texture with canvas
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 32;
    starCanvas.height = 32;
    const starCtx = starCanvas.getContext("2d");
    if (starCtx) {
      const grad = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(99, 102, 241, 0.8)");
      grad.addColorStop(0.7, "rgba(6, 182, 212, 0.4)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      starCtx.fillStyle = grad;
      starCtx.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.2,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 4. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0x0a0f1d, 1.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3, 50);
    cyanPointLight.position.set(15, 15, 15);
    scene.add(cyanPointLight);

    const violetPointLight = new THREE.PointLight(0xa855f7, 3, 50);
    violetPointLight.position.set(-15, -15, 15);
    scene.add(violetPointLight);

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = -y * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera damping towards mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 6;
      camera.position.y = targetY * 6;
      camera.lookAt(scene.position);

      // Rotate 3D Core
      coreMesh.rotation.x = elapsedTime * 0.2;
      coreMesh.rotation.y = elapsedTime * 0.3;
      coreMesh.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;

      innerMesh.rotation.x = -elapsedTime * 0.35;
      innerMesh.rotation.y = -elapsedTime * 0.25;

      // Rotate particle network
      particles.rotation.y = elapsedTime * 0.08;
      particles.rotation.x = Math.cos(elapsedTime * 0.05) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
