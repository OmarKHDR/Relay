import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Power, Settings2, MapPin, Search } from 'lucide-react';

const NetworkDiscovery = ({ onDiscoveryComplete }) => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);

  const handleDiscovery = async () => {
    setIsDiscovering(true);
    setError(null);
    try {
      const devices = await smartHomeApi.discover(4000);
      if (onDiscoveryComplete) {
        onDiscoveryComplete(devices);
      }
    } catch (err) {
      setError('Failed to discover devices on network');
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
      <div className="relative">
        <div className={`p-4 rounded-full ${isDiscovering ? 'bg-primary-500/20 animate-pulse' : 'bg-dark-700'}`}>
          <Search className={`w-8 h-8 ${isDiscovering ? 'text-primary-400' : 'text-slate-400'}`} />
        </div>
        {isDiscovering && (
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/50 animate-ping" />
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white">Network Sweeper</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-2">
          Broadcast a UDP signal to find unregistered smart home nodes.
        </p>
      </div>

      <button
        onClick={handleDiscovery}
        disabled={isDiscovering}
        className={`glass-button px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2
          ${isDiscovering ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-500/20 text-primary-400'}`}
      >
        <span>{isDiscovering ? 'Scanning Subnet...' : 'Run Discovery'}</span>
      </button>

      {error && <p className="text-accent-red text-sm mt-2">{error}</p>}
    </div>
  );
};

export default NetworkDiscovery;
