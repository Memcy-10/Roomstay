import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import ResetPassword from './pages/ResetPassword';
import RoomsList from './pages/RoomsList';
import RoomDetail from './pages/RoomDetail';
import HostRooms from './pages/HostRooms';
import CreateRoom from './pages/CreateRoom';
import Admin from './pages/Admin';
import WhatsAppButton from './components/common/WhatsAppButton';
import ChatbotWidget from './components/common/ChatbotWidget.jsx';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import HostLayout from './components/layout/HostLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRooms from './pages/admin/Rooms';
import AdminReservations from './pages/admin/Reservations';
import AdminSales from './pages/admin/Sales.jsx';
import AdminInvoices from './pages/admin/Invoices.jsx';
import AdminPQR from './pages/admin/PQR.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import UserProfileInfo from './pages/user/ProfileInfo';
import UserSecurity from './pages/user/Security';
import UserBookings from './pages/user/Bookings';
import UserInvoices from './pages/user/Invoices.jsx';
import UserPQR from './pages/user/PQR.jsx';
import HostDashboard from './pages/host/Dashboard';
import HostReservationsReceived from './pages/host/ReservationsReceived';
import HostSales from './pages/host/Sales.jsx';
import HostInvoices from './pages/host/Invoices.jsx';
import HostPQR from './pages/host/PQR.jsx';
import UserDashboard from './pages/user/Dashboard';
import RoleRoute from './components/auth/RoleRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <div className="min-h-screen">
              <Login />
            </div>
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="rooms/new" element={<CreateRoom />} />
          <Route path="rooms/edit/:id" element={<CreateRoom />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="pqr" element={<AdminPQR />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
        <Route path="/user" element={<Navigate to="/user/profile" replace />} />
        <Route path="/user/*" element={<RoleRoute allowedRoles={['user']}><UserLayout /></RoleRoute>}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfileInfo />} />
          <Route path="security" element={<UserSecurity />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="invoices" element={<UserInvoices />} />
          <Route path="pqr" element={<UserPQR />} />
        </Route>
        <Route path="/host" element={<Navigate to="/host/dashboard" replace />} />
        <Route path="/host/*" element={<RoleRoute allowedRoles={['host']}><HostLayout /></RoleRoute>}>
          <Route path="dashboard" element={<HostDashboard />} />
          <Route path="profile" element={<UserProfileInfo />} />
          <Route path="security" element={<UserSecurity />} />
          <Route path="rooms" element={<HostRooms />} />
          <Route path="rooms/new" element={<CreateRoom />} />
          <Route path="rooms/create" element={<Navigate to="/host/rooms/new" replace />} />
          <Route path="rooms/edit/:id" element={<CreateRoom />} />
          <Route path="reservations" element={<HostReservationsReceived />} />
          <Route path="sales" element={<HostSales />} />
          <Route path="invoices" element={<HostInvoices />} />
          <Route path="pqr" element={<HostPQR />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/rooms" element={<RoomsList />} />
                  <Route path="/rooms/:id" element={<RoomDetail />} />
                  <Route path="/host/rooms" element={<HostRooms />} />
                  <Route path="/host/rooms/new" element={<CreateRoom />} />
                  <Route path="/host/rooms/create" element={<Navigate to="/host/rooms/new" replace />} />
                  <Route path="/host/rooms/edit/:id" element={<CreateRoom />} />
                  <Route path="/my-bookings" element={<Navigate to="/user/bookings" replace />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
            </div>
          }
        />
      </Routes>
      <ChatbotWidget />
    </Router>
  );
}

export default App;
