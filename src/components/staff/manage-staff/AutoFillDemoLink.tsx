
import React from 'react';

const AutoFillDemoLink: React.FC = () => {
  const handleAutoFill = (e: React.MouseEvent) => {
    e.preventDefault();
    const emailInput = document.querySelector('input[placeholder="staff@radiofm.com"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.value = `demo-staff-${Math.floor(Math.random() * 1000)}@radiofm.com`;
      emailInput.focus();
    }
  };

  return (
    <a 
      href="#" 
      className="text-blue-500 hover:underline ml-2" 
      onClick={handleAutoFill}
    >
      Demo: Auto-fill with random email
    </a>
  );
};

export default AutoFillDemoLink;
