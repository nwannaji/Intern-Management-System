import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { attendanceAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/formatters';

const QRKiosk = () => {
  const [activeQR, setActiveQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanCount, setScanCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch or generate QR code on mount
  const initQR = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get existing active QR first
      const res = await attendanceAPI.getActiveQR();
      if (res.data && res.data.token) {
        setActiveQR(res.data);
        setScanCount(res.data.scan_count || 0);
      } else {
        // No active QR — generate one
        const genRes = await attendanceAPI.generateQR('AM');
        setActiveQR(genRes.data);
        setScanCount(0);
      }
    } catch (error) {
      // Try generating if fetch failed
      try {
        const genRes = await attendanceAPI.generateQR('AM');
        setActiveQR(genRes.data);
        setScanCount(0);
      } catch (err) {
        console.error('Failed to generate QR code');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initQR(); }, [initQR]);

  // Poll for scan count updates every 10 seconds
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await attendanceAPI.getActiveQR();
        if (res.data && res.data.token) {
          setScanCount(res.data.scan_count || 0);
          if (res.data.scan_count > (activeQR?.scan_count || 0)) {
            setRecentScans(prev => [
              { time: new Date(), count: res.data.scan_count },
              ...prev.slice(0, 4)
            ]);
          }
          setActiveQR(res.data);
        }
      } catch (error) { /* silent */ }
    }, 10000);
    return () => clearInterval(poll);
  }, [activeQR?.scan_count]);

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const qrScanUrl = activeQR
    ? `${baseUrl}/attendance/scan/${activeQR.token}`
    : '';

  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const periodEmoji = currentHour < 12 ? '☀️' : '🌙';
  const periodLabel = currentHour < 12 ? 'Morning Check-In' : 'Afternoon Check-Out';
  const checkInTime = '8:30 AM';
  const checkOutTime = '5:00 PM';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="py-6 px-8 text-center">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-xl text-blue-200 mt-1">{periodEmoji} {periodLabel}</p>
        <p className="text-5xl font-mono font-bold mt-4">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-lg text-blue-300 mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* QR Code */}
      <div className="flex-1 flex items-center justify-center">
        {activeQR ? (
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl inline-block">
              <QRCodeSVG
                value={qrScanUrl}
                size={320}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1e293b"
              />
            </div>
            <p className="text-2xl font-semibold mt-6">Scan to Check In / Check Out</p>
            <p className="text-blue-300 mt-2">
              Check-in time: <span className="font-bold text-white">{checkInTime}</span> &nbsp;|&nbsp;
              Check-out time: <span className="font-bold text-white">{checkOutTime}</span>
            </p>

            {/* Scan counter */}
            <div className="mt-6 inline-flex items-center gap-4 bg-white/10 rounded-xl px-6 py-3">
              <div className="text-center">
                <p className="text-3xl font-bold">{scanCount}</p>
                <p className="text-sm text-blue-300">Scans Today</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-sm text-blue-200">Valid for</p>
                <p className="text-sm font-medium">{formatDate(activeQR.valid_date)}</p>
              </div>
            </div>

            {/* Recent scans */}
            {recentScans.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-blue-300">Recent scans:</p>
                <div className="flex gap-2 justify-center mt-1">
                  {recentScans.map((scan, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-300">
                      ✓ Scan #{scan.count} — {scan.time.toLocaleTimeString()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-white/5 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-200">
                📱 Open your phone camera and point it at the QR code above.<br />
                <strong>1st scan</strong> = Check In (8:30 AM) &nbsp;|&nbsp; <strong>2nd scan</strong> = Check Out (5:00 PM)
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl text-yellow-400">No active QR code</p>
            <p className="text-blue-300 mt-2">Generate one from the Attendance page</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-blue-400 text-sm">
        <p>Intern Management System • Attendance Kiosk</p>
      </div>
    </div>
  );
};

export default QRKiosk;