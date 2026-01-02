const { useState, useEffect } = React;

// Lucide React icons as components
const Heart = ({ className, fill }) => (
  <svg
    className={className}
    fill={fill || "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const Sparkles = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const RotateCcw = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

const History = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Mock storage for static deployment (uses localStorage)
const mockStorage = {
  async get(key, shared = false) {
    const storageKey = shared ? `shared_${key}` : `local_${key}`;
    const value = localStorage.getItem(storageKey);
    return value ? { key, value, shared } : null;
  },
  async set(key, value, shared = false) {
    const storageKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.setItem(storageKey, value);
    return { key, value, shared };
  },
  async delete(key, shared = false) {
    const storageKey = shared ? `shared_${key}` : `local_${key}`;
    localStorage.removeItem(storageKey);
    return { key, deleted: true, shared };
  },
  async list(prefix = "", shared = false) {
    const keys = [];
    const prefixKey = shared ? `shared_${prefix}` : `local_${prefix}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefixKey)) {
        keys.push(key);
      }
    }
    return { keys, prefix, shared };
  },
};

// Set up mock storage if not available
if (typeof window !== "undefined" && !window.storage) {
  window.storage = mockStorage;
}

const LoveCalculatorGame = () => {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState({ totalPlays: 0, uniqueDevices: 0 });

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  useEffect(() => {
    const loadDeviceData = async () => {
      try {
        const storedId = await window.storage.get("device_id");

        if (storedId && storedId.value) {
          setDeviceId(storedId.value);
        } else {
          const newId = generateUUID();
          await window.storage.set("device_id", newId);
          setDeviceId(newId);
        }

        await loadHistory();
        await loadStats();
      } catch (error) {
        console.error("Storage error:", error);
        setDeviceId(generateUUID());
      }
    };

    loadDeviceData();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await window.storage.get("game_history");
      if (historyData && historyData.value) {
        setHistory(JSON.parse(historyData.value));
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await window.storage.get("game_stats", true);
      if (statsData && statsData.value) {
        setStats(JSON.parse(statsData.value));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const saveGameResult = async (gameData) => {
    try {
      const newHistory = [gameData, ...history].slice(0, 10);
      await window.storage.set("game_history", JSON.stringify(newHistory));
      setHistory(newHistory);

      const currentStats = await window.storage.get("game_stats", true);
      let devices = new Set();
      let plays = 0;

      if (currentStats && currentStats.value) {
        const parsed = JSON.parse(currentStats.value);
        devices = new Set(parsed.devices || []);
        plays = parsed.totalPlays || 0;
      }

      devices.add(deviceId);
      plays += 1;

      const newStats = {
        totalPlays: plays,
        uniqueDevices: devices.size,
        devices: Array.from(devices),
      };

      await window.storage.set("game_stats", JSON.stringify(newStats), true);
      setStats({ totalPlays: plays, uniqueDevices: devices.size });

      const playKey = `play_${Date.now()}_${deviceId.substring(0, 8)}`;
      await window.storage.set(playKey, JSON.stringify(gameData), true);
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) {
      alert("Please enter both names! 💕");
      return;
    }

    setIsSpinning(true);

    setTimeout(() => {
      const combined = (name1 + name2).toLowerCase();
      let score = 0;

      for (let i = 0; i < combined.length; i++) {
        score += combined.charCodeAt(i);
      }

      score += Math.floor(Math.random() * 30);
      const percentage = score % 101;

      const gameData = {
        name1: name1.trim(),
        name2: name2.trim(),
        percentage,
        deviceId,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
      };

      setResult(gameData);
      saveGameResult(gameData);
      setIsSpinning(false);
    }, 2000);
  };

  const getMessage = (percentage) => {
    if (percentage >= 90) return "🔥 Perfect Match! Soul Mates!";
    if (percentage >= 70) return "💖 Great Chemistry! Love is in the air!";
    if (percentage >= 50) return "💕 Good Potential! Give it a try!";
    if (percentage >= 30) return "💛 Friendship First! Build it up!";
    return "💙 Better as friends! But who knows? 😉";
  };

  const resetGame = () => {
    setName1("");
    setName2("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart
              className="w-12 h-12 text-white animate-pulse"
              fill="white"
            />
            <Sparkles className="w-8 h-8 text-yellow-300 ml-2" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Love Calculator
          </h1>
          <p className="text-white/90 text-sm">
            Discover your love compatibility! 💘
          </p>
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
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 animate-spin mr-2" />
                    Calculating Love...
                  </span>
                ) : (
                  "💕 Calculate Love Percentage"
                )}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-xl">
                  <div className="text-6xl font-bold text-white">
                    {result.percentage}%
                  </div>
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
              <div className="font-bold text-purple-600 text-xl">
                {stats.totalPlays}
              </div>
              <div className="text-gray-600">Total Plays</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-pink-600 text-xl">
                {stats.uniqueDevices}
              </div>
              <div className="text-gray-600">Unique Devices</div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-purple-100 transition"
            >
              <History className="w-6 h-6 text-purple-600" />
            </button>
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <div className="bg-white/90 rounded-2xl shadow-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">Your History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-purple-50 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-semibold">{item.name1}</span> 💕{" "}
                    <span className="font-semibold">{item.name2}</span>
                  </div>
                  <div className="font-bold text-purple-600">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-white/70 text-xs">
            Device ID: {deviceId.substring(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<LoveCalculatorGame />, document.getElementById("root"));
