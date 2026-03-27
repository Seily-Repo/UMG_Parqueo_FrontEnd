import { Outlet } from 'react-router';
import { RegistrationProvider } from './context/RegistrationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ParkingModuleLayout() {
  return (
    <RegistrationProvider>
      <Outlet />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </RegistrationProvider>
  );
}

export default ParkingModuleLayout;
