import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import React, { Suspense } from "react";

// ...existing code...

function RobotModel() {
  const { scene } = useGLTF("/models/sphere_bot.glb");
  return <primitive object={scene} scale={2} />;
}

// ...existing code...

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ...existing code... */}

      {/* 3D Robot Agent Section */}
      <section className="w-full h-[500px] flex items-center justify-center bg-black">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <RobotModel />
          </Suspense>
          <OrbitControls enablePan={false} />
        </Canvas>
      </section>

      {/* ...existing code... */}
    </div>
  );
}

// ...existing code...