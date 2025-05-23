import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVocab, deleteVocab } from '../utils/api';

const WordListPage = () => {
  const [vocabList, setVocabList] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchVocab = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const vocab = await getVocab(token);
        setVocabList(vocab);
      } catch (error) {
        console.error('Error fetching vocab:', error);
        navigate('/login');
      }
    };
    fetchVocab();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    try {
      await deleteVocab(token, id);
      setVocabList(vocabList.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Error deleting vocab:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Your Word List</h1>
      {vocabList.length > 0 ? (
        <ul>
          {vocabList.map((vocab) => (
            <li key={vocab.id} className="flex justify-between items-center border-b py-2">
              <span>
                <strong>{vocab.kanji}</strong>: {vocab.word}
              </span>
              <button
                onClick={() => handleDelete(vocab.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No vocabulary added yet.</p>
      )}
    </div>
  );
};

export default WordListPage;