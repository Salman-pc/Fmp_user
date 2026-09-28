import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { UserLogin } from '../pages/auth/Login';
import { UserRegister } from '../pages/auth/Register';

import { UserLayout } from '../layouts/UserLayout';
import { UserDashboard } from '../pages/UserDashboard';
import { AttendanceHistory } from '../pages/AttendanceHistory';
import { Profile } from '../pages/Profile';
import { GamesHub } from '../pages/GamesHub';

import { useAuth } from '../hooks/useAuth';

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/auth/login" replace />
          ) : (
            <Navigate to="/user/dashboard" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<UserLogin />} />
        <Route path="register" element={<UserRegister />} />
      </Route>

      {/* User Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="games" element={<GamesHub />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
