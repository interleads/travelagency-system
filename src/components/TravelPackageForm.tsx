import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plane, Calendar, Hotel, MapPin, Bed, Sun, Route, Umbrella, Utensils, CarFront, Wifi } from "lucide-react";

interface TravelPackage {
  title: string;
  agency: string;
  headerImage: string;
  flights: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    airline: string;
    airlineIcon: string;
    flightDetails: string;
  };
  hotel: {
    name: string;
    location: string;
    checkin: string;
    checkout: string;
    features: Array<{
      icon: string;
      text: string;
    }>;
    images: string[];
  };
  tours: Array<{
    title: string;
    description: string;
    date: string;
    images: string[];
  }>;
  inclusions: string[];
}

const defaultFeatureIcons = [
  { icon: "wifi", text: "Wi-Fi" },
  { icon: "utensils", text: "Restaurante" },
  { icon: "car", text: "Estacionamento" },
  { icon: "umbrella", text: "Piscina" },
];

const TravelPackageForm = () => {
  const [packageData, setPackageData] = useState<TravelPackage>({
    title: '',
    agency: '',
    headerImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
    flights: {
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
      airline: '',
      airlineIcon: '',
      flightDetails: ''
    },
    hotel: {
      name: '',
      location: '',
      checkin: '',
      checkout: '',
      features: defaultFeatureIcons,
      images: []
    },
    tours: [],
    inclusions: []
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleAddTour = () => {
    setPackageData({
      ...packageData,
      tours: [...packageData.tours, {
        title: '',
        description: '',
        date: '',
        images: []
      }]
    });
  };

  const handleTourChange = (index: number, field: keyof TravelPackage['tours'][0], value: string) => {
    const newTours = [...packageData.tours];
    newTours[index] = { ...newTours[index], [field]: value };
    setPackageData({ ...packageData, tours: newTours });
  };

  const handleAddHotelImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPackageData({
          ...packageData,
          hotel: {
            ...packageData.hotel,
            images: [...packageData.hotel.images, reader.result as string]
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just prevent default form submission
    // PDF generation removed
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div className="space-y-4">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Input
                    placeholder="Companhia Aérea"
                    value={packageData.flights.airline}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      flights: {...packageData.flights, airline: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="URL do ícone da companhia aérea"
                    value={packageData.flights.airlineIcon}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      flights: {...packageData.flights, airlineIcon: e.target.value}
                    })}
                  />
                  <Textarea
                    placeholder="Detalhes do voo (classe, bagagem, etc)"
                    value={packageData.flights.flightDetails}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      flights: {...packageData.flights, flightDetails: e.target.value}
                    })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Hotel className="w-5 h-5 text-sky-600" />
                Hotel
              </h3>
              <div className="space-y-4">
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
                    type="date"
                    value={packageData.hotel.checkin}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      hotel: {...packageData.hotel, checkin: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Check-out"
                    type="date"
                    value={packageData.hotel.checkout}
                    onChange={(e) => setPackageData({
                      ...packageData,
                      hotel: {...packageData.hotel, checkout: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fotos do Hotel</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAddHotelImage}
                    className="mb-2"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {packageData.hotel.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Hotel ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comodidades</label>
                  {packageData.hotel.features.map((feature, index) => {
                    const iconMapping = {
                      wifi: Wifi,
                      utensils: Utensils,
                      car: CarFront,
                      umbrella: Umbrella
                    };
                    
                    const IconComponent = iconMapping[feature.icon as keyof typeof iconMapping] || Bed;
                    
                    return (
                      <li key={index} className="flex items-center gap-2 text-sky-800">
                        <IconComponent className="w-4 h-4 text-sky-600" />
                        {feature.text}
                      </li>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Route className="w-5 h-5 text-sky-600" />
                  Passeios
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTour}
                  className="text-sky-600"
                >
                  Adicionar Passeio
                </Button>
              </div>
              <div className="space-y-6">
                {packageData.tours.map((tour, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 space-y-4">
                    <Input
                      placeholder="Título do Passeio"
                      value={tour.title}
                      onChange={(e) => handleTourChange(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Descrição do Passeio"
                      value={tour.description}
                      onChange={(e) => handleTourChange(index, 'description', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={tour.date}
                      onChange={(e) => handleTourChange(index, 'date', e.target.value)}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newTours = [...packageData.tours];
                            newTours[index] = {
                              ...newTours[index],
                              images: [...(newTours[index].images || []), reader.result as string]
                            };
                            setPackageData({ ...packageData, tours: newTours });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {tour.images?.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Tour ${index + 1} image ${imgIndex + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button type="submit" className="w-full">Gerar PDF</Button>
          </form>
        </div>

        <div ref={previewRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 overflow-hidden mb-6">
            <img 
              src={packageData.headerImage}
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
              <div className="space-y-4">
                {packageData.flights.airlineIcon && (
                  <img
                    src={packageData.flights.airlineIcon}
                    alt={packageData.flights.airline}
                    className="h-8 object-contain mb-2"
                  />
                )}
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
                {packageData.flights.flightDetails && (
                  <div className="mt-4 text-gray-600">
                    <p>{packageData.flights.flightDetails}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                <Hotel className="w-5 h-5" />
                Hospedagem
              </h2>
              <div className="space-y-4">
                {packageData.hotel.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {packageData.hotel.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Hotel ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
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
                    {packageData.hotel.features.map((feature, index) => {
                      const iconMapping = {
                        wifi: Wifi,
                        utensils: Utensils,
                        car: CarFront,
                        umbrella: Umbrella
                      };
                      
                      const IconComponent = iconMapping[feature.icon as keyof typeof iconMapping] || Bed;
                      
                      return (
                        <li key={index} className="flex items-center gap-2 text-sky-800">
                          <IconComponent className="w-4 h-4 text-sky-600" />
                          {feature.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            {packageData.tours.length > 0 && (
              <section className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-sky-600">
                  <Route className="w-5 h-5" />
                  Passeios
                </h2>
                <div className="space-y-6">
                  {packageData.tours.map((tour, index) => (
                    <div key={index} className="bg-sky-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sky-900 mb-2">{tour.title}</h3>
                      {tour.images?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {tour.images.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt={`Tour ${index + 1} image ${imgIndex + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sky-800 mb-2">{tour.description}</p>
                      <p className="text-sky-600 text-sm">
                        <Calendar className="w-4 h-4 inline-block mr-1" />
                        {tour.date}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPackageForm;
