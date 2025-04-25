
import TravelPackageForm from "@/components/TravelPackageForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-sky-900">
          Gerador de Pacotes de Viagem
        </h1>
        <TravelPackageForm />
      </div>
    </div>
  );
};

export default Index;
