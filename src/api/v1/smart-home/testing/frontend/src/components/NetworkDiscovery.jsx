import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Search, Loader2 } from 'lucide-react';

const NetworkDiscovery = ({ onDiscoveryComplete }) => {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const startDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const devs = await smartHomeApi.discover(4000);
      if (onDiscoveryComplete) onDiscoveryComplete(devs);
    } catch (err) {
      console.error('Discovery failed', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 text-center">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Network Discovery</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-[200px] mx-auto leading-relaxed">
        Scan the local network for new unmapped smart devices.
      </p>
      <button 
        onClick={startDiscovery}
        disabled={isDiscovering}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center gap-2"
      >
        {isDiscovering && <Loader2 className="w-4 h-4 animate-spin" />}
        {isDiscovering ? 'Scanning Subnet...' : 'Find Devices'}
      </button>
    </div>
  );
};

export default NetworkDiscovery;
