
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plane, Hotel, Sun, Star } from "lucide-react";

const templates = [
  {
    key: "tropical",
    title: "Tropical Paradise",
    subtitle: "Maldivas All Inclusive",
    description: "Pacote paradisíaco para as Maldivas com voos + resort de luxo + passeios de barco.",
    headerImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
    agency: "Blue Ocean Travel",
    flights: {
      departure: "São Paulo",
      arrival: "Malé",
      departureTime: "20/07/2025 23:40",
      arrivalTime: "31/07/2025 00:20",
      airline: "Qatar Airways",
      airlineIcon: "https://logos-world.net/wp-content/uploads/2021/02/Qatar-Airways-Logo.png",
      flightDetails: "Classe Econômica, bagagem 23kg, refeições incluídas."
    },
    hotel: {
      name: "Paradise Island Resort",
      location: "Atol do Norte, Maldivas",
      checkin: "21/07/2025",
      checkout: "30/07/2025",
      features: [
        { icon: "wifi", text: "Wi-Fi" },
        { icon: "utensils", text: "Restaurante" },
        { icon: "umbrella", text: "Piscina" },
        { icon: "car", text: "Translado Incluso" }
      ],
      images: [
        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
      ]
    },
    tours: [
      {
        title: "Passeio de Barco",
        description: "Explore os recifes de coral com mergulho incluso.",
        date: "23/07/2025",
        images: [
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
        ]
      }
    ],
    inclusions: ["Traslado", "Welcome Drink", "Café da manhã"]
  },
  {
    key: "city",
    title: "City Explorer",
    subtitle: "Nova York - Cultura & Compras",
    description: "Viva o melhor de NYC com hotel central, ingressos para a Broadway e city tour.",
    headerImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
    agency: "Urban Destinos",
    flights: {
      departure: "Rio de Janeiro",
      arrival: "New York JFK",
      departureTime: "15/09/2025 22:10",
      arrivalTime: "22/09/2025 11:45",
      airline: "American Airlines",
      airlineIcon: "https://1000logos.net/wp-content/uploads/2020/05/American-Airlines-logo.png",
      flightDetails: "Classe Econômica Premium, entretenimento a bordo."
    },
    hotel: {
      name: "The Manhattan Club",
      location: "Times Square, Nova York",
      checkin: "16/09/2025",
      checkout: "21/09/2025",
      features: [
        { icon: "wifi", text: "Wi-Fi" },
        { icon: "car", text: "Estacionamento" },
        { icon: "utensils", text: "Café da manhã" },
        { icon: "umbrella", text: "Academia" }
      ],
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
      ]
    },
    tours: [
      {
        title: "City Tour Completo",
        description: "Passeios pelos principais pontos turísticos e bairros históricos de Manhattan.",
        date: "17/09/2025",
        images: [
          "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=400&q=80"
        ]
      }
    ],
    inclusions: ["City Tour", "Ingresso Broadway"]
  },
  {
    key: "adventure",
    title: "Adventure Wild",
    subtitle: "Chapada dos Veadeiros - Ecoturismo",
    description: "Aventura no cerrado: trilhas, cachoeiras e chalé aconchegante em meio à natureza.",
    headerImage: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80",
    agency: "Brasil Ecotrips",
    flights: {
      departure: "Brasília",
      arrival: "Alto Paraíso",
      departureTime: "03/08/2025 08:00",
      arrivalTime: "07/08/2025 19:30",
      airline: "Azul",
      airlineIcon: "https://logodownload.org/wp-content/uploads/2016/10/azul-linhas-aereas-logo-0-2048x972.png",
      flightDetails: "Bagagem inclusa, voo doméstico Azul Airlines."
    },
    hotel: {
      name: "Eco Chalé Paraíso",
      location: "Alto Paraíso/GO",
      checkin: "03/08/2025",
      checkout: "07/08/2025",
      features: [
        { icon: "wifi", text: "Wi-Fi" },
        { icon: "umbrella", text: "Piscina Natural" },
        { icon: "utensils", text: "Café Orgânico" }
      ],
      images: [
        "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=400&q=80"
      ]
    },
    tours: [
      {
        title: "Trilha Cataratas",
        description: "Caminhada guiada e banhos de cachoeira.",
        date: "04/08/2025",
        images: [
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
        ]
      }
    ],
    inclusions: ["Guia local", "Café da manhã"]
  },
  {
    key: "luxury",
    title: "Luxury Escape",
    subtitle: "Dubai 5 Estrelas",
    description: "Hospedagem em resort 5 estrelas, visita ao Burj Khalifa e experiência gourmet exclusiva.",
    headerImage:
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80",
    agency: "Exclusive Tours",
    flights: {
      departure: "Lisboa",
      arrival: "Dubai DXB",
      departureTime: "10/10/2025 16:00",
      arrivalTime: "18/10/2025 08:00",
      airline: "Emirates",
      airlineIcon: "https://logodownload.org/wp-content/uploads/2019/05/emirates-logo-0.png",
      flightDetails: "Primeira Classe Emirates, serviço VIP, lounge gourmet."
    },
    hotel: {
      name: "Burj Al Arab Jumeirah",
      location: "Dubai, EAU",
      checkin: "11/10/2025",
      checkout: "17/10/2025",
      features: [
        { icon: "wifi", text: "Wi-Fi Premium" },
        { icon: "utensils", text: "Restaurantes 5⭐" },
        { icon: "umbrella", text: "Spa Exclusivo" },
        { icon: "car", text: "Transfer VIP" }
      ],
      images: [
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80"
      ]
    },
    tours: [
      {
        title: "Burj Khalifa VIP",
        description: "Ingresso para o mirante VIP no prédio mais alto do mundo.",
        date: "12/10/2025",
        images: [
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80"
        ]
      }
    ],
    inclusions: ["Transfer VIP", "Spa", "Gastronomia de alto padrão"]
  }
];

