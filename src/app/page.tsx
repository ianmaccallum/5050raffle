"use client"

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, X, Info } from 'lucide-react';
import Head from 'next/head';
import BannerContainer from '@/components/BannerContainer';

export interface Participant {
  name: string;
  email: string;
  phone: string;
  amount: number;
}

export interface RaffleResult {
  totalAmount: string;
  charityAmount: string;
  winnerAmount: string;
  winner: {
    name: string;
    email: string;
    phone: string;
    originalContribution: string;
    winningChancePercentage: string;
  };
}


const DEFAULT_PARTICIPANT: Participant = {
  name: '',
  email: '',
  phone: '',
  amount: 0
};

const RaffleApp: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState<Participant>(DEFAULT_PARTICIPANT);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkInput, setShowBulkInput] = useState<boolean>(false);
  const [result, setResult] = useState<RaffleResult | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [drawCount, setDrawCount] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('raffleParticipants');
    const savedCount = localStorage.getItem('raffleDrawCount');
    if (savedData) {
      setParticipants(JSON.parse(savedData));
    }
    if (savedCount) {
      setDrawCount(parseInt(savedCount));
    }
  }, []);

  // Save to localStorage whenever participants or draw count changes
  useEffect(() => {
    localStorage.setItem('raffleParticipants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('raffleDrawCount', drawCount.toString());
  }, [drawCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!editingParticipant) return;
    const { name, value } = e.target;
    setEditingParticipant(prev => ({
      ...prev!,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const startEditing = (index: number): void => {
    setEditingIndex(index);
    setEditingParticipant({ ...participants[index] });
  };

  const cancelEditing = (): void => {
    setEditingIndex(null);
    setEditingParticipant(null);
  };

  const saveEdit = (index: number): void => {
    if (!editingParticipant || !editingParticipant.name || !editingParticipant.amount) return;

    const updatedParticipants = [...participants];
    updatedParticipants[index] = editingParticipant;
    setParticipants(updatedParticipants);
    setEditingIndex(null);
    setEditingParticipant(null);
  };

  const deleteParticipant = (index: number): void => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };

  const addParticipant = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newParticipant.name || !newParticipant.amount) return;

    setParticipants(prev => [...prev, newParticipant]);
    setNewParticipant(DEFAULT_PARTICIPANT);
  };

  const parseLineContent = (line: string): Participant => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/;
    const amountRegex = /\$?\s*(\d+(?:\.\d{1,2})?)/;

    let content = line;
    let email = '';
    let phone = '';
    let amount = 0;

    // Extract email
    const emailMatch = content.match(emailRegex);
    if (emailMatch) {
      email = emailMatch[0];
      content = content.replace(email, '');
    }

    // Extract phone
    const phoneMatch = content.match(phoneRegex);
    if (phoneMatch) {
      phone = phoneMatch[0];
      content = content.replace(phone, '');
    }

    // Extract amount
    const amountMatch = content.match(amountRegex);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
      content = content.replace(amountMatch[0], '');
    } else {
      throw new Error('No valid amount found');
    }

    // Clean up remaining content for name
    const name = content
      .replace(/[,|;]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name) {
      throw new Error('No valid name found');
    }

    return {
      name,
      email,
      phone,
      amount
    };
  };

  const handleBulkImport = (): void => {
    setImportError('');
    const lines = bulkInput.split('\n').filter(line => line.trim());
    const newParticipants: Participant[] = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const participant = parseLineContent(lines[i]);
        newParticipants.push(participant);
      } catch (error) {
        setImportError(`Error on line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setParticipants(prev => [...prev, ...newParticipants]);
    setBulkInput('');
    setShowBulkInput(false);
  };

  const runRaffle = (): void => {
    if (participants.length === 0) return;

    const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);
    const charityAmount = totalAmount / 2;
    const winnerAmount = totalAmount / 2;

    const chances: Participant[] = [];
    participants.forEach(participant => {
      for (let i = 0; i < participant.amount; i++) {
        chances.push(participant);
      }
    });

    const randomIndex = Math.floor(Math.random() * chances.length);
    const winner = chances[randomIndex];
    const winnerPercentage = ((winner.amount / totalAmount) * 100).toFixed(2);

    setResult({
      totalAmount: totalAmount.toFixed(2),
      charityAmount: charityAmount.toFixed(2),
      winnerAmount: winnerAmount.toFixed(2),
      winner: {
        ...winner,
        originalContribution: winner.amount.toFixed(2),
        winningChancePercentage: winnerPercentage
      }
    });
    setDrawCount(prev => prev + 1);
  };

  const clearAll = (): void => {
    setParticipants([]);
    setResult(null);
    setDrawCount(0);
    localStorage.removeItem('raffleParticipants');
    localStorage.removeItem('raffleDrawCount');
  };

  return (
    <>
      <Head>
        <title>50/50 Raffle App - Fair and Transparent Fundraising</title>
        <meta name="description" content="Run a fair and transparent 50/50 raffle for your fundraising event. Easy entry, automatic winner selection, and detailed statistics. Perfect for charities and fundraisers." />
        <meta name="keywords" content="50/50 raffle, fundraising, charity raffle, electronic raffle, fundraising tool" />
        <meta property="og:title" content="50/50 Raffle App" />
        <meta property="og:description" content="Run a fair and transparent 50/50 raffle for your fundraising event. Easy entry, automatic winner selection, and detailed statistics." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">50/50 Raffle</h1>
          <div className="flex items-center gap-4">
            <div className="text-gray-600 dark:text-gray-400">
              Total Draws: {drawCount}
            </div>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <Info size={18} />
              How it Works
            </button>
          </div>
        </div>

        {/* How it Works Section */}
        {showHowItWorks && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">How the 50/50 Raffle Works</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2 dark:text-white">1. Entry & Contributions</h3>
                <p className="dark:text-gray-300">Participants can enter the raffle by contributing any amount. Each dollar contributed equals one entry in the raffle, increasing your chances of winning proportionally to your contribution.</p>
              </div>

              <div>
                <h3 className="font-bold mb-2 dark:text-white">2. Prize Pool</h3>
                <p className="dark:text-gray-300">The total amount collected is split 50/50:
                  <br />• 50% goes to the winning participant
                  <br />• 50% goes to the designated charity or cause</p>
              </div>

              <div>
                <h3 className="font-bold mb-2 dark:text-white">3. Winner Selection</h3>
                <p className="dark:text-gray-300">Winners are selected randomly, but fairly. Your chances of winning are directly proportional to your contribution amount. For example, if you contributed 20% of the total pool, you have a 20% chance of winning.</p>
              </div>

              <div>
                <h3 className="font-bold mb-2 dark:text-white">4. Transparency</h3>
                <p className="dark:text-gray-300">All entries are visible in the table below. The draw process is automated and random, ensuring complete fairness. Results show full statistics including the winner&apos;s original contribution and winning chances.</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={addParticipant} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              name="name"
              value={newParticipant.name}
              onChange={handleInputChange}
              placeholder="Name (required)"
              className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
            <input
              type="email"
              name="email"
              value={newParticipant.email}
              onChange={handleInputChange}
              placeholder="Email (optional)"
              className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <input
              type="tel"
              name="phone"
              value={newParticipant.phone}
              onChange={handleInputChange}
              placeholder="Phone (optional)"
              className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                value={newParticipant.amount || ''}
                onChange={handleInputChange}
                placeholder="Amount ($)"
                className="border p-2 rounded flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
                min="0"
                step="0.01"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showBulkInput ? 'Hide Bulk Import' : 'Show Bulk Import'}
            </button>
          </div>

          {showBulkInput && (
            <div className="mb-4">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Enter one entry per line. Each line should contain a name and amount. Email and phone are optional and will be automatically detected."
                className="w-full h-32 border p-2 rounded mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {importError && (
                <div className="text-red-500 dark:text-red-400 mb-2">{importError}</div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Example formats:
                <br />
                John Doe $50
                <br />
                jane@email.com Jane Smith; 100
                <br />
                Bob Wilson 555-123-4567 $25
                <br />
                Alice Brown alice@email.com (123) 456-7890 $25
              </div>
              <button
                onClick={handleBulkImport}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Import
              </button>
            </div>
          )}
        </div>

        {/* Participants Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border dark:border-gray-700 p-2 text-left">Name</th>
                <th className="border dark:border-gray-700 p-2 text-left">Email</th>
                <th className="border dark:border-gray-700 p-2 text-left">Phone</th>
                <th className="border dark:border-gray-700 p-2 text-right">Amount</th>
                <th className="border dark:border-gray-700 p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {editingIndex === index ? (
                    <>
                      <td className="border dark:border-gray-700 p-2">
                        <input
                          type="text"
                          name="name"
                          value={editingParticipant?.name}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="border dark:border-gray-700 p-2">
                        <input
                          type="email"
                          name="email"
                          value={editingParticipant?.email}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="border dark:border-gray-700 p-2">
                        <input
                          type="tel"
                          name="phone"
                          value={editingParticipant?.phone}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="border dark:border-gray-700 p-2">
                        <input
                          type="number"
                          name="amount"
                          value={editingParticipant?.amount || ''}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded text-right dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="border dark:border-gray-700 p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(index)}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border dark:border-gray-700 p-2">{p.name}</td>
                      <td className="border dark:border-gray-700 p-2">{p.email}</td>
                      <td className="border dark:border-gray-700 p-2">{p.phone}</td>
                      <td className="border dark:border-gray-700 p-2 text-right">${p.amount.toFixed(2)}</td>
                      <td className="border dark:border-gray-700 p-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditing(index)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteParticipant(index)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={runRaffle}
            disabled={participants.length === 0}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-700"
          >
            Draw Winner
          </button>
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Raffle Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2 dark:text-white">Summary</h3>
                <p className="dark:text-gray-300">Total Amount Raised: ${result.totalAmount}</p>
                <p className="dark:text-gray-300">Amount to Charity: ${result.charityAmount}</p>
                <p className="dark:text-gray-300">Prize Amount: ${result.winnerAmount}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 dark:text-white">Winner</h3>
                <p className="dark:text-gray-300">Name: {result.winner.name}</p>
                {result.winner.email && <p className="dark:text-gray-300">Email: {result.winner.email}</p>}
                {result.winner.phone && <p className="dark:text-gray-300">Phone: {result.winner.phone}</p>}
                <p className="dark:text-gray-300">Original Contribution: ${result.winner.originalContribution}</p>
                <p className="dark:text-gray-300">Winning Chance: {result.winner.winningChancePercentage}%</p>
              </div>
            </div>
          </div>
        )}

        <BannerContainer />
      </div>
    </>
  );
};

export default RaffleApp;