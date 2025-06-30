import { useState } from 'react';
import axios from 'axios';
import './App.css';
import CodeReviewFeedback from './components/CodeReviewFeedback';
import { DetectLanguage } from './utils/DetectLanguage';

interface ReviewResponse {
  response: {
    feedback: string;
  };
}

function App() {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setFeedback('');

    try {
      const detectedLang = DetectLanguage(code);
      const res = await axios.post<ReviewResponse>('http://localhost:9008/review', {
        code,
        filename: 'index.ts',
        language: detectedLang,
      });

      setFeedback(res.data.response.feedback);
    } catch (err) {
      setFeedback('Something went wrong while reviewing your code.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0f2fe] to-[#ede9fe] p-4 md:p-8">
      <button
        onClick={() => window.location.reload()}
        className="absolute top-4 right-4 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-md shadow-sm transition"
      >
        🔄 Refresh Page
      </button>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Code Reviewer</h1>
          <p className="text-gray-600">Get instant feedback on your code quality and security</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Code</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code to Review
                </label>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>
                      <textarea
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-96 bg-transparent text-gray-100 font-mono focus:outline-none resize-none"
                        placeholder="Paste your code here..."
                        spellCheck="false"
                      />
                    </code>
                  </pre>
                </div>

                {code.trim() && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Detected Language:{' '}
                    <span className="font-semibold text-blue-600">
                      {DetectLanguage(code)}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  loading || !code.trim()
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {loading ? 'Reviewing...' : 'Review Code'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Code Review</h2>
            <CodeReviewFeedback feedback={feedback} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
