
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CRM = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to vendas page with CRM tab
    navigate('/vendas');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Redirecionando para Vendas...</h2>
        <p className="text-muted-foreground">O CRM agora está integrado no módulo de Vendas.</p>
      </div>
    </div>
  );
};

export default CRM;
