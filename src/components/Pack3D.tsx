import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera, Environment, Float, SpotLight, Center, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '@use-gesture/react';

function Model({ modelPath, progress, isPremium, rotation, isFinalizing, onAnimationEnd, dpr }: { modelPath: string; progress: number; isPremium?: boolean; rotation: [number, number]; isFinalizing: boolean; onAnimationEnd: () => void; dpr: number }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, group);
  const lightRef = useRef<THREE.SpotLight>(null);
  const { viewport } = useThree();

  const adaptiveScale = Math.min(viewport.width / 4, 1.0);

  useEffect(() => {
    if (actions[names[0]]) {
      const action = actions[names[0]]!;
      action.play();
      action.paused = !isFinalizing;
      if (isFinalizing) {
        action.timeScale = 2.5;
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce, 1);
        const mixer = action.getMixer();
        const onFinished = () => { onAnimationEnd(); mixer.removeEventListener('finished', onFinished); };
        mixer.addEventListener('finished', onFinished);
      }
    }
  }, [actions, names, isFinalizing, onAnimationEnd]);

  useFrame((state) => {
    if (actions[names[0]]) {
      const action = actions[names[0]]!;
      const clip = action.getClip();
      if (!isFinalizing) {
        action.time = progress * (clip.duration * 0.5);
      }
    }
    if (group.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotation[0] + Math.sin(t * 0.5) * 0.05, 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotation[1] + Math.cos(t * 0.5) * 0.05, 0.1);
    }
    // Desativa luzes dinâmicas complexas se o DPR for muito baixo (celular fraco)
    if (isPremium && lightRef.current && dpr > 0.9) {
      const t = state.clock.getElapsedTime();
      lightRef.current.position.x = Math.sin(t * 0.5) * 5;
      lightRef.current.position.z = Math.cos(t * 0.5) * 5;
    }
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={adaptiveScale} />
      </Center>
      {isPremium && dpr > 0.8 && (
        <>
          <SpotLight ref={lightRef} position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={3} color="#ffd700" />
          <pointLight position={[0, 0, 2]} intensity={1.5} color="#ffd700" />
        </>
      )}
    </group>
  );
}

export default function Pack3D({ modelPath, onOpenComplete, isOpeningExternally }: any) {
  const isPremium = modelPath.includes('PREMIUM');
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);

  // Controle de Performance
  const [dpr, setDpr] = useState(1.5); // Começa com qualidade média-alta

  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      if (completed || isFinalizing) return;
      const rotY = (x / 150);
      const rotX = (y / 150);
      const limit = Math.PI / 2.5;
      setRotation([Math.max(-limit, Math.min(limit, rotX)), Math.max(-limit, Math.min(limit, rotY))]);
    }
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (completed || isFinalizing || isOpeningExternally) return;
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (val >= 0.99 && !isFinalizing) { setIsFinalizing(true); }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-[12vh] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#422422]/10 blur-2xl pointer-events-none" />

      <div className="w-full flex-1 relative touch-none" {...(bind() as any)}>
        <Canvas
          shadows={dpr > 1} // Desativa sombras em dispositivos fracos
          gl={{
            antialias: dpr > 1, // Desativa anti-aliasing se a performance cair
            powerPreference: "high-performance"
          }}
          dpr={dpr}
          camera={{ position: [0, 0, 10], fov: 18 }}
        >
          {/* Monitora o FPS e ajusta o DPR (Pixel Ratio) automaticamente */}
          <PerformanceMonitor onDecline={() => setDpr(0.7)} onIncline={() => setDpr(1.5)}>
            <Environment preset="studio" intensity={0.05} />
            <ambientLight intensity={dpr > 1 ? 0.3 : 0.6} />
            <pointLight position={[5, 5, 5]} intensity={0.1} />

            <Float speed={isFinalizing ? 0 : 1} rotationIntensity={0.05} floatIntensity={0.1}>
              <Model
                modelPath={modelPath}
                progress={progress}
                isPremium={isPremium}
                rotation={rotation}
                isFinalizing={isFinalizing}
                dpr={dpr}
                onAnimationEnd={() => {
                  setCompleted(true);
                  onOpenComplete();
                }}
              />
            </Float>
          </PerformanceMonitor>
        </Canvas>
      </div>

      {!isFinalizing && !completed && !isOpeningExternally && (
        <div className="w-[80%] max-w-[240px] p-2 z-[100] mb-[5vh]">
          <div className="flex flex-col items-center gap-4">
            <span className="text-[#422422] font-alfa text-[8px] uppercase tracking-[0.3em] opacity-80">
              Arraste para abrir
            </span>
            <div className="w-full h-1 bg-[#422422]/10 rounded-full relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={progress}
                  onChange={handleSliderChange}
                  className="w-full h-full bg-transparent appearance-none cursor-pointer accent-[#422422]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[#422422] [&::-webkit-slider-thumb]:shadow-none transition-transform"
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
