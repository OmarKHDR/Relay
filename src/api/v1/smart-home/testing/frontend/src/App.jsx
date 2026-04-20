import React, { useState, useEffect } from 'react';
import { smartHomeApi } from './api/client';
import NetworkDiscovery from './components/NetworkDiscovery';
import DeviceCard from './components/DeviceCard';
import TestPanel from './components/TestPanel';

function App() {
  const [devices, setDevices] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const data = await smartHomeApi.getAllDevices();
      setDevices(data || {});
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscoveryComplete = (discoveredDevices) => {
    if (discoveredDevices) setDevices(discoveredDevices);
    else fetchDevices();
  };

  const handleStateChange = (deviceId, state) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], state }
    }));
  };

  const handleDelete = (deviceId) => {
    setDevices(prev => {
      const newDevs = { ...prev };
      delete newDevs[deviceId];
      return newDevs;
    });
  }

  const deviceList = Object.values(devices);
  const activeCount = deviceList.filter(d => Number(d.state) === 1).length;

  return (
    <div className="min-h-screen p-4 md:p-8 overflow-hidden font-mono text-ink">
        <div className="max-w-[1600px] mx-auto">
            {/* Massive Header */}
            <header className="border-b-[4px] border-ink pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-6xl md:text-8xl tracking-tighter leading-none">SANAD</h1>
                    <h2 className="text-2xl md:text-4xl text-ink-light tracking-wide mt-[-5px]">DOMOTICS_SYS</h2>
                </div>
                
                <div className="flex gap-4 items-end">
                    <div className="bg-ink text-surface p-4 border-[3px] border-ink min-w-32">
                        <div className="text-xs text-ink-light mb-1 border-b border-ink-light/30 pb-1">TOTAL_NODES</div>
                        <div className="text-4xl font-display">{deviceList.length}</div>
                    </div>
                    <div className="bg-accent-green text-ink p-4 border-[3px] border-ink min-w-32 shadow-[4px_4px_0_#111]">
                        <div className="text-xs font-bold mb-1 border-b border-ink/30 pb-1">ACTIVE_LINK</div>
                        <div className="text-4xl font-display">{activeCount}</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Left Side: Ops */}
                <div className="xl:col-span-4 flex flex-col gap-8">
                    <NetworkDiscovery onDiscoveryComplete={handleDiscoveryComplete} />
                    <TestPanel onActionSuccess={fetchDevices} />
                </div>

                {/* Right Side: Grid */}
                <div className="xl:col-span-8">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center border-4 border-dashed border-ink bg-surface">
                            <div className="font-display text-2xl animate-pulse">FETCHING_TOPOLOGY...</div>
                        </div>
                    ) : deviceList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {deviceList.map((dev) => (
                                <DeviceCard 
                                    key={dev.deviceId} 
                                    device={dev} 
                                    onStateChange={handleStateChange}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center border-[4px] border-dashed border-ink bg-surface p-8 text-center text-ink-light">
                            <h3 className="font-display text-4xl text-ink mb-2">VOID</h3>
                            <p className="max-w-md font-mono text-sm leading-relaxed">No topological nodes found in the current subspace. Initiate radar sweep to broadcast UDP packets across the 1004 port.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
