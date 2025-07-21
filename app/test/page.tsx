// components/MikrotikDashboard.tsx
'use client';

import { useMikrotikApi } from '@/hooks/useMikrotikApi';
import { useMikrotikSocket } from '@/hooks/useSocket';
import { useState, useEffect } from 'react';

export default function MikrotikDashboard() {
  const {
    connectionStatus,
    clientCount,
    serverStats,
    error,
    ipAddressData,
    dhcpLeaseData,
    interfaceTrafficData,
    torchData,
    activeStreams,
    streamStatus,
    startIpStream,
    startDhcpStream,
    startInterfaceTrafficStream,
    startTorchStream,
    stopStream,
    getServerStats,
    ping,
    clearData,
    clearError,
    isConnected,
    isConnecting,
    hasError,
    streamCount,
  } = useMikrotikSocket();
  const { interfaces } = useMikrotikApi();

  const [selectedInterface, setSelectedInterface] = useState('ether2');

  // Auto-ping every 30 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        ping();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, ping]);

  console.log("MIkrotik Interfaces",interfaces)

  // Auto-refresh server stats every 10 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        getServerStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, getServerStats]);

  const handleStopStream = (streamId: string) => {
    stopStream(streamId);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MikroTik Monitor Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time monitoring of MikroTik router data
        </p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Connection Status</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(connectionStatus.status)}`}>
                {connectionStatus.status.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatTimestamp(connectionStatus.timestamp)}
              </p>
              {connectionStatus.clientId && (
                <p className="text-xs text-gray-400">
                  ID: {connectionStatus.clientId.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {connectionStatus.message}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Connected Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clientCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Active Streams</p>
              <p className="text-2xl font-bold text-blue-600">{streamCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Server Stats</p>
              {serverStats && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Total Streams: {serverStats.totalStreams}
                  </p>
                  <p className="text-sm text-gray-600">
                    Uptime: {Math.floor(serverStats.uptime / 60)}m
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={getServerStats}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!isConnected}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error.message}</p>
              <p className="text-xs text-red-600 mt-1">
                Type: {error.type} | {formatTimestamp(error.timestamp)}
              </p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stream Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stream Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* IP Address Stream */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">IP Address Stream</h3>
            <button
              onClick={startIpStream}
              disabled={!isConnected}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Start IP Stream
            </button>
            <p className="text-xs text-gray-500">
              Data points: {ipAddressData.length}
            </p>
          </div>

          {/* DHCP Lease Stream */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">DHCP Lease Stream</h3>
            <button
              onClick={startDhcpStream}
              disabled={!isConnected}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Start DHCP Stream
            </button>
            <p className="text-xs text-gray-500">
              Data points: {dhcpLeaseData.length}
            </p>
          </div>

          {/*Interface Traffic Stream */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Interface Traffic Stream</h3>
            <button
            onClick={() => startInterfaceTrafficStream("ether2")}
            disabled={!isConnected}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg
            -orange-600 disabled:bg-gray-300"
            >
              Start Interface Traffic Stream
            </button>
            <p className="text-xs text-gray-500">
              Data points: {}
            </p>
          </div>

          {/* Torch Stream */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Torch Stream</h3>
            <div className="flex space-x-2">
              <select
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {/* {
                  interfaces.map
                } */}
                <option value="ether1">ether1</option>
              </select>
              <button
                onClick={() => startTorchStream(selectedInterface)}
                disabled={!isConnected}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
              >
                Start
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Data points: {torchData.length}
            </p>
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={clearData}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Active Streams */}
      {activeStreams.size > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Streams</h2>
          <div className="space-y-2">
            {Array.from(activeStreams).map((streamId) => (
              <div
                key={streamId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Stream ID: {streamId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {streamStatus.get(streamId) || 'active'}
                  </p>
                </div>
                <button
                  onClick={() => handleStopStream(streamId)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Stop
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IP Address Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            IP Address Data
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ipAddressData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              ipAddressData.slice(-10).map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DHCP Lease Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            DHCP Lease Data
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dhcpLeaseData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              dhcpLeaseData.slice(-10).map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Torch Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Torch Data
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {torchData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              torchData.slice(-10).map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}