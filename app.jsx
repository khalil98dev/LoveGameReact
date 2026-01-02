const { useState, useEffect } = React;

// Icons
const Heart = ({ className, fill }) => (
  <svg className={className} fill={fill || "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Sparkles = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RotateCcw = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const History = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GitHub = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// GitHub Configuration - IMPORTANT: Replace with your actual token
const GITHUB_CONFIG = {
  owner: 'khalil98dev',
  repo: 'LoveGameReact',
  token: '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', // Replace with your actual GitHub token
  filePath: 'plays.json'
};

const LoveCalculatorGame = () => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState({ totalPlays: 0, uniqueDevices: 0 });
  const [fileSha, setFileSha] = useState('');
  const [githubStatus, setGithubStatus] = useState('loading'); // loading, connected, error

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Get or create device ID from localStorage
  const getDeviceId = () => {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = generateUUID();
      localStorage.setItem('device_id', id);
    }
    return id;
  };

  // Test GitHub connection
  const testGitHubConnection = async () => {
    try {
      setGithubStatus('loading');
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (response.ok) {
        console.log('✅ GitHub repository accessible');
        return true;
      } else {
        console.error('❌ Cannot access repository:', response.status);
        setGithubStatus('error');
        return false;
      }
    } catch (error) {
      console.error('❌ GitHub connection error:', error);
      setGithubStatus('error');
      return false;
    }
  };

  // Load data from GitHub
  const loadFromGitHub = async () => {
    try {
      setGithubStatus('loading');
      
      // First, test if we can access the repo
      const canAccess = await testGitHubConnection();
      if (!canAccess) {
        console.log('Using local data only');
        loadLocalData();
        return;
      }

      // Try to get the file
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFileSha(data.sha);
        
        // Decode base64 content
        try {
          const decodedContent = atob(data.content.replace(/\n/g, ''));
          const content = JSON.parse(decodedContent);
          
          setStats({
            totalPlays: content.stats.totalPlays || 0,
            uniqueDevices: content.stats.uniqueDevices || 0
          });
          
          setGithubStatus('connected');
          console.log('✅ Data loaded from GitHub:', content);
        } catch (parseError) {
          console.error('Error parsing GitHub data:', parseError);
          loadLocalData();
        }
      } else if (response.status === 404) {
        // File doesn't exist yet - that's okay
        console.log('📝 plays.json not found, will create on first save');
        setGithubStatus('connected');
      } else {
        console.error('GitHub API error:', response.status);
        setGithubStatus('error');
        loadLocalData();
      }
    } catch (error) {
      console.error('Error loading from GitHub:', error);
      setGithubStatus('error');
      loadLocalData();
    }
  };

  // Load data from localStorage only
  const loadLocalData = () => {
    // Load personal history from localStorage
    const localHistory = localStorage.getItem('game_history');
    if (localHistory) {
      try {
        const parsedHistory = JSON.parse(localHistory);
        setHistory(parsedHistory);
        
        // Calculate stats from local history
        const devices = new Set();
        parsedHistory.forEach(play => {
          if (play.deviceId) devices.add(play.deviceId);
        });
        
        setStats({
          totalPlays: parsedHistory.length,
          uniqueDevices: devices.size
        });
      } catch (e) {
        console.error('Error parsing local history:', e);
      }
    }
  };

  // Save data to GitHub
  const saveToGitHub = async (gameData) => {
    try {
      let currentContent = {
        devices: [],
        plays: [],
        stats: { totalPlays: 0, uniqueDevices: 0 }
      };
      let sha = fileSha;

      // Try to get existing file if we have a SHA
      if (sha) {
        try {
          const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          
          if (getResponse.ok) {
            const currentFile = await getResponse.json();
            const decodedContent = atob(currentFile.content.replace(/\n/g, ''));
            currentContent = JSON.parse(decodedContent);
            sha = currentFile.sha;
          }
        } catch (error) {
          console.log('Creating new file, could not fetch existing');
        }
      }

      // Update content
      const deviceSet = new Set(currentContent.devices);
      deviceSet.add(deviceId);
      currentContent.devices = Array.from(deviceSet);
      currentContent.plays.push(gameData);
      currentContent.stats.totalPlays = currentContent.plays.length;
      currentContent.stats.uniqueDevices = deviceSet.size;

      // Convert to base64
      const contentStr = JSON.stringify(currentContent, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(contentStr)));

      // Prepare request body
      const requestBody = {
        message: `New play: ${gameData.name1} ❤️ ${gameData.name2} = ${gameData.percentage}%`,
        content: base64Content,
        sha: sha || undefined
      };

      // Remove sha if it's empty string
      if (!sha) delete requestBody.sha;

      // Commit changes to GitHub
      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (updateResponse.ok) {
        const updatedFile = await updateResponse.json();
        setFileSha(updatedFile.sha);
        console.log('✅ Data saved to GitHub!');
        setStats({
          totalPlays: currentContent.stats.totalPlays,
          uniqueDevices: currentContent.stats.uniqueDevices
        });
        setGithubStatus('connected');
        return true;
      } else {
        const errorData = await updateResponse.json();
        console.error('❌ GitHub API error:', errorData);
        setGithubStatus('error');
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving to GitHub:', error);
      setGithubStatus('error');
      return false;
    }
  };

  // Initialize
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    
    // Load personal history from localStorage immediately
    const localHistory = localStorage.getItem('game_history');
    if (localHistory) {
      try {
        setHistory(JSON.parse(localHistory));
      } catch (e) {
        console.error('Error parsing local history:', e);
      }
    }
    
    // Then try to load from GitHub
    loadFromGitHub();
  }, []);

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) {
      alert('Please enter both names! 💕');
      return;
    }

    setIsSpinning(true);
    
    setTimeout(async () => {
      const combined = (name1 + name2).toLowerCase();
      let score = 0;
      
      for (let i = 0; i < combined.length; i++) {
        score += combined.charCodeAt(i);
      }
      
      score += Math.floor(Math.random() * 30);
      const percentage = (score % 101);
      
      const gameData = {
        name1: name1.trim(),
        name2: name2.trim(),
        percentage,
        deviceId,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
      };

      setResult(gameData);

      // Save to localStorage for personal history
      const newHistory = [gameData, ...history].slice(0, 10);
      localStorage.setItem('game_history', JSON.stringify(newHistory));
      setHistory(newHistory);

      // Try to save to GitHub
      const savedToGitHub = await saveToGitHub(gameData);
      
      if (!savedToGitHub) {
        // If GitHub save failed, update local stats
        const devices = new Set();
        newHistory.forEach(play => {
          if (play.deviceId) devices.add(play.deviceId);
        });
        
        setStats({
          totalPlays: newHistory.length,
          uniqueDevices: devices.size
        });
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const getMessage = (percentage) => {
    if (percentage >= 90) return '🔥 Perfect Match! Soul Mates!';
    if (percentage >= 70) return '💖 Great Chemistry! Love is in the air!';
    if (percentage >= 50) return '💕 Good Potential! Give it a try!';
    if (percentage >= 30) return '💛 Friendship First! Build it up!';
    return '💙 Better as friends! But who knows? 😉';
  };

  const resetGame = () => {
    setName1('');
    setName2('');
    setResult(null);
  };

  const retryGitHubConnection = () => {
    loadFromGitHub();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-white animate-pulse" fill="white" />
            <Sparkles className="w-8 h-8 text-yellow-300 ml-2" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Love Calculator</h1>
          <p className="text-white/90 text-sm">Discover your love compatibility! 💘</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-4">
          {!result ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨 First Name
                </label>
                <input
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition"
                  disabled={isSpinning}
                />
              </div>
              
              <div className="flex justify-center">
                <Heart className="w-8 h-8 text-pink-400" fill="currentColor" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👩 Second Name
                </label>
                <input
                  type="text"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Enter second name"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none transition"
                  disabled={isSpinning}
                />
              </div>
              
              <button
                onClick={calculateLove}
                disabled={isSpinning}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all transform ${
                  isSpinning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 hover:shadow-lg'
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 animate-spin mr-2" />
                    Calculating Love...
                  </span>
                ) : (
                  '💕 Calculate Love Percentage'
                )}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-xl">
                  <div className="text-6xl font-bold text-white">{result.percentage}%</div>
                </div>
                <Sparkles className="w-8 h-8 text-yellow-400 absolute top-0 right-1/4 animate-bounce" />
                <Sparkles className="w-6 h-6 text-pink-400 absolute bottom-0 left-1/4 animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {result.name1} 💕 {result.name2}
                </h3>
                <p className="text-xl text-purple-600 font-semibold">
                  {getMessage(result.percentage)}
                </p>
              </div>
              
              <button
                onClick={resetGame}
                className="w-full py-3 rounded-xl font-semibold text-purple-600 border-2 border-purple-600 hover:bg-purple-50 transition"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/90 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="font-bold text-purple-600 text-xl">{stats.totalPlays}</div>
              <div className="text-gray-600">Total Plays</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-pink-600 text-xl">{stats.uniqueDevices}</div>
              <div className="text-gray-600">Unique Devices</div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-purple-100 transition"
            >
              <History className="w-6 h-6 text-purple-600" />
            </button>
          </div>
          
          {/* GitHub Status Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <GitHub className={`w-5 h-5 mr-2 ${
                githubStatus === 'connected' ? 'text-green-500' : 
                githubStatus === 'error' ? 'text-red-500' : 
                'text-gray-400'
              }`} />
              <span className={`text-xs ${
                githubStatus === 'connected' ? 'text-green-600' : 
                githubStatus === 'error' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {githubStatus === 'connected' ? '✅ Connected to GitHub' : 
                 githubStatus === 'error' ? '❌ GitHub offline (using local)' : 
                 '⏳ Connecting...'}
              </span>
              {githubStatus === 'error' && (
                <button 
                  onClick={retryGitHubConnection}
                  className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <div className="bg-white/90 rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">Your History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg text-sm">
                  <div>
                    <span className="font-semibold">{item.name1}</span> 💕{' '}
                    <span className="font-semibold">{item.name2}</span>
                  </div>
                  <div className="font-bold text-purple-600">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-white/70 text-xs">Device ID: {deviceId.substring(0, 8)}...</p>
          <p className="text-white/70 text-xs mt-1">📁 Data saved to: {githubStatus === 'connected' ? 'GitHub' : 'Local Storage'}</p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<LoveCalculatorGame />, document.getElementById('root'));
