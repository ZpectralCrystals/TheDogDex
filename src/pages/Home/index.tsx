import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Dog {
  id: string;
  name: string;
  image: {
    url: string;
  };
  temperament?: string;
}

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getDogs = async () => {
    try {
      const response = await fetch("https://api.thedogapi.com/v1/breeds?limit=100", {
        headers: {
          'x-api-key': 'live_hYF9LdHpRpGWt5B3iwwc5MU45LafrCdsYbbMzPFSQzy0EgUIIgZJooseTI7bqka2'
        }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data: Dog[] = await response.json();
      
      const validDogs = data.filter(dog => 
        dog.image?.url && 
        /\.(jpeg|jpg|png|webp)$/i.test(dog.image.url)
      );

      setDogs(validDogs.length > 0 ? validDogs : [
        {
          id: "1",
          name: "Golden Retriever",
          image: { url: "https://cdn2.thedogapi.com/images/B1-llgq4m.jpg" },
          temperament: "Intelligent, Friendly, Devoted"
        },
        {
          id: "2",
          name: "Bulldog",
          image: { url: "https://cdn2.thedogapi.com/images/B1-llgq4m.jpg" },
          temperament: "Friendly, Courageous, Calm"
        }
      ]);
    } catch (err) {
      console.error("Error al obtener perros:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
          DogAPI
        </h1>
        <p className="mt-2 text-gray-600">Explora nuestras razas de perros</p>
      </section>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error} Mostrando datos de ejemplo...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dogs.map((dog) => (
          <Link
            to={`/dog/${dog.id}`}
            key={dog.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
          >
            {/* Contenedor de imagen ajustado */}
            <div className="relative pt-[100%] bg-gray-100"> {/* Relación de aspecto 1:1 */}
              <img
                src={dog.image.url}
                alt={dog.name}
                className="absolute top-0 left-0 w-full h-full object-contain p-4"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://placedog.net/500/500?random";
                  e.currentTarget.className = "absolute top-0 left-0 w-full h-full object-contain p-8 bg-gray-200";
                }}
              />
            </div>
            
            <div className="p-4 flex-grow">
              <h3 className="font-bold text-xl capitalize mb-2">{dog.name}</h3>
              {dog.temperament && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {dog.temperament}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}