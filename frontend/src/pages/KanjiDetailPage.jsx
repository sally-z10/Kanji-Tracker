import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWordsForKanji, addWord, deleteWord } from '../utils/api';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const [kanjiData, setKanjiData] = useState(null);
  const [error, setError] = useState(null);
  const [newWord, setNewWord] = useState({ word: '', reading: '', meaning: '' });
  const [wordList, setWordList] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchKanjiData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/kanji/${kanji}`);
        if (!response.ok) {
          throw new Error('Kanji not found');
        }
        const data = await response.json();
        setKanjiData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchWordList = async () => {
      if (!token) return;
      try {
        const words = await getWordsForKanji(token, kanji);
        setWordList(words);
      } catch (err) {
        console.error('Error fetching words:', err);
        setWordList([]);
      }
    };

    fetchKanjiData();
    fetchWordList();
  }, [kanji, token]);

  const handleAddWord = async () => {
    if (!newWord.word.trim() || !newWord.reading.trim() || !newWord.meaning.trim()) return;
    try {
      const addedWord = await addWord(token, newWord.word, newWord.reading, newWord.meaning, kanji);
      setWordList([...wordList, addedWord]);
      setNewWord({ word: '', reading: '', meaning: '' });
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await deleteWord(token, id);
      setWordList(wordList.filter((word) => word.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
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
          <div className="word-add-card mt-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Add Word</h2>
            <div className="flex flex-col w-full max-w-sm gap-2">
              <input
                type="text"
                value={newWord.word}
                onChange={(e) => setNewWord(prev => ({ ...prev, word: e.target.value }))}
                placeholder="Enter word"
                className="border p-2 rounded"
              />
              <input
                type="text"
                value={newWord.reading}
                onChange={(e) => setNewWord(prev => ({ ...prev, reading: e.target.value }))}
                placeholder="Enter reading (hiragana/katakana)"
                className="border p-2 rounded"
              />
              <input
                type="text"
                value={newWord.meaning}
                onChange={(e) => setNewWord(prev => ({ ...prev, meaning: e.target.value }))}
                placeholder="Enter meaning"
                className="border p-2 rounded"
              />
              <button
                onClick={handleAddWord}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Word
              </button>
            </div>
          </div>

          <div className="word-list-card mt-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Your Words</h2>
            {wordList.length > 0 ? (
              <ul className="w-full max-w-sm">
                {wordList.map((word) => (
                  <li
                    key={word.id}
                    className="word-item flex justify-between items-center border-b py-2 px-4 hover:bg-gray-100 transition-colors rounded"
                  >
                    <div>
                      <span className="text-lg font-bold">{word.word}</span>
                      <span className="text-gray-600 ml-2">({word.reading})</span>
                      <p className="text-sm text-gray-500">{word.meaning}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No words added yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KanjiDetailPage;