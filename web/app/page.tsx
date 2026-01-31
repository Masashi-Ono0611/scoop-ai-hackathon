"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [weight, setWeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [steps, setSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ summary: string; tx_hash: string; explorer_url: string } | null>(null);

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
    } catch (error) {
      console.error("Error submitting health data:", error);
      alert("Failed to submit health data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            PHR On-Chain
          </h1>
          <ConnectButton />
        </header>

        <main className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Submit Health Data
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 65.5"
                  step="0.1"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Pressure (e.g., 120/80)
                </label>
                <input
                  type="text"
                  id="bloodPressure"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 120/80"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Steps (today)
                </label>
                <input
                  type="number"
                  id="steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 8200"
                  required
                  disabled={!isConnected}
                />
              </div>

              <button
                type="submit"
                disabled={!isConnected || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit & Anchor On-Chain"}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                ✅ Success!
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    LLM Summary:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {result.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Transaction Hash:
                  </h4>
                  <a
                    href={result.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {result.tx_hash}
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by SpoonOS × Base Sepolia</p>
        </footer>
      </div>
    </div>
  );
}
