import React, { useState, useEffect, useCallback } from 'react';
import { meetingApi } from '../api/meeting.api';
import { checkInApi } from '../api/checkin.api';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationRadiusMap } from '../components/location/LocationRadiusMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Repeat
} from 'lucide-react';

export const format12Hour = (time24Str) => {
  if (!time24Str) return '';
  const [hStr, mStr] = time24Str.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24Str;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
};

export const UserDashboard = () => {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  const { location, loading: gpsLoading, error: gpsError, requestPosition } = useGeolocation();

  const fetchCurrentMeeting = useCallback(async () => {
    try {
      setLoadingMeeting(true);
      const res = await meetingApi.getCurrentActive();
      if (res.success && res.data?.meeting) {
        setMeeting(res.data.meeting);
        fetchCheckInStatus(res.data.meeting._id);
      } else {
        setMeeting(null);
      }
    } catch (err) {
      console.error('Error fetching meeting:', err);
    } finally {
      setLoadingMeeting(false);
    }
  }, []);

  const fetchCheckInStatus = async (meetingId) => {
    try {
      const res = await checkInApi.getStatus(meetingId);
      if (res.success) {
        setCheckInStatus(res.data);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  useEffect(() => {
    fetchCurrentMeeting();
  }, [fetchCurrentMeeting]);

  useEffect(() => {
    requestPosition();
  }, []);

  const calculateDistanceEstimate = () => {
    if (!meeting || !location.latitude || !location.longitude) return null;
    const [targetLon, targetLat] = meeting.location.coordinates;
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(targetLat - location.latitude);
    const dLon = toRad(targetLon - location.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(location.latitude)) * Math.cos(toRad(targetLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const estimatedDistance = calculateDistanceEstimate();
  const isInsideArea =
    estimatedDistance !== null && meeting ? estimatedDistance <= meeting.radius : false;

  const handleCheckInSubmit = async () => {
    if (!location.latitude || !location.longitude || !meeting) return;

    try {
      setSubmitLoading(true);
      setResultMessage(null);

      const res = await checkInApi.submitCheckIn({
        meetingId: meeting._id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || 10
      });

      setResultMessage({
        type: 'success',
        text: res.message || 'Present marked successfully!'
      });

      fetchCheckInStatus(meeting._id);
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Check-in rejected by verification server.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetCheckIn = async () => {
    if (!meeting) return;
    try {
      setSubmitLoading(true);
      await checkInApi.resetCheckIn(meeting._id);
      setResultMessage({
        type: 'success',
        text: 'Check-in status reset! You can now test marking PRESENT again.'
      });
      fetchCheckInStatus(meeting._id);
    } catch (err) {
      alert(err.message || 'Failed to reset check-in status');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingMeeting) {
    return <LoadingSpinner size="lg" label="Loading active meeting parameters..." />;
  }

  if (!meeting) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">No Active Meeting Today</h2>
        <p className="text-sm text-slate-400">
          There are no active friend group meetups configured for check-in right now. Please check back later.
        </p>
      </div>
    );
  }

  const [targetLon, targetLat] = meeting.location.coordinates;
  const alreadyCheckedIn = checkInStatus?.hasCheckedIn;

  const scheduleText =
    meeting.scheduleType === 'EVERYDAY'
      ? 'Everyday'
      : meeting.scheduleType === 'WEEKLY'
      ? `Weekly (${(meeting.recurringDays || []).map((d) => DAY_NAMES[d]).join(', ')})`
      : `Date: ${meeting.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              <span>Current Group Meetup</span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>{meeting.title}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">{meeting.description || 'Friend group gathering'}</p>
          </div>

          <div className="flex flex-col items-end space-y-1.5">
            {alreadyCheckedIn ? (
              <StatusBadge status="PRESENT" text="PRESENT MARKED" />
            ) : (
              <StatusBadge status="ACTIVE" text="CHECK-IN OPEN" />
            )}
            <span className="text-[11px] text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Repeat className="w-3 h-3" />
              <span>{scheduleText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Checkin Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Location Map */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Google Maps Verification View</span>
            </h3>
            <button
              onClick={requestPosition}
              disabled={gpsLoading}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh GPS</span>
            </button>
          </div>

          <LocationRadiusMap
            meetingLat={targetLat}
            meetingLon={targetLon}
            radius={meeting.radius}
            userLat={location.latitude}
            userLon={location.longitude}
            userAccuracy={location.accuracy}
            locationName={meeting.locationName}
          />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Target: <strong className="text-slate-200">{meeting.locationName}</strong></span>
            <span>Allowed Radius: <strong className="text-cyan-400">{meeting.radius} meters</strong></span>
          </div>
        </div>

        {/* Right column: Presence Verification Panel */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Presence Check</span>
            </h3>

            {/* GPS Error Alert */}
            {gpsError && (
              <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{gpsError.code}</div>
                  <div>{gpsError.message}</div>
                </div>
              </div>
            )}

            {/* Results Alert */}
            {resultMessage && (
              <div
                className={`p-3 mb-4 rounded-xl border text-xs flex items-center space-x-2 ${
                  resultMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {resultMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{resultMessage.text}</span>
              </div>
            )}

            {/* Metrics List */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Check-In Window</span>
                </span>
                <span className="font-semibold text-slate-200">
                  {meeting.isTimeWindowOptional
                    ? 'Open Anytime Today'
                    : `${format12Hour(meeting.startTime)} – ${format12Hour(meeting.endTime)} (${meeting.timezone})`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Calculated Distance:</span>
                <span
                  className={`font-semibold ${
                    estimatedDistance !== null
                      ? isInsideArea
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                      : 'text-slate-500'
                  }`}
                >
                  {estimatedDistance !== null ? `${estimatedDistance}m` : 'Acquiring GPS...'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">GPS Signal Accuracy:</span>
                <span className="font-semibold text-slate-300">
                  {location.accuracy ? `~${Math.round(location.accuracy)}m` : 'Waiting for fix...'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Verification Status:</span>
                {estimatedDistance === null ? (
                  <span className="text-slate-400 font-medium">Acquiring Location</span>
                ) : isInsideArea ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Inside Allowed Area</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">Outside Allowed Area</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Check-In Button */}
          <div>
            {alreadyCheckedIn ? (
              <div className="space-y-2">
                <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-center text-sm flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>You are Marked PRESENT</span>
                </div>
              </div>
            ) : gpsLoading ? (
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm border border-slate-700 flex items-center justify-center space-x-2 cursor-wait"
              >
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                <span>Acquiring Device GPS...</span>
              </button>
            ) : !location.latitude ? (
              <button
                onClick={requestPosition}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-center space-x-2 hover:bg-amber-500/30 transition"
              >
                <Navigation className="w-5 h-5" />
                <span>📍 Request GPS Location Access</span>
              </button>
            ) : (
              <button
                onClick={handleCheckInSubmit}
                disabled={!isInsideArea || submitLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {submitLoading ? (
                  <span>Verifying Location & Server Rules...</span>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>MARK PRESENT</span>
                  </>
                )}
              </button>
            )}

            {!isInsideArea && estimatedDistance !== null && !alreadyCheckedIn && !gpsLoading && (
              <p className="text-[11px] text-amber-400/90 text-center mt-2 font-medium">
                ⚠️ You are {estimatedDistance}m away from {meeting.locationName}. Move within {meeting.radius}m to check in.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
