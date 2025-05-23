import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const [kanjiData, setKanjiData] = useState(null);
  const [error, setError] = useState(null);
  const [newVocab, setNewVocab] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchKanjiData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/kanji/${kanji}`);
        if (!response.ok) {
          throw new Error('Kanji not found');
        }
        const data = await response.json();
        setKanjiData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchVocabList = async () => {
      try {
        const response = await fetch(`http://localhost:5000/vocab?kanji=${kanji}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary');
        }
        const data = await response.json();
        setVocabList(data);
      } catch (err) {
        console.error(err.message);
        setVocabList([]);
      }
    };

    fetchKanjiData();
    if (token) fetchVocabList();
  }, [kanji, token]);

  const handleAddVocab = async () => {
    if (!newVocab.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/vocab', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: newVocab, kanji }),
      });
      if (!response.ok) throw new Error('Failed to add vocabulary');
      const addedVocab = await response.json();
      setVocabList([...vocabList, addedVocab]);
      setNewVocab('');
    } catch (error) {
      console.error('Error adding vocabulary:', error);
    }
  };

  const handleDeleteVocab = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/vocab/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete vocabulary');
      setVocabList(vocabList.filter((vocab) => vocab.id !== id));
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!kanjiData) return <p className="text-center">Loading...</p>;

  return (
    <div className="kanji-detail-page flex flex-col items-center p-6 min-h-screen">
      <Link to="/">
        <button className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Kanji Details</h1>
      <div className="kanji-card-fordetail flex flex-col items-center p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full">
        <div className="kanji-box-fordetail text-6xl font-bold mb-4">
          {kanjiData.character}
        </div>
        <div className="kanji-info text-center">
          <p className="text-lg"><strong>Onyomi:</strong> {kanjiData.onyomi.join(', ') || 'N/A'}</p>
          <p className="text-lg"><strong>Kunyomi:</strong> {kanjiData.kunyomi.join(', ') || 'N/A'}</p>
          <p className="text-lg"><strong>Meanings:</strong> {kanjiData.meanings.join(', ') || 'N/A'}</p>
          <p className="text-lg"><strong>Stroke Count:</strong> {kanjiData.strokeCount || 'N/A'}</p>
          <p className="text-lg"><strong>JLPT Level:</strong> {kanjiData.jlptLevel || 'N/A'}</p>
        </div>
      </div>

      {token && (
        <>
          <div className="vocab-add-card mt-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Add Vocabulary</h2>
            <div className="flex w-full max-w-sm items-center">
              <input
                type="text"
                value={newVocab}
                onChange={(e) => setNewVocab(e.target.value)}
                placeholder="Enter vocabulary word"
                className="vocab-input border p-2 rounded flex-1 mr-2"
              />
              <button
                onClick={handleAddVocab}
                className="vocab-add-button bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="vocab-list-card mt-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Your Vocabulary</h2>
            {vocabList.length > 0 ? (
              <ul className="w-full max-w-sm">
                {vocabList.map((vocab) => (
                  <li
                    key={vocab.id}
                    className="vocab-item flex justify-between items-center border-b py-2 px-4 hover:bg-gray-100 transition-colors rounded"
                  >
                    <span className="text-lg">{vocab.word}</span>
                    {token && (
                      <button
                        onClick={() => handleDeleteVocab(vocab.id)}
                        className="vocab-delete-button text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No vocabulary added yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KanjiDetailPage;