
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/login');
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 py-8">
      <div className="container mx-auto px-4 text-center">
        <p>Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
