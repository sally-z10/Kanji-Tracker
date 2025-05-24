import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Your Word List</h1>
      {words.length > 0 ? (
        <>
          <ul className="mb-4">
            {words.map((word) => (
              <li key={word.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <span className="font-bold">{word.word}</span>
                  <span className="text-gray-600 ml-2">({word.reading})</span>
                  <p className="text-sm text-gray-500">{word.meaning}</p>
                  <p className="text-sm text-gray-500">Kanji: {word.kanji_character}</p>
                </div>
                <button
                  onClick={() => handleDelete(word.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-center gap-2">
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
      ) : (
        <p>No words added yet.</p>
      )}
    </div>
  );
};

export default WordListPage;