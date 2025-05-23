import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchKanji } from '../utils/api';

const MainPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Sample Kanji for display (can be replaced with an API call later)
  const kanjiList = ['日', '月', '水', '木', '金'];

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

      {searchResults.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchResults.map((result, index) => (
              <Link
                to={`/kanji/${result.slug}`}
                key={index}
                className="border p-4 rounded shadow hover:bg-gray-100 text-center"
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
          <h2 className="text-2xl font-semibold mb-2">Featured Kanji</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kanjiList.map((kanji, index) => (
              <Link
                to={`/kanji/${kanji}`}
                key={index}
                className="border p-4 rounded shadow hover:bg-gray-100 text-center"
              >
                <div className="text-2xl">{kanji}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;