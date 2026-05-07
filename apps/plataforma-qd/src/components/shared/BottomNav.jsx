import { Home, Folder, Construction, Settings } from 'lucide-react';
import { MODULES } from '../../constants/modules';

const BottomNav = ({ currentModule, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1816] border-t border-white/5 pb-6 pt-2 z-50">
      <div className="flex justify-around items-center px-2">
        <button
          onClick={() => onNavigate(MODULES.DASHBOARD)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentModule === MODULES.DASHBOARD ? 'text-[#13ecc8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button
          onClick={() => onNavigate(MODULES.PROJECTS)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentModule === MODULES.PROJECTS ? 'text-[#13ecc8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Folder size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Projects</span>
        </button>
        <button
          onClick={() => onNavigate(MODULES.CODE_EDITOR)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentModule === MODULES.CODE_EDITOR ? 'text-[#13ecc8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Construction size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Editor</span>
        </button>
        <button
          onClick={() => onNavigate(MODULES.CREDENTIALS)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            currentModule === MODULES.CREDENTIALS ? 'text-[#13ecc8]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Config</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
