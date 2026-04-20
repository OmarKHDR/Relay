import React, { useState } from 'react';
import { smartHomeApi } from '../api/client';
import { Plus } from 'lucide-react';

const TestPanel = ({ onActionSuccess }) => {
  const [logs, setLogs] = useState('');
  
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState('binary');
  const [regPos, setRegPos] = useState('');

  const [targetId, setTargetId] = useState('');
  const [updatePos, setUpdatePos] = useState('');
  const [updateName, setUpdateName] = useState('');

  const logResult = (text) => setLogs(prev => `${new Date().toLocaleTimeString()} :: ${text}\n` + prev);

  const handleRegister = async () => {
    try {
      await smartHomeApi.registerDevice({
        deviceId: regId, name: regName, controlType: regType, position: regPos, state: 0
      });
      logResult(`ACK REG: ${regId}`);
      if (onActionSuccess) onActionSuccess();
    } catch (e) {
      logResult(`ERR REG: ${e.message}`);
    }
  };

  const handleUpdate = async () => {
    try {
      await smartHomeApi.updateDeviceInfo(targetId, updatePos, updateName);
      logResult(`ACK UDT: ${targetId}`);
      if (onActionSuccess) onActionSuccess();
    } catch (e) {
      logResult(`ERR UDT: ${e.message}`);
    }
  };

  const handleInfo = async () => {
    try {
      const info = await smartHomeApi.getDeviceInfo(targetId);
      logResult(`INF [${targetId}] -> ${JSON.stringify(info)}`);
    } catch (e) {
      logResult(`ERR INF: ${e.message}`);
    }
  };

  const handleStatus = async () => {
    try {
      const status = await smartHomeApi.getDeviceStatus(targetId);
      logResult(`STS [${targetId}] -> ${JSON.stringify(status)}`);
    } catch (e) {
      logResult(`ERR STS: ${e.message}`);
    }
  };

  return (
    <div className="brutal-card p-6 flex flex-col gap-6">
      <div className="border-b-4 border-ink pb-2">
        <h3 className="text-2xl">DIAGNOSTICS</h3>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-bold text-accent-blue bg-accent-blue/10 w-max px-2 py-1 border border-accent-blue text-xs">SYS.REGISTER</span>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <input className="brutal-input" placeholder="DEV_ID" value={regId} onChange={e => setRegId(e.target.value)} />
          <input className="brutal-input" placeholder="ALIAS" value={regName} onChange={e => setRegName(e.target.value)} />
          <input className="brutal-input" placeholder="ZONE" value={regPos} onChange={e => setRegPos(e.target.value)} />
          <select className="brutal-input cursor-pointer" value={regType} onChange={e => setRegType(e.target.value)}>
            <option value="binary">BIN</option>
            <option value="range">RNG</option>
          </select>
        </div>
        <button onClick={handleRegister} className="brutal-button px-4 py-2 bg-accent-blue text-white hover:bg-blue-600">
          EXEC REGISTRATION
        </button>
      </div>

      <div className="flex flex-col gap-3 pt-6 border-t-[2px] border-dashed border-ink">
        <span className="font-bold text-accent-orange bg-accent-orange/10 w-max px-2 py-1 border border-accent-orange text-xs">SYS.MUTATE</span>
        <input className="brutal-input text-lg border-[3px]" placeholder="TARGET_ID" value={targetId} onChange={e => setTargetId(e.target.value)} />
        
        <div className="flex gap-2">
           <button onClick={handleInfo} className="brutal-button px-3 py-2 flex-1 text-sm bg-paper">Q_INFO</button>
           <button onClick={handleStatus} className="brutal-button px-3 py-2 flex-1 text-sm bg-paper">Q_STATUS</button>
        </div>

        <div className="flex gap-2 text-sm mt-2">
            <input className="brutal-input flex-1" placeholder="UDT_ZONE" value={updatePos} onChange={e => setUpdatePos(e.target.value)} />
            <input className="brutal-input flex-1" placeholder="UDT_ALIAS" value={updateName} onChange={e => setUpdateName(e.target.value)} />
        </div>
        <button onClick={handleUpdate} className="brutal-button px-4 py-2 bg-ink text-white hover:bg-black">
            EXEC MUTATION
        </button>
      </div>

      <div className="bg-ink text-paper p-4 border-l-[8px] border-accent-green h-40 overflow-y-auto mt-4 font-mono text-xs">
        <p className="whitespace-pre-wrap">{logs || 'AWAITING INPUT...'}</p>
      </div>
    </div>
  );
};

export default TestPanel;
