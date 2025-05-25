
import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffAuthProvider } from '@/hooks/useStaffAuth';

const StaffLayout: React.FC = () => {
  return (
    <StaffAuthProvider>
      <Outlet />
    </StaffAuthProvider>
  );
};

export default StaffLayout;
