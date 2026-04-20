import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Settings2, Plus, RefreshCw, Send } from 'lucide-react';

const TestPanel = ({ onActionSuccess }) => {
  const [logs, setLogs] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState('binary');
  const [regPos, setRegPos] = useState('');

  const [targetId, setTargetId] = useState('');
  const [updatePos, setUpdatePos] = useState('');
  const [updateName, setUpdateName] = useState('');

  const logResult = (text) => setLogs(prev => `${new Date().toLocaleTimeString()} - ${text}\n` + prev);

  const handleRegister = async () => {
    try {
      await smartHomeApi.registerDevice({
        deviceId: regId, name: regName, controlType: regType, position: regPos, state: 0
      });
      logResult(`Registered successfully: ${regId}`);
      if (onActionSuccess) onActionSuccess();
    } catch (e) {
      logResult(`Register Error: ${e.message}`);
    }
  };

  const handleUpdate = async () => {
    try {
      await smartHomeApi.updateDeviceInfo(targetId, updatePos, updateName);
      logResult(`Updated Metadata: ${targetId}`);
      if (onActionSuccess) onActionSuccess();
    } catch (e) {
      logResult(`Update Error: ${e.message}`);
    }
  };

  const handleInfo = async () => {
    try {
      const info = await smartHomeApi.getDeviceInfo(targetId);
      logResult(`Info [${targetId}]: ${JSON.stringify(info)}`);
    } catch (e) {
      logResult(`Info Error: ${e.message}`);
    }
  };

  const handleStatus = async () => {
    try {
      const status = await smartHomeApi.getDeviceStatus(targetId);
      logResult(`Status [${targetId}]: ${JSON.stringify(status)}`);
    } catch (e) {
      logResult(`Status Error: ${e.message}`);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-slate-800">Developer Testing Panel</span>
        </div>
        <span className="text-slate-400 text-sm font-medium">{isExpanded ? 'Hide Tools' : 'Show Tools'}</span>
      </button>

      {isExpanded && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-8">
          {/* Register Block */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-500"/> Register New Device</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <input className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="Device ID" value={regId} onChange={e => setRegId(e.target.value)} />
              <input className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="Name" value={regName} onChange={e => setRegName(e.target.value)} />
              <input className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" placeholder="Location" value={regPos} onChange={e => setRegPos(e.target.value)} />
              <select className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none" value={regType} onChange={e => setRegType(e.target.value)}>
                <option value="binary">Binary (On/Off)</option>
                <option value="range">Range</option>
              </select>
            </div>
            <button onClick={handleRegister} className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
              Execute Registration
            </button>
          </div>

          <hr className="border-slate-200 border-dashed" />

          {/* Update Block */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-indigo-500"/> Modify Existing Device</h4>
            <div className="space-y-3">
                <input className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none bg-white shadow-sm" placeholder="Target Device ID" value={targetId} onChange={e => setTargetId(e.target.value)} />
                <div className="flex gap-2">
                    <input className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none bg-white shadow-sm" placeholder="Update Location" value={updatePos} onChange={e => setUpdatePos(e.target.value)} />
                    <input className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none bg-white shadow-sm" placeholder="Update Name" value={updateName} onChange={e => setUpdateName(e.target.value)} />
                    <button onClick={handleUpdate} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors shadow-md">Update</button>
                </div>
                <div className="flex gap-2 pt-2">
                    <button onClick={handleInfo} className="flex-1 py-2 border border-slate-200 bg-white shadow-sm text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2"><Send className="w-3.5 h-3.5"/> Ping Info</button>
                    <button onClick={handleStatus} className="flex-1 py-2 border border-slate-200 bg-white shadow-sm text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2"><Send className="w-3.5 h-3.5"/> Ping Status</button>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 h-32 overflow-y-auto shadow-inner">
            <h5 className="text-[11px] text-slate-500 font-bold mb-2 uppercase tracking-wide">Console Output</h5>
            <p className="text-[13px] font-mono text-emerald-400 whitespace-pre-wrap">{logs || 'No active event triggers...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPanel;
