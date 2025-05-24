import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWordsForKanji, addWord, deleteWord } from '../utils/api';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const [kanjiData, setKanjiData] = useState(null);
  const [error, setError] = useState(null);
  const [newWord, setNewWord] = useState('');
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

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      console.log('Adding word:', newWord);
      const response = await addWord(token, newWord, kanji);
      console.log('Word added successfully:', response);
      
      // Update the words list with the new word
      setWordList(prevWords => [...prevWords, response]);
      setNewWord(''); // Clear the input
    } catch (error) {
      console.error('Error adding word:', error);
      console.error('Error details:', error.message, error.stack);
      // Show a more specific error message
      if (error.message.includes('Invalid Japanese word')) {
        alert('This word was not found in the dictionary. Please check the spelling and try again.');
      } else {
        alert('Failed to add word. Please try again.');
      }
    }
  };

  const handleDeleteWord = async (id) => {
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    try {
      console.log('Deleting word:', id);
      await deleteWord(token, id);
      console.log('Word deleted successfully');
      // Update the word list by filtering out the deleted word
      setWordList(prevWords => prevWords.filter(word => word.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
      console.error('Error details:', error.message, error.stack);
      alert('Failed to delete word. Please try again.');
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
          <form onSubmit={handleAddWord} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter a word containing this kanji"
                className="flex-1 p-2 border rounded"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Word
              </button>
            </div>
          </form>

          <div className="space-y-4 w-full max-w-md">
            {wordList.map((word) => (
              <div key={word.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
                <div className="flex-1">
                  <div className="text-lg font-medium">{word.word}</div>
                  {word.reading && <div className="text-gray-600">{word.reading}</div>}
                  {word.meaning && word.meaning.length > 0 && (
                    <div className="text-gray-600">{word.meaning.join(', ')}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteWord(word.id)}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 focus:outline-none"
                  title="Delete word"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default KanjiDetailPage;