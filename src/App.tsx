import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { RequireAuth } from '@/components/auth/require-auth'
import { AppShell } from '@/components/layout/app-shell'
import AdminsPage from '@/features/admins/admins-page'
import LoginPage from '@/features/auth/login-page'
import DashboardPage from '@/features/dashboard/dashboard-page'
import OfficeDetailsPage from '@/features/offices/office-details-page'
import OfficesPage from '@/features/offices/offices-page'
import AdminQrPage from '@/features/qr/admin-qr-page'
import ScanPage from '@/features/qr/scan-page'
import UsersPage from '@/features/users/users-page'

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="offices" element={<OfficesPage />} />
            <Route path="offices/:id" element={<OfficeDetailsPage />} />
            <Route path="qr" element={<AdminQrPage />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="admins" element={<AdminsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
