import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Radar } from 'lucide-react';

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
    <div className="brutal-card p-6 border-b-8 border-b-accent-orange">
      <h3 className="text-2xl mb-2">RADAR SWEEP</h3>
      <p className="text-ink-light text-xs font-mono mb-6 leading-tight max-w-xs">
        BROADCAST UDP PACKETS ACROSS THE NETWORK TOPOLOGY TO RESOLVE UNMAPPED NODES.
      </p>
      <button 
        onClick={startDiscovery}
        disabled={isDiscovering}
        className={`brutal-button w-full py-4 text-lg ${isDiscovering ? 'bg-paper text-ink-light cursor-not-allowed shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-accent-orange text-white hover:bg-orange-600'}`}
      >
        <Radar className={isDiscovering ? "animate-spin" : ""} />
        {isDiscovering ? 'SWEEPING...' : 'INITIATE T-4000MS'}
      </button>
    </div>
  );
};

export default NetworkDiscovery;
