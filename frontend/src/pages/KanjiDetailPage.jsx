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
  <div className="kanji-detail-page">
    <div className="kanji-header" style={{ textAlign: 'center' }}>
      <Link to="/">
        <button className="back-button">Back</button>
      </Link>
      <h1 className="kanji-heading">Kanji Details</h1>
    </div>
    <div className="kanji-card-fordetail" style={{ textAlign: 'center' }}>
      <div className="kanji-box-fordetail">{kanjiData.character}</div>
      <div className="kanji-info">
        <p className="kanji-info-item"><strong>Onyomi:</strong> {kanjiData.onyomi.join(', ') || 'N/A'}</p>
        <p className="kanji-info-item"><strong>Kunyomi:</strong> {kanjiData.kunyomi.join(', ') || 'N/A'}</p>
        <p className="kanji-info-item"><strong>Meanings:</strong> {kanjiData.meanings.join(', ') || 'N/A'}</p>
        <p className="kanji-info-item"><strong>Stroke Count:</strong> {kanjiData.strokeCount || 'N/A'}</p>
        <p className="kanji-info-item"><strong>JLPT Level:</strong> {kanjiData.jlptLevel || 'N/A'}</p>
      </div>
    </div>

    {token && (
      <>
        <div className="vocab-add-card">
          <h2 className="vocab-title">Add New Word</h2>
          <form onSubmit={handleAddWord} className="form-section">
            <div className="flex gap-1rem" style={{ justifyContent: 'center' }}>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Enter a word containing this kanji"
                className="input-field"
              />
              <button type="submit" className="vocab-add-button">Add Word</button>
            </div>
          </form>
        </div>

        <div className="vocab-list-card">
          <h2 className="vocab-title">Word List</h2>
          {wordList && wordList.length > 0 ? (
            wordList.map((word) => (
              <div key={word.id} className="vocab-item">
                <div className="vocab-item-text" style={{ marginRight: '1rem' }}>{word.word}</div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEditWord(word)} className="edit-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteWord(word.id)} className="delete-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-words-text">No words added yet</div>
          )}
        </div>
      </>
    )}

    {editingWord && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-header">Edit Word</h2>
          <form onSubmit={handleUpdateWord}>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editForm.word}
                  onChange={(e) => {
                    console.log('Word input changed:', e.target.value);
                    setEditForm(prev => ({ ...prev, word: e.target.value }));
                  }}
                  className="modal-input"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingWord(null)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="modal-save-button">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default KanjiDetailPage;