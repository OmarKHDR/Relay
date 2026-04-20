import React from 'react';
import { smartHomeApi } from '../api/client';
import { Trash, Power } from 'lucide-react';

const DeviceCard = ({ device, onStateChange, onDelete }) => {
    const { deviceId, name, position, controlType, state } = device;
    const isActive = Number(state) === 1;

    const toggleState = async () => {
        const newState = isActive ? 0 : 1;
        try {
            await smartHomeApi.controlDevice(deviceId, newState);
            if (onStateChange) onStateChange(deviceId, newState);
        } catch (error) {
            console.error('Failed to change state', error);
        }
    };

    const handleDelete = async () => {
        try {
            await smartHomeApi.deleteDevice(deviceId);
            if (onDelete) onDelete(deviceId);
        } catch (error) {
            console.error('Failed to delete', error);
        }
    }

    return (
        <div className="brutal-card flex flex-col relative overflow-hidden group">
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 w-3 h-full border-r-2 border-ink ${isActive ? 'bg-accent-green' : 'bg-ink'}`}></div>
            
            <div className="pl-6 p-5 pb-4 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-ink text-surface px-2 shadow-[2px_2px_0px_#ccc] font-bold text-xs py-0.5 tracking-widest">{deviceId}</span>
                    <button onClick={handleDelete} className="text-ink hover:text-accent-orange hover:scale-110 active:scale-95 transition-transform"><Trash className="w-5 h-5"/></button>
                </div>
                
                <h2 className="text-3xl leading-none mb-1 break-words">{name}</h2>
                <div className="text-xs font-mono text-ink-light bg-paper border border-ink w-max px-2 py-0.5 mt-2">
                    ZONE: {position || 'UNASSIGNED'}
                </div>
            </div>

            <div className="border-t-2 border-ink bg-paper p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-light">
                    TYPE: [{controlType.toUpperCase()}]
                </div>
                <button 
                  onClick={toggleState}
                  className={`brutal-button px-4 py-2 border-2 border-ink ${isActive ? 'bg-accent-green text-ink shadow-[2px_2px_0_#111]' : 'bg-surface text-ink shadow-[2px_2px_0_#111]'}`}
                >
                    <Power className={`w-4 h-4 ${isActive ? '!text-ink' : ''}`} />
                    {isActive ? 'HALT' : 'ENGAGE'}
                </button>
            </div>
        </div>
    );
};

export default DeviceCard;
