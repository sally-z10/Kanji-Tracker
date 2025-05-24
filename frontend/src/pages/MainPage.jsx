import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchKanji, getKanjiProgress, getWordProgress } from '../utils/api';

const MainPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [kanjiList, setKanjiList] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ kanjiProgress: 0, wordProgress: 0 });
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

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [kanjiData, wordData] = await Promise.all([
          getKanjiProgress(token),
          getWordProgress(token)
        ]);

        setProgress({
          kanjiProgress: kanjiData.completed || 0,
          wordProgress: wordData.total_words || 0
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchKanji();
    fetchProgress();
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
      <div className="main-content">
        <div className="text-red-500 mb-4">An error occurred while fetching data.</div>
        <h1 className="text-3xl font-bold mb-4">Kanji Tracker</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Kanji (e.g., 日 or nihon)"
        />
        <button
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      

      {/* Progress Stats */}
      <div className="progress-stats">
        <div className="stat-card">
          <h2>Kanji Learned</h2>
          <p>{progress.kanjiProgress}</p>
        </div>
        <div className="stat-card">
          <h2>Words Added</h2>
          <p>{progress.wordProgress}</p>
        </div>
      </div>
      
      
      <div className="main-content">
        {searchResults.length > 0 ? (
          <div>
            <h2 className="section-title">Search Results</h2>
            <div className="kanji-grid">
              {searchResults.map((result, index) => (
                <Link
                  to={`/kanji/${result.slug}`}
                  key={index}
                  className="kanji-box"
                >
                  <div className="kanji-character">{result.kanji}</div>
                  <div className='kanji-reading'>{result.reading}</div>
                  <div className='kanji-meaning'>{result.meanings.join(', ')}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="section-title">All Kanji</h2>
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
                      <div className="kanji-character">{kanji.character}</div>
                      <div className="kanji-meaning">{kanji.meanings?.join(', ') || 'No meanings available'}</div>
                    </Link>
                  ))}
                </div>
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
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