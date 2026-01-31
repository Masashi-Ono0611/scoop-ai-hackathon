"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Activity, Heart, TrendingUp, CheckCircle2, ExternalLink } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type HistoryEntry = { weight: number; steps: number; date: string };

export default function Home() {
  const { address, isConnected } = useAccount();
  const [weight, setWeight] = useState("65");
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [steps, setSteps] = useState("8000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ summary: string; tx_hash: string; explorer_url: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/phr/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          data: {
            weight: parseFloat(weight),
            blood_pressure: bloodPressure,
            steps: parseInt(steps),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      const data = await response.json();
      setResult(data);
      
      setHistory((prev: HistoryEntry[]) => [...prev, {
        weight: parseFloat(weight),
        steps: parseInt(steps),
        date: new Date().toLocaleDateString()
      }].slice(-7));
    } catch (error) {
      console.error("Error submitting health data:", error);
      alert("Failed to submit health data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = history.length > 0 ? history : [
    { weight: 65, steps: 7500, date: "Mon" },
    { weight: 65.2, steps: 8200, date: "Tue" },
    { weight: 65.1, steps: 9100, date: "Wed" },
    { weight: 64.9, steps: 8500, date: "Thu" },
    { weight: 64.8, steps: 10200, date: "Fri" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PHR On-Chain</h1>
              <p className="text-sm text-gray-600">Personal Health Records</p>
            </div>
          </div>
          <ConnectButton />
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Weight</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{weight || "—"} <span className="text-lg text-gray-500">kg</span></p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Blood Pressure</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{bloodPressure || "—"}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{steps || "—"}</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Submit Health Data
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 65.5"
                  step="0.1"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (e.g., 120/80)
                </label>
                <input
                  type="text"
                  id="bloodPressure"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 120/80"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-2">
                  Steps (today)
                </label>
                <input
                  type="number"
                  id="steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 8200"
                  required
                  disabled={!isConnected}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!isConnected || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Submit & Anchor On-Chain"}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Health Trends
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Steps History</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                    <Bar dataKey="steps" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Weight Trend</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <h3 className="text-2xl font-semibold text-gray-900">Success!</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  LLM Summary:
                </h4>
                <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {result.summary}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-cyan-500" />
                  Transaction Hash:
                </h4>
                <a
                  href={result.explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <span className="flex-1">{result.tx_hash}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-600">
          <p>Powered by SpoonOS × Base Sepolia</p>
        </footer>
      </div>
    </div>
  );
}