type Props = {
  onSelectTemplate: (data: any) => void;
};

const PackageTemplateGallery: React.FC<Props> = ({ onSelectTemplate }) => {
  return (
    <div className="grid xl:grid-cols-2 gap-8">
      {templates.map(template => (
        <Card
          key={template.key}
          className="relative bg-gradient-to-br from-sky-50 to-gray-100 shadow-xl hover:shadow-2xl transition-shadow group"
        >
          <div className="h-56 w-full overflow-hidden rounded-t-lg relative">
            <img
              src={template.headerImage}
              alt={template.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 bg-white/90 rounded-full px-4 py-1 text-xs font-semibold text-sky-700 shadow">
              {template.subtitle}
            </span>
          </div>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-2xl font-bold text-sky-900 flex items-center gap-2">
              {template.title}
              {template.key === "luxury" && <Star className="text-yellow-400 w-5 h-5" />}
              {template.key === "tropical" && <Sun className="text-yellow-500 w-5 h-5" />}
              {template.key === "adventure" && <Hotel className="text-green-700 w-5 h-5" />}
              {template.key === "city" && <MapPin className="text-sky-700 w-5 h-5" />}
            </CardTitle>
            <div className="text-md text-sky-600">{template.agency}</div>
          </CardHeader>
          <CardContent className="py-2 space-y-2">
            <p className="text-gray-700">{template.description}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              <span className="inline-flex items-center bg-sky-100 text-sky-700 rounded px-2 py-1 text-xs gap-1">
                <Plane className="w-3 h-3" />
                {template.flights.arrival}
              </span>
              <span className="inline-flex items-center bg-sky-100 text-sky-700 rounded px-2 py-1 text-xs gap-1">
                <Hotel className="w-3 h-3" />
                {template.hotel.name}
              </span>
            </div>
            <Button 
              onClick={() => onSelectTemplate(template)}
              className="mt-4 w-full font-semibold"
              variant="secondary"
            >
              Usar este Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PackageTemplateGallery;
