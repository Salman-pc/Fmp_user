import React, { useState, useEffect, useCallback } from 'react';
import { checkInApi } from '../api/checkin.api';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { History, MapPin } from 'lucide-react';

export const AttendanceHistory = () => {
  const [data, setData] = useState({ checkIns: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await checkInApi.getMyCheckIns({ page, limit: 10 });
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <span>My Check-In History</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Complete log of your verified check-ins and location verification attempts.
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        {loading ? (
          <LoadingSpinner label="Loading attendance history..." />
        ) : data.checkIns.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No check-in records found. Participate in group meetings to view your presence history!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Meeting</th>
                  <th className="py-3 px-4">Checked-In At</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">GPS Accuracy</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.checkIns.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">
                        {item.meeting?.title || 'Group Meetup'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{item.meeting?.locationName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.checkedInAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                      {item.distance}m
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      ~{Math.round(item.accuracy)}m
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} text={item.rejectionReason || item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={data.page}
          pages={data.pages}
          total={data.total}
          onPageChange={(p) => fetchHistory(p)}
        />
      </div>
    </div>
  );
};
