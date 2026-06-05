import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastContainer } from '@/components/ToastContainer';

// Import All Page Modules
import { LandingPage } from '@/pages/LandingPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminRooms } from '@/pages/admin/AdminRooms';
import { AdminRoomTypes } from '@/pages/admin/AdminRoomTypes';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminPayments } from '@/pages/admin/AdminPayments';
import { AdminEmployees } from '@/pages/admin/AdminEmployees';
import { AdminServices } from '@/pages/admin/AdminServices';

import { CustomerLogin } from '@/pages/customer/CustomerLogin';
import { CustomerRegister } from '@/pages/customer/CustomerRegister';
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { CustomerRooms } from '@/pages/customer/CustomerRooms';
import { VirtualTour } from '@/pages/customer/VirtualTour';
import { CustomerBookings } from '@/pages/customer/CustomerBookings';
import { CustomerPayment } from '@/pages/customer/CustomerPayment';
import { CustomerServices } from '@/pages/customer/CustomerServices';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';

// Sidebars
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CustomerSidebar } from '@/components/customer/CustomerSidebar';

export default function App() {
  const [route, setRoute] = useState<string>('/');

  // Robust Client-Side Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      // e.g. #/admin/dashboard -> /admin/dashboard
      const hash = window.location.hash.substring(1) || '/';
      setRoute(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger on boot
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setRoute(path);
  };

  // Select layout segment based on route prefix
  const isAdminPortal = route.startsWith('/admin') && route !== '/admin/login';
  const isCustomerPortal = route.startsWith('/customer') && route !== '/customer/login' && route !== '/customer/register';

  const renderActivePage = () => {
    switch (route) {
      case '/':
        return <LandingPage onRouteChange={navigateTo} />;
      
      // Admin Access Segment
      case '/admin/login':
        return <AdminLogin onRouteChange={navigateTo} />;
      case '/admin/dashboard':
        return <AdminDashboard />;
      case '/admin/rooms':
        return <AdminRooms />;
      case '/admin/room-types':
        return <AdminRoomTypes />;
      case '/admin/bookings':
        return <AdminBookings />;
      case '/admin/payments':
        return <AdminPayments />;
      case '/admin/employees':
        return <AdminEmployees />;
      case '/admin/services':
        return <AdminServices />;

      // Resident Access Segment
      case '/customer/login':
        return <CustomerLogin onRouteChange={navigateTo} />;
      case '/customer/register':
        return <CustomerRegister onRouteChange={navigateTo} />;
      case '/customer/dashboard':
        return <CustomerDashboard onRouteChange={navigateTo} />;
      case '/customer/rooms':
        return <CustomerRooms onRouteChange={navigateTo} />;
      case '/customer/tour':
        return <VirtualTour onRouteChange={navigateTo} />;
      case '/customer/bookings':
        return <CustomerBookings onRouteChange={navigateTo} />;
      case '/customer/payment':
        return <CustomerPayment onRouteChange={navigateTo} />;
      case '/customer/services':
        return <CustomerServices />;
      case '/customer/profile':
        return <CustomerProfile />;

      // Fallback redirect
      default:
        return <LandingPage onRouteChange={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans antialiased text-white relative">
      {/* Toast stacks overlay */}
      <ToastContainer />

      {/* Sidebars layouts offsets */}
      {isAdminPortal && (
        <AdminSidebar currentRoute={route} onRouteChange={navigateTo} />
      )}
      
      {isCustomerPortal && (
        <CustomerSidebar currentRoute={route} onRouteChange={navigateTo} />
      )}

      {/* Main Content Render frame with sliding transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full flex-1 min-h-screen flex"
        >
          {renderActivePage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
