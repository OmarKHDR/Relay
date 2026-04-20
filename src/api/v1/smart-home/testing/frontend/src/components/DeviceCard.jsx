import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Power, Trash2, Crosshair } from 'lucide-react';

const DeviceCard = ({ device, onStateChange, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleState = async () => {
    if (device.controlType !== 'binary') return;
    
    setIsUpdating(true);
    try {
      const newState = Number(device.state) === 1 ? 0 : 1;
      await smartHomeApi.controlDevice(device.deviceId, newState);
      if (onStateChange) onStateChange(device.deviceId, newState);
    } catch (err) {
      console.error('Failed to change state:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
     try {
       await smartHomeApi.deleteDevice(device.deviceId);
       if (onDelete) onDelete(device.deviceId);
     } catch(err) {
       console.error("Failed to delete device", err);
     }
  }

  const isOn = Number(device.state) === 1;

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-500/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
            {device.name || 'Unnamed Device'}
            <div className={`w-2 h-2 rounded-full ${isOn ? 'bg-accent-green shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1 w-32 truncate" title={device.deviceId}>{device.deviceId}</p>
        </div>
        
        <button 
          onClick={handleRemove}
          className="text-slate-500 hover:text-accent-red transition-colors p-2 rounded-lg hover:bg-dark-700/50 opacity-0 group-hover:opacity-100"
          title="Remove Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex space-x-2 text-xs font-medium text-slate-400">
          <span className="bg-dark-900 px-2 py-1 rounded-md border border-dark-700/50 tracking-wide uppercase">
            {device.controlType}
          </span>
          <span className="bg-dark-900 px-2 py-1 rounded-md border border-dark-700/50 flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            {device.position || 'Unknown'}
          </span>
        </div>

        <div className="pt-4 border-t border-dark-700/50 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {isOn ? 'Active' : 'Standby'}
          </span>
          
          <button
            onClick={toggleState}
            disabled={isUpdating || device.controlType !== 'binary'}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50
              ${isOn ? 'bg-primary-500' : 'bg-dark-700'}
              ${device.controlType !== 'binary' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`
              absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
              ${isOn ? 'translate-x-6' : 'translate-x-0'}
            `}>
               <Power className={`w-3 h-3 ${isOn ? 'text-primary-500' : 'text-slate-400'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
