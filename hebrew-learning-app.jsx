import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, BookOpen, Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react';

// אלף-בית עברי עם צלילים
const hebrewAlphabet = [
  { letter: 'א', name: 'אָלֶף', sound: 'alef (silent/a)', vowel: 'ַ' },
  { letter: 'ב', name: 'בֵּית', sound: 'bet (b/v)', vowel: 'ֵ' },
  { letter: 'ג', name: 'גִּימֶל', sound: 'gimel (g)', vowel: 'ִ' },
  { letter: 'ד', name: 'דָּלֶת', sound: 'dalet (d)', vowel: 'ָ' },
  { letter: 'ה', name: 'הֵא', sound: 'heh (h)', vowel: 'ֵ' },
  { letter: 'ו', name: 'וָו', sound: 'vav (v/o/u)', vowel: 'ָ' },
  { letter: 'ז', name: 'זַיִן', sound: 'zayin (z)', vowel: 'ַ' },
  { letter: 'ח', name: 'חֵית', sound: 'chet (ch)', vowel: 'ֵ' },
  { letter: 'ט', name: 'טֵית', sound: 'tet (t)', vowel: 'ֵ' },
  { letter: 'י', name: 'יוֹד', sound: 'yod (y/i)', vowel: 'וֹ' },
  { letter: 'כ', name: 'כַּף', sound: 'kaf (k/ch)', vowel: 'ַ' },
  { letter: 'ל', name: 'לָמֶד', sound: 'lamed (l)', vowel: 'ָ' },
  { letter: 'מ', name: 'מֵם', sound: 'mem (m)', vowel: 'ֵ' },
  { letter: 'ן', name: 'נוּן סוֹפִית', sound: 'nun sofit (n)', vowel: 'וּ' },
  { letter: 'נ', name: 'נוּן', sound: 'nun (n)', vowel: 'וּ' },
  { letter: 'ס', name: 'סָמֶךְ', sound: 'samech (s)', vowel: 'ָ' },
  { letter: 'ע', name: 'עַיִן', sound: 'ayin (silent)', vowel: 'ַ' },
  { letter: 'פ', name: 'פֵּא', sound: 'peh (p/f)', vowel: 'ֵ' },
  { letter: 'צ', name: 'צָדִי', sound: 'tzadi (tz)', vowel: 'ָ' },
  { letter: 'ק', name: 'קוֹף', sound: 'kof (k)', vowel: 'וֹ' },
  { letter: 'ר', name: 'רֵישׁ', sound: 'resh (r)', vowel: 'ֵ' },
  { letter: 'ש', name: 'שִׁין', sound: 'shin (sh/s)', vowel: 'ִ' },
  { letter: 'ת', name: 'תָּו', sound: 'tav (t)', vowel: 'ָ' }
];

// מילים פשוטות לתרגול
const simpleWords = [
  { word: 'אָב', translation: 'father', difficulty: 1 },
  { word: 'אֵם', translation: 'mother', difficulty: 1 },
  { word: 'בַּיִת', translation: 'house', difficulty: 1 },
  { word: 'יֶלֶד', translation: 'boy/child', difficulty: 1 },
  { word: 'יַלְדָּה', translation: 'girl', difficulty: 1 },
  { word: 'שָׁלוֹם', translation: 'hello/peace', difficulty: 1 },
  { word: 'תּוֹדָה', translation: 'thank you', difficulty: 2 },
  { word: 'בְּבַקָּשָׁה', translation: 'please', difficulty: 2 },
  { word: 'סְלִיחָה', translation: 'sorry/excuse me', difficulty: 2 },
  { word: 'מַיִם', translation: 'water', difficulty: 2 },
  { word: 'לֶחֶם', translation: 'bread', difficulty: 2 },
  { word: 'שֻׁלְחָן', translation: 'table', difficulty: 3 },
  { word: 'מִשְׁפָּחָה', translation: 'family', difficulty: 3 },
  { word: 'בְּרוּכִים הַבָּאִים', translation: 'welcome', difficulty: 3 }
];

