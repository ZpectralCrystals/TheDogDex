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
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const dogsPerPage = 20;

  const getDogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.thedogapi.com/v1/breeds?limit=${dogsPerPage}&page=${page}`,
        {
          headers: {
            'x-api-key': 'live_hYF9LdHpRpGWt5B3iwwc5MU45LafrCdsYbbMzPFSQzy0EgUIIgZJooseTI7bqka2'
          }
        }
      );

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data: Dog[] = await response.json();
      
      // Filtramos perros con imágenes válidas
      const validDogs = data.filter(dog => {
        if (!dog.image?.url) return false;
        try {
          new URL(dog.image.url);
          return true;
        } catch {
          return false;
        }
      });

      // Si no hay más perros, desactivamos la paginación
      if (data.length < dogsPerPage) {
        setHasMore(false);
      }

      // Si es página 1, reemplazamos, sino agregamos
      setDogs(prev => page === 1 ? validDogs : [...prev, ...validDogs]);
      setError(null);
    } catch (err) {
      console.error("Error al obtener perros:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      
      // Datos de ejemplo como fallback
      if (page === 1) {
        setDogs([
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
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDogs();
  }, [page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
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
        <p className="mt-2 text-gray-600">Mostrando {dogs.length} perros</p>
      </section>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dogs.map((dog) => (
          <Link
            to={`/dog/${dog.id}`}
            key={`${dog.id}-${Math.random()}`} // Key única para evitar warnings
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="h-48 bg-gray-100 relative">
              <img
                src={dog.image.url}
                alt={dog.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x200?text=Dog+Image";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-xl capitalize">{dog.name}</h3>
              {dog.temperament && (
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                  {dog.temperament}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {loading && page > 1 && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Cargar más perros
          </button>
        </div>
      )}

      {!hasMore && (
        <p className="text-center mt-8 text-gray-500">
          ¡Has visto todos los perros disponibles!
        </p>
      )}
    </main>
  );
}