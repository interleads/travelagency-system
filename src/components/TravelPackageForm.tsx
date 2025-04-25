
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plane, Calendar, Hotel, MapPin, Bed, Sun, Route, Umbrella } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";

interface TravelPackage {
  title: string;
  agency: string;
  flights: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
  };
  hotel: {
    name: string;
    location: string;
    checkin: string;
    checkout: string;
    features: string[];
  };
  tours: {
    day: string;
    description: string;
  }[];
  inclusions: string[];
}

const TravelPackageForm = () => {
  const [packageData, setPackageData] = useState<TravelPackage>({
    title: '',
    agency: '',
    flights: {
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
    },
    hotel: {
      name: '',
      location: '',
      checkin: '',
      checkout: '',
      features: [],
    },
    tours: [],
    inclusions: [],
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewRef.current) {
      generatePDF(previewRef.current);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Dados do Pacote</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-4 space-y-4">
              <div>
                <label className="block mb-2">Título do Pacote</label>
                <Input
                  value={packageData.title}
                  onChange={(e) => setPackageData({...packageData, title: e.target.value})}
                  placeholder="Ex: PACOTE DE VIAGEM - RECIFE + MARAGOGI"
                />
              </div>
              <div>
                <label className="block mb-2">Agência</label>
                <Input
                  value={packageData.agency}
                  onChange={(e) => setPackageData({...packageData, agency: e.target.value})}
                  placeholder="Nome da sua agência"
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-600" />
                Voos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Origem"
                  value={packageData.flights.departure}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    flights: {...packageData.flights, departure: e.target.value}
                  })}
                />
                <Input
                  placeholder="Destino"
                  value={packageData.flights.arrival}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    flights: {...packageData.flights, arrival: e.target.value}
                  })}
                />
                <Input
                  placeholder="Horário Ida"
                  value={packageData.flights.departureTime}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    flights: {...packageData.flights, departureTime: e.target.value}
                  })}
                />
                <Input
                  placeholder="Horário Volta"
                  value={packageData.flights.arrivalTime}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    flights: {...packageData.flights, arrivalTime: e.target.value}
                  })}
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Hotel className="w-5 h-5 text-sky-600" />
                Hotel
              </h3>
              <Input
                placeholder="Nome do Hotel"
                value={packageData.hotel.name}
                onChange={(e) => setPackageData({
                  ...packageData,
                  hotel: {...packageData.hotel, name: e.target.value}
                })}
              />
              <Input
                placeholder="Localização"
                value={packageData.hotel.location}
                onChange={(e) => setPackageData({
                  ...packageData,
                  hotel: {...packageData.hotel, location: e.target.value}
                })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Check-in"
                  value={packageData.hotel.checkin}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    hotel: {...packageData.hotel, checkin: e.target.value}
                  })}
                />
                <Input
                  placeholder="Check-out"
                  value={packageData.hotel.checkout}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    hotel: {...packageData.hotel, checkout: e.target.value}
                  })}
                />
              </div>
              <Textarea
                placeholder="Comodidades do Hotel (uma por linha)"
                value={packageData.hotel.features.join('\n')}
                onChange={(e) => setPackageData({
                  ...packageData,
                  hotel: {...packageData.hotel, features: e.target.value.split('\n')}
                })}
              />
            </Card>

            <Button type="submit" className="w-full">Gerar PDF</Button>
          </form>
        </div>

        {/* Preview */}
        <div ref={previewRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1482938289607-e9573fc25ebb"
              alt="Destino" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{packageData.title || "Título do Pacote"}</h1>
              <p className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Organizado por: {packageData.agency || "Nome da Agência"}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                <Plane className="w-5 h-5" />
                Detalhes do Voo
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <p className="font-medium text-sky-900">Ida:</p>
                  <p className="text-sky-800">{packageData.flights.departure} → {packageData.flights.arrival}</p>
                  <p className="text-sky-600">{packageData.flights.departureTime}</p>
                </div>
                <div className="bg-sky-50 p-4 rounded-lg">
                  <p className="font-medium text-sky-900">Volta:</p>
                  <p className="text-sky-800">{packageData.flights.arrival} → {packageData.flights.departure}</p>
                  <p className="text-sky-600">{packageData.flights.arrivalTime}</p>
                </div>
              </div>
            </section>

            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                <Hotel className="w-5 h-5" />
                Hospedagem
              </h2>
              <div className="space-y-4">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <p className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span className="font-medium text-sky-900">{packageData.hotel.name || "Nome do Hotel"}</span>
                  </p>
                  <p className="text-sky-800 ml-6">{packageData.hotel.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Check-in: {packageData.hotel.checkin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Check-out: {packageData.hotel.checkout}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sky-900 mb-3">Comodidades:</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {packageData.hotel.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sky-800">
                        <Bed className="w-4 h-4 text-sky-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPackageForm;
