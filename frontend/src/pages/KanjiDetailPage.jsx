import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKanji, addVocab, getVocab, deleteVocab } from '../utils/api';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const navigate = useNavigate();
  const [kanjiData, setKanjiData] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [newVocab, setNewVocab] = useState('');
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  useEffect(() => {
    const fetchKanjiData = async () => {
      try {
        const data = await getKanji(kanji);
        setKanjiData(data);
      } catch (error) {
        console.error('Error fetching Kanji:', error);
      }
    };

    const fetchVocabData = async () => {
      if (token) {
        try {
          const vocab = await getVocab(token);
          setVocabList(vocab.filter((v) => v.kanji === kanji));
        } catch (error) {
          console.error('Error fetching vocab:', error);
        }
      }
    };

    fetchKanjiData();
    fetchVocabData();
  }, [kanji, token]);

  const handleAddVocab = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (newVocab.trim()) {
      try {
        await addVocab(token, kanji, newVocab);
        setNewVocab('');
        const updatedVocab = await getVocab(token);
        setVocabList(updatedVocab.filter((v) => v.kanji === kanji));
      } catch (error) {
        console.error('Error adding vocab:', error);
      }
    }
  };

  const handleDeleteVocab = async (id) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await deleteVocab(token, id);
      setVocabList(vocabList.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Error deleting vocab:', error);
    }
  };

  if (!kanjiData) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold">{kanjiData.character}</h1>
      <div className="mt-4">
        <p><strong>On-yomi:</strong> {kanjiData.onyomi.join(', ') || 'N/A'}</p>
        <p><strong>Kun-yomi:</strong> {kanjiData.kunyomi.join(', ') || 'N/A'}</p>
        <p><strong>Meanings:</strong> {kanjiData.meanings.join(', ') || 'N/A'}</p>
        <p><strong>Stroke Count:</strong> {kanjiData.strokeCount}</p>
        <p><strong>JLPT Level:</strong> {kanjiData.jlptLevel}</p>
        <p><strong>Grade:</strong> {kanjiData.grade}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">Add Vocabulary</h2>
        <input
          type="text"
          value={newVocab}
          onChange={(e) => setNewVocab(e.target.value)}
          placeholder="Enter vocabulary word"
          className="border p-2 mr-2"
        />
        <button onClick={handleAddVocab} className="bg-blue-500 text-white p-2 rounded">
          Add
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">Your Vocabulary</h2>
        {vocabList.length > 0 ? (
          <ul>
            {vocabList.map((vocab) => (
              <li key={vocab.id} className="flex justify-between items-center border-b py-2">
                <span>{vocab.word}</span>
                {token && (
                  <button
                    onClick={() => handleDeleteVocab(vocab.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No vocabulary added yet.</p>
        )}
      </div>
    </div>
  );
};

export default KanjiDetailPage;