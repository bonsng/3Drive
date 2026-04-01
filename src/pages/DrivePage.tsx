import { useRef } from 'react';
import { useDriveScene } from '@/hooks/use-drive-scene';

export default function DrivePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDriveScene(canvasRef);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />;
}
