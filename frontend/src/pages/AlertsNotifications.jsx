import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Smartphone, CheckCircle, AlertTriangle, 
  RefreshCw, Radio, CheckCircle2, XCircle, Clock, ShieldAlert,
  ArrowRight, Filter, Info, ChevronRight, Layers, Eye
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { 
  fetchRegisteredDevices, 
  sendTestNotification, 
  fetchDeliveryHistory, 
  fetchVayuAlerts,
  createVayuAlert 
} from '../services/api';

export default function AlertsNotifications() {
  const [activeTab, setActiveTab] = useState('test'); // 'test' | 'devices' | 'alerts' | 'history'
  
  // Data state
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Test form state
  const [testSeverity, setTestSeverity] = useState('TEST');
  const [testTitle, setTestTitle] = useState('VAYU Test Alert');
  const [testMessage, setTestMessage] = useState('Notification pipeline is operational.');
  const [targetMode, setTargetMode] = useState('my_device'); // 'my_device' | 'selected' | 'all'
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);

  // Send interaction state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState(null);

  // Create Alert Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    message: '',
    severity: 'WARNING',
    storm_id: 'SYSTEM-01',
    storm_name: 'Cyclone Alert',
    affected_regions: 'Odisha, West Bengal'
  });
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  // Load all telemetry
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const [devs, alrts, delivs] = await Promise.all([
        fetchRegisteredDevices(100),
        fetchVayuAlerts(50, false),
        fetchDeliveryHistory(50)
      ]);
      setDevices(devs || []);
      setAlerts(alrts || []);
      setDeliveries(delivs || []);
      
      // Auto-select first device if none selected
      if (devs && devs.length > 0 && selectedDeviceIds.length === 0) {
        setSelectedDeviceIds([devs[0].device_id]);
      }
    } catch (err) {
      console.error('Failed to load alerts & notifications data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const activeDevicesCount = devices.filter(d => d.is_active).length;
  const acceptedCount = deliveries.filter(d => d.delivery_status === 'ACCEPTED' || d.delivery_status === 'SENT').length;
  const openedCount = deliveries.filter(d => d.delivery_status === 'OPENED' || d.opened_at).length;
  const failedCount = deliveries.filter(d => d.delivery_status === 'FAILED' || d.delivery_status === 'TOKEN_INVALID').length;

  // Resolve target description for confirmation modal
  const getTargetDescription = () => {
    if (targetMode === 'all') {
      return `all ${activeDevicesCount} registered device(s)`;
    }
    if (targetMode === 'my_device') {
      const myDev = devices[0];
      return myDev ? `${myDev.device_model || 'Primary test device'} (${myDev.device_id})` : '1 registered test device';
    }
    return `${selectedDeviceIds.length} selected device(s)`;
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setSendError(null);
    if (targetMode === 'selected' && selectedDeviceIds.length === 0) {
      setSendError('Please select at least one target device from the list.');
      return;
    }
    if (devices.length === 0 && targetMode !== 'all') {
      setSendError('No registered devices available. Connect your Android device first.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleExecuteSend = async () => {
    setIsConfirmOpen(false);
    setIsSending(true);
    setSendError(null);
    setSendResult(null);

    try {
      const payload = {
        title: testTitle.trim() || 'VAYU Test Alert',
        message: testMessage.trim() || 'Notification pipeline is operational.',
        severity: testSeverity,
        target_mode: targetMode,
        target_device_ids: targetMode === 'selected' ? selectedDeviceIds : []
      };

      const res = await sendTestNotification(payload);
      setSendResult(res);
      // Reload deliveries and alerts
      await loadData(true);
    } catch (err) {
      setSendError(err.message || 'Failed to dispatch test notification.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateAlertSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingAlert(true);
    try {
      await createVayuAlert({
        title: newAlertForm.title,
        message: newAlertForm.message,
        severity: newAlertForm.severity,
        storm_id: newAlertForm.storm_id,
        storm_name: newAlertForm.storm_name,
        source: 'VAYU operator alert',
        affected_regions: newAlertForm.affected_regions.split(',').map(s => s.trim())
      });
      setIsCreateModalOpen(false);
      setNewAlertForm({
        title: '',
        message: '',
        severity: 'WARNING',
        storm_id: 'SYSTEM-01',
        storm_name: 'Cyclone Alert',
        affected_regions: 'Odisha, West Bengal'
      });
      await loadData(true);
      setActiveTab('alerts');
    } catch (err) {
      alert('Failed to create alert: ' + err.message);
    } finally {
      setIsCreatingAlert(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        categoryBadge="EARLY WARNING SYSTEM"
        categoryColor="blue"
        modelBadge="FCM HTTP v1"
        title="VAYU Alerts & Notifications"
        subtitle="Operational push notification pipeline, FCM HTTP v1 dispatch console, device registry, and client receipt telemetry."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-xs cursor-pointer transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Create Alert</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Devices</span>
            <Smartphone className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeDevicesCount}</span>
            <span className="text-xs text-slate-400">/ {devices.length} total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registered Android handsets</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">FCM Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{acceptedCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">HTTP v1</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Google FCM handshake success</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alerts Opened</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{openedCount}</span>
            <span className="text-xs text-indigo-500 font-medium">App Deep-Link</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">User tapped notification & viewed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delivery Failures</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{failedCount}</span>
            <span className="text-xs text-slate-400">Tokens pruned</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Invalid or expired tokens</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'test'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Send Test Notification</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'devices'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Device Status</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {devices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Recent Alerts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {alerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Delivery History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {deliveries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: SEND TEST NOTIFICATION */}
      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispatch Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wide">
                  🧪 Test Pipeline
                </span>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  FCM Push Dispatcher
                </h2>
              </div>
              <span className="text-xs text-slate-400">Target Channel: TEST</span>
            </div>

            <form onSubmit={handleOpenConfirm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notification Type
                  </label>
                  <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    TEST
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Channel / Severity
                  </label>
                  <select
                    value={testSeverity}
                    onChange={(e) => setTestSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  >
                    <option value="TEST">TEST (🧪 vayu_channel_test)</option>
                    <option value="WATCH">WATCH (🟡 Advisory)</option>
                    <option value="WARNING">WARNING (🟠 Evacuate Alert)</option>
                    <option value="CRITICAL">CRITICAL (🔴 Life Safety)</option>
                    <option value="INFORMATION">INFORMATION (🔵 General Bulletin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="VAYU Test Alert"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={2}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Notification pipeline is operational."
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              {/* Target Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Target Destination
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="target_mode"
                      value="my_device"
                      checked={targetMode === 'my_device'}
                      onChange={() => setTargetMode('my_device')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <div className="text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">My Test Device</span>
                      <p className="text-slate-400 text-[11px]">
                        {devices.length > 0 
                          ? `${devices[0].device_model || 'Android Device'} (${devices[0].device_id})` 
                          : 'Targets primary connected mobile handset'}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="target_mode"
                      value="selected"
                      checked={targetMode === 'selected'}
                      onChange={() => setTargetMode('selected')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <div className="text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">Selected Devices</span>
                      <p className="text-slate-400 text-[11px]">Choose specific devices from the registration pool</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="target_mode"
                      value="all"
                      checked={targetMode === 'all'}
                      onChange={() => setTargetMode('all')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <div className="text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">All Test Devices</span>
                      <p className="text-slate-400 text-[11px]">Broadcast to all {activeDevicesCount} currently registered test handsets</p>
                    </div>
                  </label>
                </div>

                {/* Sub-list if 'selected' mode is active */}
                {targetMode === 'selected' && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
                    {devices.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">No registered devices found.</p>
                    ) : (
                      devices.map(d => (
                        <label key={d.device_id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDeviceIds.includes(d.device_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDeviceIds(prev => [...prev, d.device_id]);
                              } else {
                                setSelectedDeviceIds(prev => prev.filter(id => id !== d.device_id));
                              }
                            }}
                          />
                          <span className="font-medium">{d.device_model || 'Android'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({d.device_id})</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {sendError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting to Google FCM HTTP v1...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND TEST NOTIFICATION</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Feedback & Phone Preview */}
          <div className="lg:col-span-5 space-y-4">
            {/* Post-send Feedback Card */}
            {sendResult ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✓ Notification request accepted</span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800 pt-1">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Target:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {sendResult.target_count === 1 && devices[0]
                        ? `${devices[0].device_model || 'Android Device'}`
                        : `${sendResult.target_count} device(s)`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">FCM status:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {sendResult.fcm_status || 'Accepted'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Alert ID:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {sendResult.alert_id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Deep Link:</span>
                    <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                      vayu://alert/{sendResult.alert_id}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                  Do not claim &quot;Delivered&quot; merely because FCM accepted the request. Physical delivery requires device connectivity and receipt telemetry.
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Pipeline Architecture</span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-2">
                  <p>
                    Transmits an authorized FCM HTTP v1 message through the server-side backend directly to Google&apos;s cloud gateways.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 font-mono text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                    <div>WEB DASHBOARD</div>
                    <div className="text-slate-400">  ↓ POST /api/notifications/test</div>
                    <div>FASTAPI BACKEND</div>
                    <div className="text-slate-400">  ↓ OAuth2 FCM HTTP v1</div>
                    <div>GOOGLE FCM GATEWAY</div>
                    <div className="text-slate-400">  ↓ Device Push Socket</div>
                    <div>ANDROID NOTIFICATION</div>
                    <div className="text-slate-400">  ↓ User Taps Notification</div>
                    <div className="text-emerald-600 dark:text-emerald-400">EXACT ALERT DETAIL SCREEN</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Visual Mockup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Android Notification Simulation
              </span>
              <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-md space-y-1.5 font-sans border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-500 flex items-center justify-center text-[8px] font-bold text-white">V</span>
                    <span className="font-semibold text-slate-300">VAYU Alerts</span>
                    <span>•</span>
                    <span>now</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">TEST</span>
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🧪</span>
                  <span>{testTitle || 'VAYU Test Alert'}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {testMessage || 'Notification pipeline is operational.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DEVICE STATUS */}
      {activeTab === 'devices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Registered Mobile Devices</h2>
              <p className="text-xs text-slate-400 mt-0.5">Active Android app installations receiving early warnings</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{devices.length} Handsets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-medium">
                <tr>
                  <th className="px-4 py-3">Device Model</th>
                  <th className="px-4 py-3">Device ID</th>
                  <th className="px-4 py-3">Platform / OS</th>
                  <th className="px-4 py-3">App Version</th>
                  <th className="px-4 py-3">FCM Token</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No mobile devices currently registered. Launch VAYU Alerts APK to register.
                    </td>
                  </tr>
                ) : (
                  devices.map((dev) => (
                    <tr key={dev.device_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {dev.device_model || 'Android'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {dev.device_id}
                      </td>
                      <td className="px-4 py-3">
                        {dev.platform} (API {dev.os_version || 'N/A'})
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        v{dev.app_version || '1.0.0'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        {dev.fcm_token ? `${dev.fcm_token.slice(0, 16)}...` : 'None'}
                      </td>
                      <td className="px-4 py-3">
                        {dev.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleTimeString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: RECENT ALERTS */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Active &amp; Historical Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Canonical alert records broadcast to consumer devices</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg font-medium cursor-pointer"
            >
              + New Alert
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-medium">
                <tr>
                  <th className="px-4 py-3">Alert ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Storm System</th>
                  <th className="px-4 py-3">Title &amp; Message</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No alert records in database.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alr) => (
                    <tr key={alr.alert_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
                        {alr.alert_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          alr.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          alr.severity === 'WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          alr.severity === 'WATCH' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                          alr.severity === 'TEST' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {alr.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {alr.storm_name || alr.storm_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{alr.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">{alr.message}</div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        {alr.source || 'VAYU operator alert'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {alr.created_at ? new Date(alr.created_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Push Delivery Telemetry Audit</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact verification states: PENDING, ACCEPTED, SENT, FAILED, TOKEN_INVALID, OPENED
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{deliveries.length} Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-medium">
                <tr>
                  <th className="px-4 py-3">Alert ID</th>
                  <th className="px-4 py-3">Target Device ID</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Verified Status</th>
                  <th className="px-4 py-3">FCM Message ID</th>
                  <th className="px-4 py-3">Attempted At</th>
                  <th className="px-4 py-3">Opened At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No push delivery attempts logged yet.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((del, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
                        {del.alert_id}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {del.device_id}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px]">
                        {del.channel || 'FCM'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          del.delivery_status === 'OPENED' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200' :
                          del.delivery_status === 'ACCEPTED' || del.delivery_status === 'SENT' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' :
                          del.delivery_status === 'FAILED' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200' :
                          del.delivery_status === 'TOKEN_INVALID' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {del.delivery_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        {del.fcm_message_id ? del.fcm_message_id.split('/').pop() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {del.attempted_at ? new Date(del.attempted_at).toLocaleTimeString() : 'Recent'}
                      </td>
                      <td className="px-4 py-3 text-[11px] whitespace-nowrap">
                        {del.opened_at ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {new Date(del.opened_at).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Test Notification</h3>
                <p className="text-xs text-slate-500">Authorized operator dispatch verification</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                You are about to send a test notification to <strong className="text-slate-900 dark:text-white">{getTargetDescription()}</strong>.
              </p>
              <div className="text-[11px] space-y-0.5 border-t border-slate-200 dark:border-slate-700 pt-2 font-mono">
                <div>Title: <span className="text-slate-800 dark:text-slate-200">{testTitle}</span></div>
                <div>Severity: <span className="text-amber-600">{testSeverity}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 cursor-pointer shadow-xs"
              >
                Confirm &amp; Transmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create VAYU Alert</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlertSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                  placeholder="Severe Cyclonic Storm Landfall Warning"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                  <select
                    value={newAlertForm.severity}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="WARNING">WARNING (Orange Alert)</option>
                    <option value="WATCH">WATCH (Yellow Alert)</option>
                    <option value="INFORMATION">INFORMATION</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Storm Name</label>
                  <input
                    type="text"
                    value={newAlertForm.storm_name}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, storm_name: e.target.value })}
                    placeholder="Cyclone DANA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea
                  required
                  rows={3}
                  value={newAlertForm.message}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, message: e.target.value })}
                  placeholder="High-intensity cyclonic winds expected near coastal districts within 6 hours."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affected Regions</label>
                <input
                  type="text"
                  value={newAlertForm.affected_regions}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, affected_regions: e.target.value })}
                  placeholder="Bhadrak, Kendrapara, Jagatsinghpur"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAlert}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold"
                >
                  {isCreatingAlert ? 'Saving...' : 'Broadcast Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
