import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ThreeBackground from './components/ThreeBackground';

import PGList from './pages/pgs/PGList';
import AddPG from './pages/pgs/AddPG';
import PGDetail from './pages/pgs/PGDetail';
import EditPG from './pages/pgs/EditPG';

import AddRoom from './pages/rooms/AddRoom';
import RoomDetail from './pages/rooms/RoomDetail';
import EditRoom from './pages/rooms/EditRoom';
import PastMembers from './pages/rooms/PastMembers';

import AddTenant from './pages/tenants/AddTenant';
import TenantDetail from './pages/tenants/TenantDetail';
import EditTenant from './pages/tenants/EditTenant';
import TenantPaymentHistory from './pages/tenants/TenantPaymentHistory';
import TenantsGlobal from './pages/tenants/Tenants';

import Payments from './pages/payments/Payments';
import RoomsGlobal from './pages/rooms/Rooms';
import Expenses from './pages/expenses/Expenses';
import PendingRent from './pages/payments/PendingRent';
import EmptyRooms from './pages/rooms/EmptyRooms';
import Earnings from './pages/earnings/Earnings';

const App = () => {
  return (
    <BrowserRouter>
      {/* Global 3D Background */}
      <ThreeBackground />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes inside Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          
          {/* PG Routes */}
          <Route path="pgs" element={<PGList />} />
          <Route path="pgs/add" element={<AddPG />} />
          <Route path="pgs/:id" element={<PGDetail />} />
          <Route path="pgs/:id/edit" element={<EditPG />} />
          
          {/* Room Routes */}
          <Route path="rooms" element={<RoomsGlobal />} />
          <Route path="rooms/empty" element={<EmptyRooms />} />
          <Route path="pgs/:id/rooms/add" element={<AddRoom />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="rooms/:id/edit" element={<EditRoom />} />
          <Route path="rooms/:id/past-members" element={<PastMembers />} />
          
          {/* Tenant Routes */}
          <Route path="rooms/:id/tenants/add" element={<AddTenant />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="tenants/:id/edit" element={<EditTenant />} />
          <Route path="tenants/:id/payments" element={<TenantPaymentHistory />} />
          <Route path="tenants" element={<TenantsGlobal />} />
          
          {/* Payment/Finance Routes */}
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="pending-rent" element={<PendingRent />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