const HebrewLearningApp = () => {
  // State management
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userData, setUserData] = useState({
    name: '',
    totalPoints: 0,
    streak: 0,
    level: 1,
    todayMinutes: 0,
    lastVisit: new Date().toDateString(),
    completedLessons: [],
    masteredLetters: []
  });
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [dailyQuizScore, setDailyQuizScore] = useState(null);

  // פונקציה להשמעת טקסט בעברית
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // עצירת דיבור קודם אם יש
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL'; // עברית
      utterance.rate = 0.8; // קצב איטי יותר ללמידה
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // עדכון זמן למידה
  useEffect(() => {
    if (sessionStartTime && currentScreen !== 'home') {
      const interval = setInterval(() => {
        const minutesElapsed = Math.floor((Date.now() - sessionStartTime) / 60000);
        setUserData(prev => ({
          ...prev,
          todayMinutes: minutesElapsed
        }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime, currentScreen]);

  // בדיקת streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (userData.lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      setUserData(prev => ({
        ...prev,
        streak: userData.lastVisit === yesterday ? prev.streak + 1 : 1,
        lastVisit: today,
        todayMinutes: 0
      }));
    }
  }, []);

  const startSession = () => {
    setSessionStartTime(Date.now());
  };

  const addPoints = (points) => {
    setUserData(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      level: Math.floor((prev.totalPoints + points) / 100) + 1
    }));
  };

  // רכיב מסך הבית
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-center mb-4 text-purple-600">
            ללמוד עברית! 📚
          </h1>
          <h2 className="text-2xl text-center mb-8 text-gray-600">
            Learn Hebrew Reading & Writing
          </h2>

          {!userData.name && (
            <div className="mb-8">
              <input
                type="text"
                placeholder="מה שמך? What's your name?"
                className="w-full p-4 border-2 border-purple-300 rounded-lg text-xl"
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          )}

          {userData.name && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold mb-4">שלום {userData.name}!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-purple-600">{userData.totalPoints}</div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-purple-600">{userData.level}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-purple-600">{userData.streak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-purple-600">{userData.todayMinutes}</div>
                  <div className="text-sm text-gray-600">Min Today</div>
                </div>
              </div>
              {userData.todayMinutes < 30 && (
                <div className="mt-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 text-center">
                  <p className="text-yellow-800 font-semibold">
                    🎯 Goal: Study for {30 - userData.todayMinutes} more minutes today!
                  </p>
                </div>
              )}
              {userData.todayMinutes >= 30 && (
                <div className="mt-4 bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold">
                    ✅ Great job! You reached your daily goal!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {userData.name && (
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => { setCurrentScreen('alphabet'); startSession(); }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Learn Alphabet</h3>
              <p className="text-purple-100">לִלְמוֹד אָלֶף-בֵּית</p>
            </button>

            <button
              onClick={() => { setCurrentScreen('practice'); startSession(); }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Award className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Practice Reading</h3>
              <p className="text-blue-100">תִּרְגּוּל קְרִיאָה</p>
            </button>

            <button
              onClick={() => { setCurrentScreen('quiz'); startSession(); }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Daily Quiz</h3>
              <p className="text-green-100">בְּדִיקָה יוֹמִית</p>
            </button>

            <button
              onClick={() => setCurrentScreen('progress')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">My Progress</h3>
              <p className="text-orange-100">הַהִתְקַדְּמוּת שֶׁלִּי</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // רכיב לימוד אותיות
  const AlphabetScreen = () => {
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const [showExercise, setShowExercise] = useState(false);
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [exerciseComplete, setExerciseComplete] = useState(false);
    const letter = hebrewAlphabet[currentLetterIndex];

    // יצירת טקסט תרגול עם האות הנוכחית
    const generateExerciseText = () => {
      const practiceLetters = [];
      const targetLetter = letter.letter;
      
      // הוספת האות הנוכחית 5-7 פעמים
      const targetCount = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < targetCount; i++) {
        practiceLetters.push({ letter: targetLetter, isTarget: true, id: `target-${i}` });
      }
      
      // הוספת אותיות אחרות (10-15 אותיות)
      const otherCount = 10 + Math.floor(Math.random() * 6);
      for (let i = 0; i < otherCount; i++) {
        const randomLetter = hebrewAlphabet[Math.floor(Math.random() * hebrewAlphabet.length)].letter;
        if (randomLetter !== targetLetter) {
          practiceLetters.push({ letter: randomLetter, isTarget: false, id: `other-${i}` });
        }
      }
      
      // ערבוב האותיות
      return practiceLetters.sort(() => Math.random() - 0.5);
    };

    const [exerciseText, setExerciseText] = useState([]);

    const nextLetter = () => {
      if (currentLetterIndex < hebrewAlphabet.length - 1) {
        setCurrentLetterIndex(currentLetterIndex + 1);
        setShowExercise(false);
        setExerciseComplete(false);
        setSelectedLetters([]);
        addPoints(10);
        if (!userData.masteredLetters.includes(letter.letter)) {
          setUserData(prev => ({
            ...prev,
            masteredLetters: [...prev.masteredLetters, letter.letter]
          }));
        }
      }
    };

    const startExercise = () => {
      setShowExercise(true);
      setSelectedLetters([]);
      setExerciseComplete(false);
      setExerciseText(generateExerciseText());
    };

    const handleLetterClick = (letterObj) => {
      if (exerciseComplete) return;
      
      if (selectedLetters.includes(letterObj.id)) {
        setSelectedLetters(selectedLetters.filter(id => id !== letterObj.id));
      } else {
        setSelectedLetters([...selectedLetters, letterObj.id]);
      }
    };

    const checkExercise = () => {
      const correctIds = exerciseText.filter(l => l.isTarget).map(l => l.id);
      const isCorrect = correctIds.length === selectedLetters.length && 
                       correctIds.every(id => selectedLetters.includes(id));
      
      setExerciseComplete(true);
      if (isCorrect) {
        addPoints(25);
      }
    };

    const getLetterClassName = (letterObj) => {
      if (!exerciseComplete) {
        return selectedLetters.includes(letterObj.id)
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800';
      } else {
        if (letterObj.isTarget && selectedLetters.includes(letterObj.id)) {
          return 'bg-green-500 text-white'; // נכון - סימנו נכון
        } else if (letterObj.isTarget && !selectedLetters.includes(letterObj.id)) {
          return 'bg-orange-500 text-white'; // פספסו
        } else if (!letterObj.isTarget && selectedLetters.includes(letterObj.id)) {
          return 'bg-red-500 text-white'; // טעות - סימנו לא נכון
        } else {
          return 'bg-gray-100 text-gray-800'; // לא רלוונטי
        }
      }
    };

    const nextLetter = () => {
      if (currentLetterIndex < hebrewAlphabet.length - 1) {
        setCurrentLetterIndex(currentLetterIndex + 1);
        setShowExercise(false);
        setExerciseComplete(false);
        setSelectedLetters([]);
        addPoints(10);
        if (!userData.masteredLetters.includes(letter.letter)) {
          setUserData(prev => ({
            ...prev,
            masteredLetters: [...prev.masteredLetters, letter.letter]
          }));
        }
      }
    };

    if (showExercise) {
      const targetCount = exerciseText.filter(l => l.isTarget).length;
      const correctSelections = exerciseText.filter(l => l.isTarget && selectedLetters.includes(l.id)).length;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setShowExercise(false)}
              className="mb-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              ← Back to Letter
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-purple-600 mb-2">
                  Find the Letter Exercise
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  Click on all the <span className="text-4xl font-bold text-purple-600">{letter.letter}</span> letters you can find!
                </p>
                <div className="bg-purple-100 rounded-lg p-4 inline-block">
                  <p className="text-lg font-semibold text-purple-800">
                    Found: {correctSelections} / {targetCount}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 mb-6">
                <div className="flex flex-wrap justify-center gap-3">
                  {exerciseText.map((letterObj) => (
                    <button
                      key={letterObj.id}
                      onClick={() => handleLetterClick(letterObj)}
                      disabled={exerciseComplete}
                      className={`text-5xl font-bold p-4 rounded-lg transition-all transform hover:scale-110 cursor-pointer ${getLetterClassName(letterObj)}`}
                    >
                      {letterObj.letter}
                    </button>
                  ))}
                </div>
              </div>

              {exerciseComplete && (
                <div className={`rounded-xl p-6 mb-6 text-center ${
                  correctSelections === targetCount && selectedLetters.length === targetCount
                    ? 'bg-green-100 border-2 border-green-400'
                    : 'bg-orange-100 border-2 border-orange-400'
                }`}>
                  {correctSelections === targetCount && selectedLetters.length === targetCount ? (
                    <div>
                      <h3 className="text-2xl font-bold text-green-700 mb-2">🎉 Perfect!</h3>
                      <p className="text-green-800">You found all the letters correctly! +25 points!</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700 mb-2">Good try!</h3>
                      <p className="text-orange-800">
                        Green = Correct, Orange = Missed, Red = Wrong selection
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-4">
                {!exerciseComplete ? (
                  <>
                    <button
                      onClick={() => { setSelectedLetters([]); }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={checkExercise}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Check Answer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startExercise}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={nextLetter}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {currentLetterIndex === hebrewAlphabet.length - 1 ? 'Finish' : 'Next Letter'} →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentScreen('home')}
            className="mb-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            ← Back to Home
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-purple-600 mb-2">
                Learn Hebrew Letters
              </h2>
              <p className="text-gray-600">Letter {currentLetterIndex + 1} of {hebrewAlphabet.length}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-12 mb-6 text-center">
              <div className="text-9xl font-bold mb-4 text-purple-600">
                {letter.letter}
              </div>
              <button
                onClick={() => speak(letter.name)}
                className="mb-4 p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all transform hover:scale-110 shadow-lg"
                title="Click to hear pronunciation"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <div className="text-4xl mb-4 text-purple-500">
                {letter.name}
              </div>
              <div className="text-2xl text-gray-700">
                Sound: <span className="font-semibold">{letter.sound}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-3 text-yellow-800">💡 Practice Writing:</h3>
              <div className="text-6xl font-bold text-center text-gray-300 mb-4">
                {letter.letter} {letter.letter} {letter.letter}
              </div>
              <p className="text-center text-gray-600">
                Trace the letter above with your finger!
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-3 text-blue-800">🎯 Ready to Practice?</h3>
              <p className="text-center text-gray-700 mb-4">
                Test your skills by finding this letter in a group!
              </p>
              <button
                onClick={startExercise}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Start Letter Hunt 🔍
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentLetterIndex(Math.max(0, currentLetterIndex - 1))}
                disabled={currentLetterIndex === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextLetter}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {currentLetterIndex === hebrewAlphabet.length - 1 ? 'Finish' : 'Next Letter'} →
              </button>
            </div>

            <div className="mt-6 bg-green-100 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">
                🌟 +10 points per letter learned! +25 points for perfect exercise!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // רכיב תרגול קריאה
  const PracticeScreen = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const word = simpleWords[currentWordIndex];

    const nextWord = () => {
      if (currentWordIndex < simpleWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setShowTranslation(false);
        addPoints(15);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentScreen('home')}
            className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Home
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-blue-600 mb-2">
                Practice Reading Words
              </h2>
              <p className="text-gray-600">Word {currentWordIndex + 1} of {simpleWords.length}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-12 mb-6 text-center">
              <div className="text-8xl font-bold mb-6 text-blue-600">
                {word.word}
              </div>
              <button
                onClick={() => speak(word.word)}
                className="mb-6 p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg"
                title="Click to hear pronunciation"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xl"
              >
                {showTranslation ? 'Hide' : 'Show'} Translation
              </button>
              {showTranslation && (
                <div className="mt-6 text-3xl font-semibold text-blue-700">
                  {word.translation}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-3 text-yellow-800">💡 Reading Tip:</h3>
              <p className="text-gray-700">
                Hebrew is read from right to left (←). Take your time and sound out each letter!
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => { setCurrentWordIndex(Math.max(0, currentWordIndex - 1)); setShowTranslation(false); }}
                disabled={currentWordIndex === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextWord}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {currentWordIndex === simpleWords.length - 1 ? 'Finish' : 'Next Word'} →
              </button>
            </div>

            <div className="mt-6 bg-green-100 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">
                🌟 +15 points per word practiced!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // רכיב בדיקה יומית
  const QuizScreen = () => {
    const [quizQuestions] = useState(() => {
      // יצירת 5 שאלות רנדומליות
      const questions = [];
      const usedIndices = new Set();
      
      while (questions.length < 5 && usedIndices.size < hebrewAlphabet.length) {
        const randomIndex = Math.floor(Math.random() * hebrewAlphabet.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          const correct = hebrewAlphabet[randomIndex];
          
          // יצירת תשובות שגויות
          const wrongAnswers = [];
          while (wrongAnswers.length < 3) {
            const wrongIndex = Math.floor(Math.random() * hebrewAlphabet.length);
            if (wrongIndex !== randomIndex && !wrongAnswers.some(w => w.letter === hebrewAlphabet[wrongIndex].letter)) {
              wrongAnswers.push(hebrewAlphabet[wrongIndex]);
            }
          }
          
          const allAnswers = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);
          
          questions.push({
            letter: correct.letter,
            correctSound: correct.sound,
            answers: allAnswers
          });
        }
      }
      
      return questions;
    });

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleAnswer = (answer) => {
      setSelectedAnswer(answer);
      setAnswered(true);
      
      if (answer.letter === quizQuestions[currentQuestion].letter) {
        setScore(score + 1);
        addPoints(20);
      }
    };

    const nextQuestion = () => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        setDailyQuizScore(score + (selectedAnswer?.letter === quizQuestions[currentQuestion].letter ? 1 : 0));
      }
    };

    if (dailyQuizScore !== null) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Quiz Complete!
              </h2>
              <div className="text-6xl font-bold text-green-600 mb-6">
                {dailyQuizScore} / {quizQuestions.length}
              </div>
              <p className="text-2xl text-gray-700 mb-8">
                {dailyQuizScore === quizQuestions.length ? 'Perfect score! 🎉' : 
                 dailyQuizScore >= 3 ? 'Great job! 👏' : 'Keep practicing! 💪'}
              </p>
              <button
                onClick={() => { setCurrentScreen('home'); setDailyQuizScore(null); }}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xl"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    const question = quizQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentScreen('home')}
            className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ← Back to Home
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Daily Quiz
              </h2>
              <p className="text-gray-600">Question {currentQuestion + 1} of {quizQuestions.length}</p>
              <p className="text-xl font-semibold text-green-600 mt-2">Score: {score}</p>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-12 mb-6 text-center">
              <p className="text-2xl mb-6 text-gray-700">What is the sound of this letter?</p>
              <div className="text-9xl font-bold text-green-600 mb-4">
                {question.letter}
              </div>
              <button
                onClick={() => speak(hebrewAlphabet.find(l => l.letter === question.letter)?.name || question.letter)}
                className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:scale-110 shadow-lg"
                title="Click to hear pronunciation"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {question.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => !answered && handleAnswer(answer)}
                  disabled={answered}
                  className={`p-6 rounded-xl text-xl font-semibold transition-all ${
                    answered
                      ? answer.letter === question.letter
                        ? 'bg-green-500 text-white'
                        : answer === selectedAnswer
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {answer.sound}
                </button>
              ))}
            </div>

            {answered && (
              <button
                onClick={nextQuestion}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xl font-semibold"
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // רכיב התקדמות
  const ProgressScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentScreen('home')}
          className="mb-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-orange-600 mb-8 text-center">
            My Progress - הַהִתְקַדְּמוּת שֶׁלִּי
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6">
              <Trophy className="w-12 h-12 mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Total Points</h3>
              <p className="text-4xl font-bold text-purple-700">{userData.totalPoints}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6">
              <Star className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Current Level</h3>
              <p className="text-4xl font-bold text-blue-700">{userData.level}</p>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-6">
              <Award className="w-12 h-12 mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-green-600 mb-2">Day Streak</h3>
              <p className="text-4xl font-bold text-green-700">{userData.streak} 🔥</p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-6">
              <Clock className="w-12 h-12 mb-4 text-orange-600" />
              <h3 className="text-2xl font-bold text-orange-600 mb-2">Today's Time</h3>
              <p className="text-4xl font-bold text-orange-700">{userData.todayMinutes} min</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-yellow-800 mb-4">Mastered Letters</h3>
            <p className="text-xl mb-4 text-gray-700">
              {userData.masteredLetters.length} / {hebrewAlphabet.length} letters learned
            </p>
            <div className="bg-white rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {hebrewAlphabet.map((letter, index) => (
                  <span
                    key={index}
                    className={`text-3xl font-bold p-2 rounded ${
                      userData.masteredLetters.includes(letter.letter)
                        ? 'bg-green-200 text-green-700'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {letter.letter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Achievements</h3>
            <div className="space-y-3">
              {userData.totalPoints >= 100 && (
                <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="font-bold text-gray-800">Century Club</p>
                    <p className="text-sm text-gray-600">Earned 100+ points</p>
                  </div>
                </div>
              )}
              {userData.streak >= 7 && (
                <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <Award className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="font-bold text-gray-800">Week Warrior</p>
                    <p className="text-sm text-gray-600">7 day streak!</p>
                  </div>
                </div>
              )}
              {userData.masteredLetters.length >= 22 && (
                <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                  <Star className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="font-bold text-gray-800">Alphabet Master</p>
                    <p className="text-sm text-gray-600">Learned all letters!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // רינדור המסך הנוכחי
  return (
    <div className="font-sans">
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'alphabet' && <AlphabetScreen />}
      {currentScreen === 'practice' && <PracticeScreen />}
      {currentScreen === 'quiz' && <QuizScreen />}
      {currentScreen === 'progress' && <ProgressScreen />}
    </div>
  );
};

export default HebrewLearningApp;