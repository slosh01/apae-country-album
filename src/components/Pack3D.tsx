import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera, Environment, Float, Center, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '@use-gesture/react';

function Model({ modelPath, progress, isPremium, rotation, isFinalizing, onAnimationEnd }: { modelPath: string; progress: number; isPremium?: boolean; rotation: [number, number]; isFinalizing: boolean; onAnimationEnd: () => void }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, group);
  const lightRef = useRef<THREE.SpotLight>(null);
  const { viewport } = useThree();

  const adaptiveScale = Math.min(viewport.width / 4, 1.1);

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
        const onFinished = () => {
          onAnimationEnd();
          mixer.removeEventListener('finished', onFinished);
        };
        mixer.addEventListener('finished', onFinished);
      }
    }
  }, [actions, names, isFinalizing, onAnimationEnd]);

  useFrame((state) => {
    if (actions[names[0]] && !isFinalizing) {
      const action = actions[names[0]]!;
      const clip = action.getClip();
      // O slider controla os primeiros 50% da animação
      action.time = progress * (clip.duration * 0.5);
    }
    if (group.current) {
      // Rotação manual + Flutuação
      const t = state.clock.getElapsedTime();
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotation[0] + Math.sin(t * 0.5) * 0.05, 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotation[1] + Math.cos(t * 0.5) * 0.05, 0.1);
    }
    if (isPremium && lightRef.current) {
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
      {isPremium && (
        <>
          <SpotLight ref={lightRef} position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={15} color="#ffd700" />
          <pointLight position={[0, 0, 2]} intensity={8} color="#ffd700" />
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

  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      if (completed || isFinalizing) return;
      const limit = Math.PI / 2.5;
      setRotation([Math.max(-limit, Math.min(limit, y / 150)), Math.max(-limit, Math.min(limit, x / 150))]);
    }
  });

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (completed || isFinalizing || isOpeningExternally) return;
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (val >= 0.99 && !isFinalizing) { setIsFinalizing(true); }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-[12vh] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#422422]/10 blur-3xl pointer-events-none" />

      <div className="w-full flex-1 relative touch-none" {...(bind() as any)}>
        <Canvas shadows gl={{ antialias: true, powerPreference: "high-performance", alpha: true }} camera={{ position: [0, 0, 10], fov: 18 }}>
          <Environment preset="studio" intensity={0.1} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.3} />
          <Model
            modelPath={modelPath}
            progress={progress}
            isPremium={isPremium}
            rotation={rotation}
            isFinalizing={isFinalizing}
            onAnimationEnd={() => {
              setCompleted(true);
              onOpenComplete();
            }}
          />
        </Canvas>
      </div>

      {!isFinalizing && !completed && !isOpeningExternally && (
        <div className="w-[85%] max-w-[280px] p-2 z-[100] mb-[5vh]">
          <div className="flex flex-col items-center gap-6">
            <span className="text-[#422422] font-alfa text-[8px] uppercase tracking-[0.3em] opacity-80">Arraste para abrir</span>
            <div className="w-full h-1.5 bg-[#422422]/10 rounded-full relative flex items-center">
              <input type="range" min="0" max="1" step="0.01" value={progress} onChange={handleSliderChange} className="custom-slider w-full h-full bg-transparent appearance-none cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 0; height: 0; border-top: 14px solid transparent; border-bottom: 14px solid transparent; border-left: 20px solid #422422; background: transparent !important; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.1s ease; }
        .custom-slider::-webkit-slider-thumb:active { transform: scale(1.2); }
        .custom-slider::-moz-range-thumb { width: 0; height: 0; border-top: 14px solid transparent; border-bottom: 14px solid transparent; border-left: 20px solid #422422; border-right: none; background: transparent !important; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
      `}</style>
    </div>
  );
}
