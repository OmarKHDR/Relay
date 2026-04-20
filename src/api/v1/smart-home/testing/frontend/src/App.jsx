import React, { useState, useEffect } from 'react';
import { smartHomeApi } from './api/client';
import NetworkDiscovery from './components/NetworkDiscovery';
import DeviceCard from './components/DeviceCard';
import { Activity, Radio, LayoutGrid, Plus } from 'lucide-react';

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
    // In a real application, ideally we'd use WebSockets for real-time updates.
    // Here we'll do a simple polling fallback for demonstration
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscoveryComplete = (discoveredDevices) => {
    if (discoveredDevices) {
      setDevices(discoveredDevices);
    } else {
      fetchDevices();
    }
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
    <div className="min-h-screen bg-dark-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dark-700/50">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
              <Radio className="w-8 h-8 text-primary-500" />
              Smart Home Hub
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System monitoring {deviceList.length} registered nodes
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-panel px-6 py-3 rounded-full flex space-x-6 text-sm font-medium">
              <div className="flex flex-col items-center">
                <span className="text-slate-400">Total</span>
                <span className="text-white text-lg">{deviceList.length}</span>
              </div>
              <div className="w-px bg-dark-700/50"></div>
              <div className="flex flex-col items-center">
                <span className="text-slate-400">Active</span>
                <span className="text-accent-green text-lg">{activeCount}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="space-y-6">
            <NetworkDiscovery onDiscoveryComplete={handleDiscoveryComplete} />
            
            {/* Quick Actions (Future placeholder logic) */}
            <div className="glass-panel p-6 rounded-2xl">
               <h3 className="text-lg font-semibold mb-4 text-white">Manual Config</h3>
               <button className="w-full glass-button py-3 rounded-xl flex justify-center items-center gap-2 text-primary-400">
                  <Plus className="w-4 h-4" /> Add Virtual Node
               </button>
            </div>
          </div>

          {/* Right Main Area */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <LayoutGrid className="w-5 h-5 text-primary-500" /> Dashboard
              </h2>
            </div>

            {isLoading ? (
              <div className="w-full flex justify-center py-20">
                 <div className="w-10 h-10 border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : deviceList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="glass-panel p-16 rounded-2xl text-center border-dashed border-2 border-dark-700 bg-transparent">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-800 mb-4">
                  <Radio className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-300">No Devices Found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Run a network discovery on the left panel or ensure the UDP broadcasts are active on the devices.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
