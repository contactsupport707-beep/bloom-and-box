/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Sparkles, Maximize2, Minimize2, Settings, RefreshCw } from "lucide-react";

interface FloralThreeSceneProps {
  className?: string;
  isBackgroundOnly?: boolean;
}

export function FloralThreeScene({ className = "", isBackgroundOnly = false }: FloralThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Custom Controls UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flowerCount, setFlowerCount] = useState(25);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [flowerType, setFlowerType] = useState<"all" | "roses" | "peonies" | "petals">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [fps, setFps] = useState(60);

  // Use refs for animation variables to prevent tearing
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 });

  // Generate a procedural glowing dot texture for soft bokeh particles
  const createSoftSparkleTexture = () => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(253, 224, 71, 1.0)");    // Warm Golden Star Center
      gradient.addColorStop(0.2, "rgba(197, 160, 89, 0.8)");  // Signature Gold
      gradient.addColorStop(0.6, "rgba(197, 160, 89, 0.15)"); // Outer soft glow
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");           // Falloff edge
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a090b, 0.035); // Gentle dark luxury aesthetic vignette

    // 2. CAMERA SETUP with Depth Of Field focus ratios
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 40);
    camera.position.z = 8;

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 4. LIGHTING SETUP (Warm luxury tones)
    const ambientLight = new THREE.AmbientLight(0x0e0c0f, 1.5);
    scene.add(ambientLight);

    // Top soft golden key light
    const keyLight = new THREE.DirectionalLight(0xfbebca, 3.5);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    // Complementary violet rim light
    const rimLight = new THREE.DirectionalLight(0xbe123c, 2.5);
    rimLight.position.set(-6, -4, -3);
    scene.add(rimLight);

    // Central soft candle point light in the core
    const centerGlow = new THREE.PointLight(0xf59e0b, 2.0, 15);
    centerGlow.position.set(0, 0, 1);
    scene.add(centerGlow);

    // 5. PROCEDURAL MODEL INJECTORS
    
    // Rose: concentric detailed shell spheres
    const createRoseGroup = (): THREE.Group => {
      const rose = new THREE.Group();
      
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b, // Rich luxury ruby
        roughness: 0.25,
        metalness: 0.12,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
        shadowSide: THREE.DoubleSide
      });

      const centerMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e, // Velvety glowing center
        roughness: 0.30,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.98
      });

      // Build concentric layered rings
      const layers = [
        { count: 1, radius: 0.05, height: 0.12, phiLimit: 0.8 }, // Core
        { count: 4, radius: 0.14, height: 0.22, phiLimit: 0.7 }, // Inner petals
        { count: 7, radius: 0.28, height: 0.32, phiLimit: 0.6 }, // Mid rings
        { count: 11, radius: 0.44, height: 0.38, phiLimit: 0.55 }, // Outermost
      ];

      layers.forEach((layer, layerIdx) => {
        const mat = layerIdx < 2 ? centerMat : petalMat;
        for (let i = 0; i < layer.count; i++) {
          const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.45);
          
          // Petal mesh from sphere segment
          const petalGeo = new THREE.SphereGeometry(
            layer.radius, 
            8, 
            8, 
            0, 
            Math.PI * 1.1, 
            0, 
            Math.PI * layer.phiLimit
          );
          
          const petal = new THREE.Mesh(petalGeo, mat);
          
          // Layout styling
          petal.position.x = Math.cos(angle) * (layer.radius * 0.4);
          petal.position.z = Math.sin(angle) * (layer.radius * 0.4);
          petal.position.y = layerIdx * 0.04 - 0.08 + Math.random() * 0.02;
          
          petal.rotation.y = -angle + Math.PI / 2;
          petal.rotation.x = 0.5 + (layerIdx * 0.16) + (Math.random() - 0.5) * 0.1;
          petal.rotation.z = (Math.random() - 0.5) * 0.15;
          
          // Make organic curved scaling
          petal.scale.set(1.1 - layerIdx * 0.05, 0.95 + layerIdx * 0.08, 0.35);
          rose.add(petal);
        }
      });
      
      // Add green sepals at the bottom
      const sepalMat = new THREE.MeshStandardMaterial({
        color: 0x115e595,
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * Math.PI * 2;
        const sepalGeo = new THREE.ConeGeometry(0.18, 0.5, 4);
        const sepal = new THREE.Mesh(sepalGeo, sepalMat);
        sepal.position.set(Math.cos(ang) * 0.2, -0.22, Math.sin(ang) * 0.2);
        sepal.rotation.z = s % 2 === 0 ? 0.8 : -0.8;
        sepal.rotation.x = s % 2 !== 0 ? 0.8 : -0.8;
        rose.add(sepal);
      }

      rose.scale.setScalar(1.2);
      return rose;
    };

    // Peony: high-fluff floral mesh
    const createPeonyGroup = (): THREE.Group => {
      const peony = new THREE.Group();

      const finePetalMat = new THREE.MeshStandardMaterial({
        color: 0xdb2777, // Vibrant pink/magenta
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88
      });

      const outerPetalMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c, // Deep ruby red-pink
        roughness: 0.25,
        metalness: 0.08,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      });

      // Fluffier overlapping sphere segments
      const layerCounts = [5, 11, 16, 20];
      const startRadius = 0.14;

      layerCounts.forEach((count, idx) => {
        const rad = startRadius + idx * 0.09;
        const currentMat = idx < 2 ? finePetalMat : outerPetalMat;
        
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (idx * 0.7);
          
          // Peony petal curved shell geometry
          const petalGeo = new THREE.SphereGeometry(
            rad, 
            6, 
            6, 
            0, 
            Math.PI * 0.85, 
            0, 
            Math.PI * 0.65
          );
          
          const petal = new THREE.Mesh(petalGeo, currentMat);
          
          petal.position.x = Math.cos(angle) * (rad * 0.35);
          petal.position.z = Math.sin(angle) * (rad * 0.35);
          petal.position.y = idx * 0.035 - 0.1 + (Math.random() - 0.5) * 0.02;
          
          petal.rotation.y = -angle;
          petal.rotation.x = 0.75 + idx * 0.12;
          petal.rotation.z = Math.sin(angle) * 0.25;
          
          petal.scale.set(1.15, 1.45, 0.28);
          peony.add(petal);
        }
      });

      peony.scale.setScalar(1.15);
      return peony;
    };

    // Single delicate falling petal
    const createSinglePetalMesh = (): THREE.Mesh => {
      const petalGeo = new THREE.SphereGeometry(0.32, 6, 6, 0, Math.PI * 0.9, 0, Math.PI * 0.45);
      const randomColor = Math.random() > 0.4 ? 0xdc2626 : 0x991b1b;
      const petalMaterial = new THREE.MeshStandardMaterial({
        color: randomColor,
        roughness: 0.35,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const petal = new THREE.Mesh(petalGeo, petalMaterial);
      petal.scale.set(0.65, 0.95, 0.3);
      return petal;
    };


    // 6. INITIALIZE INDIVIDUAL SCENE MEMBERS (FLOWERS & PETALS)
    const items: Array<{
      group: THREE.Object3D;
      baseX: number;
      baseY: number;
      baseZ: number;
      vx: number;
      vy: number;
      vz: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      offset: number;
      type: "rose" | "peony" | "petal";
    }> = [];

    const populateScene = () => {
      // Clear old items
      items.forEach(it => scene.remove(it.group));
      items.length = 0;

      for (let i = 0; i < flowerCount; i++) {
        let object: THREE.Object3D;
        let type: "rose" | "peony" | "petal";

        // Filter behavior
        const selection = flowerType === "all" 
          ? (i % 3 === 0 ? "rose" : i % 3 === 1 ? "peony" : "petal")
          : flowerType === "roses" ? "rose"
          : flowerType === "peonies" ? "peony"
          : "petal";

        if (selection === "rose") {
          object = createRoseGroup();
          type = "rose";
        } else if (selection === "peony") {
          object = createPeonyGroup();
          type = "peony";
        } else {
          object = createSinglePetalMesh();
          type = "petal";
        }

        // Spread across coordinates around viewport frustum
        const baseX = (Math.random() - 0.5) * 14;
        const baseY = (Math.random() - 0.5) * 10;
        const baseZ = (Math.random() - 0.5) * 10 - 2; // Keep in perspective depth

        object.position.set(baseX, baseY, baseZ);
        
        // Random orientations
        object.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        scene.add(object);

        items.push({
          group: object,
          baseX,
          baseY,
          baseZ,
          vx: (Math.random() - 0.5) * 0.006,
          vy: -((Math.random() * 0.008) + 0.003), // Gentle downward float
          vz: (Math.random() - 0.5) * 0.004,
          rotX: (Math.random() - 0.5) * 0.012,
          rotY: (Math.random() - 0.5) * 0.012,
          rotZ: (Math.random() - 0.5) * 0.012,
          offset: Math.random() * Math.PI * 2,
          type
        });
      }
    };

    populateScene();


    // 7. SOFT SPARKLE PARTICLE BOKEHS
    const particleCount = isBackgroundOnly ? 50 : 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
      particleScales[i] = 0.1 + Math.random() * 0.4;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const softSparkleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: createSoftSparkleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false, 
      transparent: true,
      opacity: 0.70
    });

    const sparkleSystem = new THREE.Points(particleGeometry, softSparkleMat);
    scene.add(sparkleSystem);


    // 8. EVENT ATTACHMENTS (Mouse Movement Hover displacement)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      mouseRef.current.targetX = x * 6; // Scale displacement range
      mouseRef.current.targetY = y * 4;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      mouseRef.current.targetX = x * 6;
      mouseRef.current.targetY = y * 4;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });


    // 9. RE-SIZING DYNAMICS
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }


    // 10. LUXURY DEPTH-OF-FIELD DEFOCUS ALGORITHM
    // In low-level WebGL buffers, this is post-treatment, but for hyper-performance on mobile/retina, 
    // we scale opacity and size based on the absolute distance from the focus plane (Z = ~0).
    const applyOrganicDepthOfField = (
      obj: THREE.Object3D, 
      zCoord: number, 
      type: "rose" | "peony" | "petal"
    ) => {
      const distanceFromFocus = Math.abs(zCoord - 0); // Focus plane is at Z = 0
      
      // Calculate opacity fade out based on far depth planes
      let baseOpacity = 0.95;
      if (type === "petal") baseOpacity = 0.8;
      
      const depthFade = Math.max(0.12, baseOpacity - (distanceFromFocus * 0.08));

      // Simulate Lens defocus-size growth & sharpness
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = depthFade;
          
          // Simulate soft depth edges with additive rendering adjustments on extreme focus paths
          if (distanceFromFocus > 4.5) {
            mat.roughness = 0.65; // Farther items look less razor sharp
          } else {
            mat.roughness = type === "petal" ? 0.4 : 0.25;
          }
        }
      });
    };


    // 11. CORE TICK LOOP
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsInterval = lastTime;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // FPS tracking
      frameCount++;
      if (time > fpsInterval + 1000) {
        setFps(Math.round((frameCount * 1000) / (time - fpsInterval)));
        frameCount = 0;
        fpsInterval = time;
      }

      // Smooth mouse spring interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;
      
      const windForceX = mouse.x * 0.08;
      const windForceY = mouse.y * 0.08;

      // Animate Flowers
      items.forEach((item, index) => {
        // Drift coordinates
        item.baseY += item.vy * rotationSpeed;
        item.baseX += item.vx;
        item.baseZ += item.vz;

        // Reset if drifted below footer limit
        if (item.baseY < -6.5) {
          item.baseY = 6.5;
          item.baseX = (Math.random() - 0.5) * 14;
          item.baseZ = (Math.random() - 0.5) * 10 - 2;
        }

        // Apply mouse interaction (wind displacement)
        // Check proximity of item coordinate relative to mouse force vector
        const dx = item.baseX - mouse.x;
        const dy = item.baseY - mouse.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        let localWindX = windForceX;
        let localWindY = windForceY;

        if (distance < 3.5 && !isBackgroundOnly) {
          const pushForce = (3.5 - distance) * 0.045;
          localWindX += (dx / distance) * pushForce;
          localWindY += (dy / distance) * pushForce;
          
          // Give extra rapid rotational swirl upon near hover collision
          item.group.rotation.y += 0.045 * rotationSpeed;
        }

        // Apply dynamic updates to coordinate matrices
        item.group.position.x = item.baseX + localWindX;
        item.group.position.y = item.baseY + localWindY;
        item.group.position.z = item.baseZ;

        // Rotate organic models beautifully
        item.group.rotation.x += item.rotX * rotationSpeed;
        item.group.rotation.y += item.rotY * rotationSpeed;
        item.group.rotation.z += (item.rotZ + Math.sin(time * 0.001 + item.offset) * 0.002) * rotationSpeed;

        // Depth of Field real-time scaling and opacity adjustment
        applyOrganicDepthOfField(item.group, item.baseZ, item.type);
      });

      // Ambient background particles drift
      const positionsRef = sparkleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Gentle drifting wave motions
        positionsRef[i * 3 + 1] -= (0.005 + Math.sin(time * 0.0005 + i) * 0.002) * rotationSpeed;
        positionsRef[i * 3] += (Math.sin(time * 0.001 + i) * 0.003) + (windForceX * 0.03);

        // Respawn particle at top
        if (positionsRef[i * 3 + 1] < -6) {
          positionsRef[i * 3 + 1] = 6;
          positionsRef[i * 3] = (Math.random() - 0.5) * 16;
        }
      }
      sparkleSystem.geometry.attributes.position.needsUpdate = true;

      // Subtle dynamic camera parallax motion following mouse coordinate
      if (!isBackgroundOnly) {
        camera.position.x += (mouse.x * 0.15 - camera.position.x) * 0.03;
        camera.position.y += (mouse.y * 0.15 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, -1);
      }

      renderer.render(scene, camera);
    };

    // Begin looping
    animationFrameId = requestAnimationFrame(animate);

    // CLEANUP ON UNMOUNT (Dispose geometries/materials for zero memory leak)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Recursive disposal
      scene.clear();
      softSparkleMat.dispose();
      particleGeometry.dispose();
      renderer.dispose();
    };
  }, [flowerCount, rotationSpeed, flowerType, isBackgroundOnly]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0e0c0f] to-[#040305] border border-white/5 shadow-2xl transition-all duration-500 ease-out flex flex-col items-center justify-center ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none" : "h-[450px]"
      } ${className}`}
      id="3d-floral-sanctuary"
    >
      {/* 3D Render Port */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" id="threejs-floral-canvas" />

      {/* Luxury Foreground Accents */}
      {!isBackgroundOnly && (
        <>
          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

          {/* Title Header Overlay */}
          <div className="absolute top-6 left-6 z-10 pointer-events-none text-left" id="sanctuary-hud-left">
            <span className="text-[9px] font-bold tracking-[0.3em] gold-text uppercase block">Live 3D WebGL</span>
            <h4 className="text-xl font-serif font-semibold text-stone-100 tracking-wide mt-0.5">Floral Sanctuary</h4>
            <p className="text-[10px] text-stone-400 mt-1 max-w-xs font-sans">
              Floating red roses, peonies, and falling petals drifting. Hover mouse or touch to create soft breeze vortexes.
            </p>
          </div>

          <div className="absolute top-6 right-6 z-10 flex items-center gap-2" id="sanctuary-hud-right">
            {/* FPS Indicator */}
            <div className="bg-[#0c0a0e]/80 border border-white/5 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-widest text-emerald-400 font-bold">
              {fps} FPS
            </div>

            {/* Toggle Configurator UI Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-stone-900/90 border border-white/10 hover:border-[#c5a059]/40 hover:bg-[#c5a059]/10 text-stone-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
              title="Gilded Scene Config"
              id="btn-3d-scene-config"
            >
              <Settings className={`w-4 h-4 ${showSettings ? "rotate-95 text-[#c5a059]" : ""}`} />
            </button>

            {/* Fullscreen Expansion Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-stone-900/90 border border-white/10 hover:border-[#c5a059]/40 hover:bg-[#c5a059]/10 text-stone-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
              title="Tapestry Fullscreen View"
              id="btn-3d-scene-expand"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#c5a059]" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Luxury Settings Panel */}
          {showSettings && (
            <div 
              className="absolute bottom-16 right-6 z-20 w-72 bg-stone-950/95 border border-[#c5a059]/20 backdrop-blur-xl p-5 rounded-xl shadow-2xl space-y-4 text-xs text-stone-300 font-sans"
              id="floral-settings-panel"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="font-serif font-bold gold-text uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#c5a059]" /> Scene Configurator
                </span>
                <span className="text-[10px] text-stone-500 font-mono">V1.4</span>
              </div>

              {/* Slider for Flower Counts */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-stone-400 uppercase font-semibold">Flora Density</span>
                  <span className="font-bold text-[#c5a059]">{flowerCount} units</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="60" 
                  value={flowerCount}
                  onChange={(e) => setFlowerCount(Number(e.target.value))}
                  className="w-full accent-[#c5a059] h-1 bg-stone-800 rounded-lg outline-none cursor-pointer"
                />
              </div>

              {/* Slider for Speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-stone-400 uppercase font-semibold">Vortex Rotation Speed</span>
                  <span className="font-bold text-[#c5a059]">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="2.5" 
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(Number(e.target.value))}
                  className="w-full accent-[#c5a059] h-1 bg-stone-800 rounded-lg outline-none cursor-pointer"
                />
              </div>

              {/* Toggle Floral Type selectors */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Cultivar Selections</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    { id: "all", label: "Mixed Garland" },
                    { id: "roses", label: "Concentric Roses" },
                    { id: "peonies", label: "Pink Peonies" },
                    { id: "petals", label: "Crimson Petals" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setFlowerType(btn.id as any)}
                      className={`py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                        flowerType === btn.id 
                          ? "bg-[#c5a059]/20 border-[#c5a059] text-white" 
                          : "bg-stone-900/60 border-white/5 hover:border-white/10 hover:bg-stone-900 text-stone-400"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset to Original Defaults */}
              <button
                onClick={() => {
                  setFlowerCount(25);
                  setRotationSpeed(1.0);
                  setFlowerType("all");
                }}
                className="w-full py-1.5 rounded-lg bg-stone-900 hover:bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 font-bold uppercase text-[9px] tracking-widest cursor-pointer mt-2 text-center flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="w-3 h-3" /> Restore Default View
              </button>
            </div>
          )}

          {/* Interactive Mouse Guide Hint Overlay */}
          <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex items-center gap-2 text-stone-500 font-mono text-[9px] tracking-wider" id="hud-interaction-hint">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            <span>Interactive: Drag / Hover cursor to play</span>
          </div>
        </>
      )}
    </div>
  );
}
