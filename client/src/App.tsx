import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowseItemsPage } from './pages/BrowseItemsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { EditItemPage } from './pages/EditItemPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyItemsPage } from './pages/MyItemsPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { IncomingRequestsPage } from './pages/IncomingRequestsPage';
import { BorrowingHistoryPage } from './pages/BorrowingHistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/items/new"
              element={
                <ProtectedRoute>
                  <CreateItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/:id/edit"
              element={
                <ProtectedRoute>
                  <EditItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-items"
              element={
                <ProtectedRoute>
                  <MyItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute>
                  <MyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incoming-requests"
              element={
                <ProtectedRoute>
                  <IncomingRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <BorrowingHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
