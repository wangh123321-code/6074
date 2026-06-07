import Scene3D from './components/Three/Scene';
import { TopNavbar } from './components/UI/TopNavbar';
import { LeftPanel } from './components/UI/LeftPanel';
import { RightPanel } from './components/UI/RightPanel';
import { BottomBar } from './components/UI/BottomBar';
import { LoadingScreen } from './components/UI/LoadingScreen';

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 relative">
      <LoadingScreen />
      
      <div className="absolute inset-0">
        <Scene3D />
      </div>

      <TopNavbar />
      <LeftPanel />
      <RightPanel />
      <BottomBar />

      <div className="absolute bottom-4 right-4 text-slate-500 text-xs z-20">
        <p>v1.0.0 | 支持 Chrome 90+/Edge 90+/Firefox 88+/Safari 14+</p>
      </div>
    </div>
  );
}
