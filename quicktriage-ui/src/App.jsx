import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import * as Tabs from '@radix-ui/react-tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const appWrapper = {
  background: '#1b1b1b',
  color: '#b4e852',
  fontFamily: 'monospace',
  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
  minHeight: '100vh',
  width: '100vw',
  padding: '12px',
  display: 'block',
  justifyContent: 'center',
  overflowX: 'auto',
  overflowY: 'auto'
};

const container = {
  width: '100%',
  maxWidth: '1200px',
  minWidth: '360px',
  display: 'flex',
  margin: '0 auto',
  flexDirection: 'column',
  flexGrow: 1,
};

const scrollbarStyle = `
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: #1b1b1b;
  }

  button {
    background: #2a2a2a;
    color: #b4e852;
    border: none;
    padding: 6px 12px;
    font-family: monospace;
    cursor: pointer;
    transition: background 0.2s;
    border-radius: 4px;
  }

  button:hover {
    background: #3a3a3a;
  }

  button:focus {
    outline: 1px solid #b4e852;
  }
`;

function App() {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState('');

  const fetchData = async () => {
    const result = await invoke('get_system_info');
    setData(result);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const exportToFile = async () => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    await writeTextFile('system_report.json', json, { dir: BaseDirectory.App });
    showToast('✅ Exported to AppData/system_report.json');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <div style={appWrapper}><p>Loading system data...</p></div>;

  const memoryChart = [
    { name: 'Used Memory', value: data.used_memory },
    { name: 'Total Memory', value: data.total_memory },
    { name: 'Used Swap', value: data.used_swap },
    { name: 'Total Swap', value: data.total_swap },
  ];

  const cpuChart = [{ name: data.cpu_name, usage: data.cpu_usage }];

  const netChart = data.network_info.map((net) => ({
    name: net.interface,
    received: net.received,
    transmitted: net.transmitted,
  }));

  const renderKV = (obj) => (
    <div style={{ lineHeight: 1.6 }}>
      {Object.entries(obj).map(([key, val]) => (
        <div key={key}>
          <strong>{key}:</strong> {val}
        </div>
      ))}
    </div>
  );

  return (
    <div style={appWrapper}>
      <style>{scrollbarStyle}</style>
      <div style={container}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.2rem)', marginBottom: '10px' }}>
          Quick Incident Triage Toolkit
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)', opacity: 0.6 }}>
            Last scanned at {lastUpdated}
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={fetchData}>🔁 Refresh</button>
            <button onClick={exportToFile}>📤 Export</button>
          </div>
        </div>

        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#2a2a2a',
            color: '#b4e852',
            padding: '10px 16px',
            borderRadius: '6px',
            boxShadow: '0 0 8px #000'
          }}>
            {toast}
          </div>
        )}

        <Tabs.Root defaultValue="system" style={{ marginTop: 20 }}>
          <Tabs.List
            aria-label="System info tabs"
            style={{
              display: 'flex',
              gap: '10px',
              borderBottom: '1px solid #444',
              flexWrap: 'wrap',
            }}
          >
            <Tabs.Trigger value="system">System</Tabs.Trigger>
            <Tabs.Trigger value="cpu">CPU</Tabs.Trigger>
            <Tabs.Trigger value="memory">Memory</Tabs.Trigger>
            <Tabs.Trigger value="disks">Disks</Tabs.Trigger>
            <Tabs.Trigger value="network">Network</Tabs.Trigger>
            <Tabs.Trigger value="processes">Processes</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="system"><h2>System</h2>{renderKV({
            hostname: data.hostname,
            os_version: data.os_version,
            kernel_version: data.kernel_version,
            uptime: data.uptime
          })}</Tabs.Content>

          <Tabs.Content value="cpu">
            <h2>CPU Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cpuChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#b4e852" />
              </BarChart>
            </ResponsiveContainer>
          </Tabs.Content>

          <Tabs.Content value="memory">
            <h2>Memory & Swap</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#b4e852" />
              </BarChart>
            </ResponsiveContainer>
          </Tabs.Content>

          <Tabs.Content value="disks">
            <h2>Disk Details</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.disk_info.map((d, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <strong>{d.name}</strong><br />
                  Mount: {d.mount_point} | Total: {d.total_space} | Free: {d.available_space}
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="network">
            <h2>Network Throughput</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={netChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#8884d8" />
                <Bar dataKey="transmitted" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Tabs.Content>

          <Tabs.Content value="processes">
            <h2>Top Processes</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.top_processes.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <strong>{p.name}</strong> (PID: {p.pid})<br />
                  CPU: {p.cpu_usage}% | Mem: {p.memory} | Status: {p.status}
                </div>
              ))}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default App;
