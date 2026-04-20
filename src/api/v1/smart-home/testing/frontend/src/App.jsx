import React, { useState, useEffect } from 'react';
import { smartHomeApi } from './api/client';
import NetworkDiscovery from './components/NetworkDiscovery';
import DeviceCard from './components/DeviceCard';
import TestPanel from './components/TestPanel';
import { Home, LayoutGrid } from 'lucide-react';

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
    <div className="min-h-screen pb-16">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 text-indigo-600">
                    <Home className="w-5 h-5 stroke-[2.5]" />
                    <span className="text-lg font-bold text-slate-800 tracking-tight">Sanad Home</span>
                </div>
                <div className="flex space-x-6 text-sm font-semibold">
                    <div className="text-slate-500">Nodes: <span className="text-slate-800">{deviceList.length}</span></div>
                    <div className="text-slate-500">Active: <span className="text-green-600">{activeCount}</span></div>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <NetworkDiscovery onDiscoveryComplete={handleDiscoveryComplete} />
            </div>

            <div className="lg:col-span-9 flex flex-col gap-8">
                <div className="flex items-center gap-2 text-slate-800 mb-2">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-bold tracking-tight">Device Dashboard</h2>
                </div>

                {isLoading ? (
                    <div className="h-48 flex items-center justify-center bg-transparent rounded-3xl border-2 border-slate-200 border-dashed">
                        <div className="text-slate-400 font-medium animate-pulse flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"/> Loading systems...
                        </div>
                    </div>
                ) : deviceList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                    <div className="h-48 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 p-6 text-center shadow-sm">
                        <p className="text-slate-800 font-bold text-lg mb-1">No devices mapped</p>
                        <p className="text-sm text-slate-500">Run a network discovery scan to find connected instances.</p>
                    </div>
                )}

                <div className="pt-8">
                    <TestPanel onActionSuccess={fetchDevices} />
                </div>
            </div>
        </main>
    </div>
  );
}

export default App;
