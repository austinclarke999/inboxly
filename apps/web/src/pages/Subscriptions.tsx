import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, Calendar, AlertCircle, Trash2, CheckSquare, Square } from 'lucide-react';
import { mockSubscriptions } from '../lib/mockData';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
    const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());

    const billingSubscriptions = subscriptions.filter(s => s.isBilling);
    const totalMonthly = billingSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const annualForecast = totalMonthly * 12;

    const toggleSub = (id: string) => {
        const newSelected = new Set(selectedSubs);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedSubs(newSelected);
    };

    const handleBulkUnsubscribe = () => {
        const unsubscribedIds = Array.from(selectedSubs);
        setSubscriptions(subscriptions.filter(s => !unsubscribedIds.includes(s.id)));
        setSelectedSubs(new Set());
    };

    const handleUnsubscribe = (id: string) => {
        setSubscriptions(subscriptions.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-dark-50 mb-2">
                    Subscriptions
                </h1>
                <p className="text-dark-400">
                    Track and manage your email subscriptions and billing
                </p>
            </div>

            {/* Spending Summary */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                    className="glass-card p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Monthly Total</p>
                            <motion.p
                                className="text-2xl font-bold text-dark-50"
                                key={totalMonthly}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                ${totalMonthly.toFixed(2)}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Annual Forecast</p>
                            <p className="text-2xl font-bold text-dark-50">
                                ${annualForecast.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-400">Active Subscriptions</p>
                            <motion.p
                                className="text-2xl font-bold text-dark-50"
                                key={subscriptions.length}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                {subscriptions.length}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Subscriptions List */}
            <div className="glass-card">
                <div className="p-6 border-b border-dark-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-display font-bold text-dark-50">
                            Active Subscriptions
                        </h2>
                        {selectedSubs.size > 0 && (
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={handleBulkUnsubscribe}
                                className="btn-danger"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Bulk Unsubscribe ({selectedSubs.size})
                            </motion.button>
                        )}
                    </div>
                </div>

                <div className="divide-y divide-dark-800">
                    <AnimatePresence>
                        {subscriptions.map((sub, index) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 hover:bg-dark-800/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedSubs.has(sub.id)}
                                            onChange={() => toggleSub(sub.id)}
                                            className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                        />

                                        {/* Subscription Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-dark-100 mb-1">
                                                        {sub.name}
                                                    </h3>
                                                    <p className="text-sm text-dark-500">{sub.email}</p>
                                                </div>
                                                {sub.isBilling && (
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-dark-100">
                                                            ${sub.amount}
                                                        </p>
                                                        <p className="text-xs text-dark-500">/{sub.billingCycle}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-3 mt-4">
                                                {sub.nextBilling && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-dark-500" />
                                                        <span className="text-dark-400">
                                                            Next billing: {new Date(sub.nextBilling).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm">
                                                    <AlertCircle className="w-4 h-4 text-dark-500" />
                                                    <span className="text-dark-400">
                                                        {sub.emailCount} emails • {sub.frequency}
                                                    </span>
                                                </div>
                                                {sub.isBilling && (
                                                    <span className="badge-success">Billing</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handleUnsubscribe(sub.id)}
                                        className="btn-secondary text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                    >
                                        Unsubscribe
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
