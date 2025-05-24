import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchKanji } from '../utils/api';

const MainPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [kanjiList, setKanjiList] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKanji = async () => {
      try {
        console.log('Fetching kanji from API...');
        const response = await fetch(`http://localhost:5000/api/kanji?page=${pagination.page}&limit=${pagination.limit}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch kanji: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received kanji data:', data);
        setKanjiList(data.kanji);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error in fetchKanji:', error);
        setError(error.message);
      }
    };

    fetchKanji();
  }, [pagination.page, pagination.limit]);

  const handleSearch = async () => {
    if (query.trim()) {
      try {
        const results = await searchKanji(query.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching Kanji:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Kanji Tracker</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Kanji Tracker</h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Kanji (e.g., 日 or nihon)"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Search
        </button>
      </div>

      <div className="main-content">
        {searchResults.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Search Results</h2>
            <div className="kanji-grid">
              {searchResults.map((result, index) => (
                <Link
                  to={`/kanji/${result.slug}`}
                  key={index}
                  className="kanji-box"
                >
                  <div className="text-2xl">{result.kanji}</div>
                  <div>{result.reading}</div>
                  <div>{result.meanings.join(', ')}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-2">All Kanji</h2>
            {kanjiList.length === 0 ? (
              <div className="text-gray-500">Loading kanji...</div>
            ) : (
              <>
                <div className="kanji-grid">
                  {kanjiList.map((kanji, index) => (
                    <Link
                      to={`/kanji/${kanji.character}`}
                      key={index}
                      className="kanji-box"
                    >
                      <div className="text-2xl">{kanji.character}</div>
                      <div className="text-sm text-gray-600">{kanji.meanings?.join(', ') || 'No meanings available'}</div>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;