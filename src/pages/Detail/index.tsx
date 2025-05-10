import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface DogDetail {
  id: string;
  name: string;
  image: {
    url: string;
  };
  temperament?: string;
  life_span: string;
  weight: {
    metric: string;
  };
  height: {
    metric: string;
  };
  bred_for?: string;
  breed_group?: string;
  reference_image_id?: string;
  origin?: string;
}

const TEMPERAMENT_COLORS: Record<string, string> = {
  active: "bg-blue-500 hover:bg-blue-600",
  friendly: "bg-green-500 hover:bg-green-600",
  intelligent: "bg-yellow-500 hover:bg-yellow-600",
  loyal: "bg-red-500 hover:bg-red-600",
  calm: "bg-purple-500 hover:bg-purple-600",
  playful: "bg-pink-500 hover:bg-pink-600",
  protective: "bg-indigo-500 hover:bg-indigo-600",
  energetic: "bg-orange-500 hover:bg-orange-600",
  gentle: "bg-teal-500 hover:bg-teal-600",
  default: "bg-gray-500 hover:bg-gray-600",
};

export default function DogDetail() {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const [dog, setDog] = useState<DogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://api.thedogapi.com/v1/breeds/${dogId}`, {
        headers: {
          'x-api-key': 'live_hYF9LdHpRpGWt5B3iwwc5MU45LafrCdsYbbMzPFSQzy0EgUIIgZJooseTI7bqka2'
        }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data: DogDetail = await response.json();

      // Verificar y normalizar la imagen
      if (!data.image?.url && data.reference_image_id) {
        const imgResponse = await fetch(`https://api.thedogapi.com/v1/images/${data.reference_image_id}`, {
          headers: {
            'x-api-key': 'live_hYF9LdHpRpGWt5B3iwwc5MU45LafrCdsYbbMzPFSQzy0EgUIIgZJooseTI7bqka2'
          }
        });
        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          data.image = { url: imgData.url };
        }
      }

      if (!data.image?.url) {
        data.image = { url: `https://placedog.net/800/600?random=${data.id}` };
      }

      setDog(data);
    } catch (err) {
      console.error("Error fetching dog data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dogId) fetchDogData();
  }, [dogId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <span className="ml-4 text-lg">Cargando información del perro...</span>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="text-center mt-10 p-6 max-w-md mx-auto">
        <div className="text-red-500 text-xl font-bold mb-4">¡Ups!</div>
        <p className="mb-6">{error || "No se pudo cargar la información del perro"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const getTemperamentColor = (temp: string) => {
    const lowerTemp = temp.toLowerCase();
    return Object.keys(TEMPERAMENT_COLORS).find(key => lowerTemp.includes(key)) || 'default';
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Sección de imagen - Ajustada para mostrar completa */}
      <div className="relative w-full h-96 bg-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-white/90 text-gray-800 rounded-full p-2 shadow-md hover:bg-white transition-all"
          aria-label="Volver atrás"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={dog.image.url}
            alt={dog.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = `https://placedog.net/800/600?random=${dog.id}`;
              e.currentTarget.className = "max-w-full max-h-full object-contain p-8 bg-gray-200";
            }}
          />
        </div>
      </div>

      {/* Contenido informativo */}
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold capitalize mb-2">{dog.name}</h1>
        
        {dog.origin && (
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Origen:</span> {dog.origin}
          </p>
        )}

        {dog.temperament && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Temperamento</h2>
            <div className="flex flex-wrap gap-2">
              {dog.temperament.split(", ").map((temp) => {
                const colorKey = getTemperamentColor(temp);
                return (
                  <span
                    key={temp}
                    className={`px-4 py-2 rounded-full text-sm font-medium text-white ${TEMPERAMENT_COLORS[colorKey]}`}
                  >
                    {temp}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Peso</h3>
            <p className="text-2xl font-bold">{dog.weight.metric} kg</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Altura</h3>
            <p className="text-2xl font-bold">{dog.height.metric} cm</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Esperanza de vida</h3>
            <p className="text-2xl font-bold">{dog.life_span}</p>
          </div>
        </div>

        <div className="space-y-6">
          {dog.bred_for && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Historia</h2>
              <p className="text-gray-700">{dog.bred_for}</p>
            </div>
          )}

          {dog.breed_group && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Grupo de raza</h2>
              <p className="text-gray-700 capitalize">{dog.breed_group.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}