import { User, Bell, Shield, Sparkles } from 'lucide-react';
import { mockUser } from '../lib/mockData';

export default function Settings() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-dark-50 mb-2">
                    Settings
                </h1>
                <p className="text-dark-400">
                    Manage your account and preferences
                </p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Account */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-dark-50">
                            Account
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={mockUser.email}
                                disabled
                                className="input opacity-50 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                defaultValue={mockUser.name}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-dark-50">
                            Notifications
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <ToggleSetting
                            label="Daily Digest"
                            description="Receive a daily summary of your inbox"
                            defaultChecked={true}
                        />
                        <ToggleSetting
                            label="Weekly Digest"
                            description="Receive a weekly summary of your inbox"
                            defaultChecked={true}
                        />
                        <ToggleSetting
                            label="Subscription Alerts"
                            description="Get notified about new subscriptions detected"
                            defaultChecked={false}
                        />
                    </div>
                </div>

                {/* Privacy */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-dark-50">
                            Privacy
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <ToggleSetting
                            label="Gemini Local Mode"
                            description="Minimize data sent to AI models"
                            defaultChecked={false}
                        />
                    </div>
                </div>

                {/* AI Settings */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-dark-50">
                            AI Settings
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                AI Model
                            </label>
                            <select className="input">
                                <option>Gemini 1.5 Pro (Recommended)</option>
                                <option>Gemini 1.5 Flash (Faster)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="btn-primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleSetting({ label, description, defaultChecked }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors">
            <div>
                <p className="font-medium text-dark-200">{label}</p>
                <p className="text-sm text-dark-500 mt-1">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-600 peer-checked:to-primary-500"></div>
            </label>
        </div>
    );
}
