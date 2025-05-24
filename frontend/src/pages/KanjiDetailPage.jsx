import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWordsForKanji, addWord, deleteWord, updateWord } from '../utils/api';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const [kanjiData, setKanjiData] = useState(null);
  const [error, setError] = useState(null);
  const [newWord, setNewWord] = useState('');
  const [wordList, setWordList] = useState([]);
  const [editingWord, setEditingWord] = useState(null);
  const [editForm, setEditForm] = useState({ word: '', reading: '', meaning: [] });
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
        console.log('Fetching words for kanji:', kanji);
        const words = await getWordsForKanji(token, kanji);
        console.log('Fetched words:', words);
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

  const handleEditWord = (word) => {
    console.log('Editing word:', word);
    setEditingWord(word);
    setEditForm({
      word: word.word,
      reading: '',  // Keep empty for backend compatibility
      meaning: []   // Keep empty for backend compatibility
    });
  };

  const handleUpdateWord = async (e) => {
    e.preventDefault();
    if (!token || !editingWord) return;

    try {
      console.log('Updating word:', editingWord.id, 'with new word:', editForm.word);
      const wordData = {
        word: editForm.word,
        reading: '',  // Keep empty for backend compatibility
        meaning: []   // Keep empty for backend compatibility
      };
      console.log('Sending word data:', wordData);
      const updatedWord = await updateWord(token, editingWord.id, wordData);
      console.log('Word updated successfully:', updatedWord);
      
      // Update the word list with the updated word
      setWordList(prevWords => 
        prevWords.map(word => 
          word.id === editingWord.id ? updatedWord : word
        )
      );
      
      // Close the modal
      setEditingWord(null);
    } catch (error) {
      console.error('Error updating word:', error);
      console.error('Error details:', error.message, error.stack);
      if (error.message.includes('Invalid Japanese word')) {
        alert('This word was not found in the dictionary. Please check the spelling and try again.');
      } else {
        alert('Failed to update word. Please try again.');
      }
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
            {console.log('Rendering wordList:', JSON.stringify(wordList, null, 2))}
            {wordList && wordList.length > 0 ? (
              wordList.map((word) => {
                console.log('Rendering word:', word);
                return (
                  <div key={word.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow border border-gray-200">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="text-lg font-medium">{word.word}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditWord(word)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        title="Edit word"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWord(word.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete word"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500">No words added yet</div>
            )}
          </div>
        </>
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Word</h2>
            <form onSubmit={handleUpdateWord}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Word</label>
                  <input
                    type="text"
                    value={editForm.word}
                    onChange={(e) => {
                      console.log('Word input changed:', e.target.value);
                      setEditForm(prev => ({ ...prev, word: e.target.value }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingWord(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanjiDetailPage;