import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Trash2, Archive, Star, CheckSquare, Square } from 'lucide-react';
import { mockEmails, mockCategories } from '../lib/mockData';

export default function Inbox() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [emails, setEmails] = useState(mockEmails);
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

    const filteredEmails = selectedCategory === 'all'
        ? emails
        : emails.filter(e => e.category.toLowerCase() === selectedCategory);

    const toggleEmail = (id: string) => {
        const newSelected = new Set(selectedEmails);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEmails(newSelected);
    };

    const toggleAll = () => {
        if (selectedEmails.size === filteredEmails.length) {
            setSelectedEmails(new Set());
        } else {
            setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
        }
    };

    const handleBulkUnsubscribe = () => {
        const unsubscribedIds = Array.from(selectedEmails);
        setEmails(emails.filter(e => !unsubscribedIds.includes(e.id)));
        setSelectedEmails(new Set());
    };

    const handleArchive = (id: string) => {
        setEmails(emails.filter(e => e.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-dark-50 mb-2">
                        Inbox
                    </h1>
                    <p className="text-dark-400">
                        {filteredEmails.length} emails • AI-powered organization
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary">
                        <Filter className="w-5 h-5 mr-2" />
                        Filter
                    </button>
                    {selectedEmails.size > 0 && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleBulkUnsubscribe}
                            className="btn-danger"
                        >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Unsubscribe ({selectedEmails.size})
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {mockCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${selectedCategory === category.id
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                            }`}
                    >
                        {category.label}
                        <span className="ml-2 text-xs opacity-75">({category.count})</span>
                    </button>
                ))}
            </div>

            {/* Email List */}
            <div className="glass-card">
                {/* Select All Header */}
                <div className="p-4 border-b border-dark-800 flex items-center gap-3">
                    <button
                        onClick={toggleAll}
                        className="text-dark-400 hover:text-dark-200 transition-colors"
                    >
                        {selectedEmails.size === filteredEmails.length ? (
                            <CheckSquare className="w-5 h-5" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                    </button>
                    <span className="text-sm text-dark-400">
                        {selectedEmails.size > 0
                            ? `${selectedEmails.size} selected`
                            : 'Select all'}
                    </span>
                </div>

                <div className="divide-y divide-dark-800">
                    <AnimatePresence>
                        {filteredEmails.map((email, index) => (
                            <motion.div
                                key={email.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 hover:bg-dark-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.has(email.id)}
                                        onChange={() => toggleEmail(email.id)}
                                        className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900"
                                    />

                                    {/* Email Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-dark-200 truncate">
                                                    {email.from}
                                                </p>
                                                <p className="text-sm text-dark-400 mt-1">{email.subject}</p>
                                            </div>
                                            <span className="text-xs text-dark-500 whitespace-nowrap">
                                                {email.time}
                                            </span>
                                        </div>

                                        <p className="text-sm text-dark-500 line-clamp-1 mb-3">
                                            {email.snippet}
                                        </p>

                                        {/* Badges & Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 flex-wrap">
                                                {email.isNewsletter && (
                                                    <span className="badge-primary">Newsletter</span>
                                                )}
                                                {email.isPromo && (
                                                    <span className="badge-warning">Promo</span>
                                                )}
                                                <span className="badge bg-dark-800 text-dark-400 border-dark-700">
                                                    {email.category}
                                                </span>
                                                <span
                                                    className={`badge ${email.noiseScore > 50
                                                            ? 'badge-warning'
                                                            : 'badge-success'
                                                        }`}
                                                >
                                                    Noise: {email.noiseScore}%
                                                </span>
                                                <span className="badge badge-primary">
                                                    Importance: {email.importanceScore}%
                                                </span>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-yellow-400 transition-colors">
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(email.id)}
                                                    className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-dark-200 transition-colors"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-dark-700 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
