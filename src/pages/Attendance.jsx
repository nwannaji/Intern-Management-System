import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { attendanceAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { token: urlToken } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  // QR code state (admin)
  const [activeQR, setActiveQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // QR scan state (intern)
  const [scanning, setScanning] = useState(false);
  const scanInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const [recordsRes, summaryRes, statusRes] = await Promise.all([
        attendanceAPI.getRecords(),
        attendanceAPI.getWeeklySummary(),
        attendanceAPI.getTodayStatus(),
      ]);
      setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : recordsRes.data?.results || []);
      setSummary(summaryRes.data);
      setTodayStatus(statusRes.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveQR = async () => {
    if (!isAdminOrSupervisor) return;
    try {
      const res = await attendanceAPI.getActiveQR();
      if (res.data && res.data.token) {
        setActiveQR(res.data);
        setShowQRCode(true);
      } else {
        setActiveQR(null);
      }
    } catch (error) { /* no active QR is fine */ }
  };

  useEffect(() => {
    fetchData();
    if (isAdminOrSupervisor) fetchActiveQR();
  }, []);

  // Auto-scan from URL token
  useEffect(() => {
    const token = urlToken || searchParams.get('token');
    if (token) {
      handleQRScan(token);
    }
  }, [urlToken, searchParams]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check out');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleGenerateQR = async (period = 'AM') => {
    setQrLoading(true);
    try {
      const res = await attendanceAPI.generateQR(period);
      setActiveQR(res.data);
      setShowQRCode(true);
      toast.success(`${period} QR code generated!`);
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDeactivateQR = async () => {
    try {
      await attendanceAPI.deactivateQR();
      setActiveQR(null);
      setShowQRCode(false);
      toast.success('QR code deactivated');
    } catch (error) {
      toast.error('Failed to deactivate QR code');
    }
  };

  const handleQRScan = async (token) => {
    setScanning(true);
    try {
      const res = await attendanceAPI.qrScan(token);
      const action = res.data.action;
      const period = res.data.period;
      if (action === 'checked_in') {
        toast.success(`Checked in (${period}) successfully!`);
      } else if (action === 'checked_out') {
        toast.success(`Checked out (${period}) successfully!`);
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid or expired QR code');
    } finally {
      setScanning(false);
    }
  };

  const handleManualTokenSubmit = () => {
    const token = scanInputRef.current?.value?.trim();
    if (!token) {
      toast.error('Please enter a QR code token');
      return;
    }
    handleQRScan(token);
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  // Determine current period
  const currentHour = new Date().getHours();
  const currentPeriod = currentHour < 12 ? 'AM' : 'PM';

  // Build QR scan URL
  // Build QR scan URL using the current hostname (not localhost) so phones on the same network can reach it
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const qrScanUrl = activeQR
    ? `${baseUrl}/attendance/scan/${activeQR.token}`
    : '';

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>

        {/* Today's Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Today's Status</h3>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {currentPeriod === 'AM' ? '☀️ Morning' : '🌙 Afternoon'}
            </span>
          </div>

          {todayStatus && todayStatus.checked_in ? (
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Check In</p>
                    <p className="text-xl font-bold text-green-700">
                      {todayStatus.check_in ? formatTime(todayStatus.check_in) : '8:30 AM'}
                    </p>
                    <p className="text-xs text-green-500">Scheduled: 8:30 AM</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Check Out</p>
                    <p className="text-xl font-bold text-blue-700">
                      {todayStatus.check_out ? formatTime(todayStatus.check_out) : '—'}
                    </p>
                    <p className="text-xs text-blue-500">Scheduled: 5:00 PM</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <StatusBadge status={todayStatus.status || 'present'} />
                </div>
              </div>
              {!todayStatus.checked_out && (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                >
                  {checkingIn ? 'Processing...' : 'Check Out'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
              >
                {checkingIn ? 'Processing...' : 'Check In'}
              </button>
            </div>
          )}
        </div>

      {/* QR Code Section */}
      {isAdminOrSupervisor ? (
        /* ── Admin/Supervisor: Generate & Display QR ── */
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Attendance</h3>
          <p className="text-sm text-gray-500 mb-4">
            Generate a QR code and display it at the office entrance. Interns scan it to automatically check in (AM) or check out (PM).
          </p>

          <Link to="/qr-kiosk" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Open Full-Screen Kiosk Display
          </Link>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => handleGenerateQR('AM')}
              disabled={qrLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition font-medium text-sm"
            >
              ☀️ Generate AM Code
            </button>
            <button
              onClick={() => handleGenerateQR('PM')}
              disabled={qrLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium text-sm"
            >
              🌙 Generate PM Code
            </button>
            {activeQR && (
              <button
                onClick={handleDeactivateQR}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
              >
                Deactivate
              </button>
            )}
          </div>

          {showQRCode && activeQR && (
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="inline-block p-4 bg-white rounded-xl shadow-md">
                <QRCodeSVG
                  value={qrScanUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Valid for: {formatDate(activeQR.valid_date)}
              </p>
              <p className="text-xs text-gray-400">
                Scanned {activeQR.scan_count} time{activeQR.scan_count !== 1 ? 's' : ''} today
              </p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Or share this link:</p>
                <p className="text-sm font-mono text-blue-600 break-all select-all">{qrScanUrl}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Intern: Scan QR ── */
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h3>
          <p className="text-sm text-gray-500 mb-4">
            Scan the QR code displayed at the office entrance to check in (<strong>AM</strong>) or check out (<strong>PM</strong>) automatically.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Current period:</strong> {currentPeriod === 'AM' ? '☀️ Morning (Check-in)' : '🌙 Afternoon (Check-out)'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {currentPeriod === 'AM'
                ? 'Scanning before 12:00 PM will record your check-in time.'
                : 'Scanning after 12:00 PM will record your check-out time (if already checked in).'}
            </p>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter QR code token
              </label>
              <input
                ref={scanInputRef}
                type="text"
                placeholder="Paste the token from the QR code URL"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleManualTokenSubmit()}
              />
            </div>
            <button
              onClick={handleManualTokenSubmit}
              disabled={scanning}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {scanning ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {summary && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{summary.total_days}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{summary.present_days}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{summary.absent_days}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Late</p>
              <p className="text-2xl font-bold text-yellow-700">{summary.late_days}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Rate</p>
              <p className="text-2xl font-bold text-blue-700">{summary.attendance_rate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No attendance records found</div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                  <p className="text-sm text-gray-500">
                    {record.check_in ? `In: ${record.check_in}` : '—'}
                    {record.check_out ? ` / Out: ${record.check_out}` : ''}
                  </p>
                </div>
                <StatusBadge status={record.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Attendance;