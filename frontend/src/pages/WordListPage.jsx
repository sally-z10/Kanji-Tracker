import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWords, deleteWord } from '../utils/api';

const WordListPage = () => {
  const [words, setWords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 0 });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWords = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await getWords(token, pagination.page, pagination.limit);
        setWords(response.words);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error fetching words:', error);
        navigate('/login');
      }
    };
    fetchWords();
  }, [token, navigate, pagination.page, pagination.limit]);

  const handleDelete = async (id) => {
    try {
      await deleteWord(token, id);
      setWords(words.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="word-list-page">
      <div className="word-list-header">
        <Link to="/">
          <button className="back-button">Back</button>
        </Link>
        <h1 className="word-list-heading">Your Word List</h1>
      </div>
      {words.length > 0 ? (
        <>
          <ul className="word-list">
            {words.map((word) => (
              <li key={word.id} className="word-item">
                <div className="word-details">
                  <span className="word-text">{word.word}</span>
                  <span className="word-reading">({word.reading})</span>
                  <p className="word-meaning">{word.meaning}</p>
                  <p className="word-kanji">Kanji: {word.kanji_character}</p>
                </div>
                <button
                  onClick={() => handleDelete(word.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="no-words-message">No words added yet.</p>
      )}
    </div>
  );
};

export default WordListPage;