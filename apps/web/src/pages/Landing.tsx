import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Check, Sparkles, Zap, Shield, BarChart3, Clock, Users } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Inboxly</span>
                    </div>
                    <Link
                        to="/app/dashboard"
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                    Your AI email assistant<br />
                    that actually works
                </h1>
                <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Clean up your inbox, unsubscribe from unwanted emails, and track subscriptions—all powered by Google Gemini AI
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        to="/app/dashboard"
                        className="px-6 py-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                        Start for free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-gray-500 text-sm">Dashboard Preview</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">10,000+</p>
                            <p className="text-sm text-gray-600">Active users</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">1M+</p>
                            <p className="text-sm text-gray-600">Emails processed</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">$50K+</p>
                            <p className="text-sm text-gray-600">Saved in subscriptions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Everything you need
                    </h2>
                    <p className="text-gray-600">
                        Powerful features to manage your inbox
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Sparkles className="w-5 h-5" />}
                        title="AI-Powered"
                        description="Automatically categorize and score emails with Gemini AI"
                    />
                    <FeatureCard
                        icon={<Zap className="w-5 h-5" />}
                        title="Bulk Actions"
                        description="Unsubscribe from multiple newsletters at once"
                    />
                    <FeatureCard
                        icon={<Shield className="w-5 h-5" />}
                        title="Secure"
                        description="Your data is encrypted and never shared"
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-5 h-5" />}
                        title="Analytics"
                        description="Track your inbox health and subscription spending"
                    />
                    <FeatureCard
                        icon={<Clock className="w-5 h-5" />}
                        title="Save Time"
                        description="Spend less time managing emails, more time on what matters"
                    />
                    <FeatureCard
                        icon={<Users className="w-5 h-5" />}
                        title="Team Ready"
                        description="Perfect for individuals and teams"
                    />
                </div>
            </section>

            {/* Pricing */}
            <section className="bg-gray-50 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Simple pricing
                        </h2>
                        <p className="text-gray-600">
                            Start for free, upgrade when you need more
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <PricingCard
                            name="Free"
                            price="$0"
                            period="/month"
                            features={[
                                '100 emails/month',
                                'Basic AI analysis',
                                'Email support'
                            ]}
                        />
                        <PricingCard
                            name="Pro"
                            price="$9"
                            period="/month"
                            popular
                            features={[
                                'Unlimited emails',
                                'Advanced AI',
                                'Bulk unsubscribe',
                                'Priority support'
                            ]}
                        />
                        <PricingCard
                            name="Enterprise"
                            price="Custom"
                            period=""
                            features={[
                                'Everything in Pro',
                                'Custom integrations',
                                'Dedicated support'
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Join thousands of users who have already cleaned up their inbox
                    </p>
                    <Link
                        to="/app/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Get started for free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-900">Inboxly</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                AI-powered email assistant
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                                <li><a href="#" className="hover:text-gray-900">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">About</a></li>
                                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 text-sm text-gray-600 text-center">
                        © 2025 Inboxly. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}

function PricingCard({ name, price, period, features, popular }: any) {
    return (
        <div className={`p-8 bg-white rounded-lg border ${popular ? 'border-blue-600 shadow-lg' : 'border-gray-200'} relative`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Popular
                </div>
            )}
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">{name}</h3>
            <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{price}</span>
                <span className="text-gray-600 text-sm">{period}</span>
            </div>
            <ul className="space-y-3 mb-8">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <Link
                to="/app/dashboard"
                className={`block w-full py-2.5 rounded-md font-medium text-sm text-center transition-colors ${popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
            >
                Get started
            </Link>
        </div>
    );
}
