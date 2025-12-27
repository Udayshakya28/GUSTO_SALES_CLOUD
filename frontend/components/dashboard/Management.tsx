"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  BoltIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from '@/components/loading/LoadingWrapper';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface Webhook {
  id: string;
  name: string;
  url: string;
  type: 'discord' | 'slack' | 'generic' | 'email' | 'sms';
  isActive: boolean;
  events: string[];
  createdAt: string;
  lastTriggered?: string;
  filters?: {
    minOpportunityScore?: number;
    subreddits?: string[];
    keywords?: string[];
    priority?: string[];
  };
  rateLimitMinutes?: number;
}

const WEBHOOK_TYPES = {
  discord: {
    icon: ChatBubbleLeftIcon,
    label: 'Discord',
    color: 'bg-indigo-500',
    description: 'Get notifications in your Discord server',
    setupUrl: 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks'
  },
  slack: {
    icon: BellIcon,
    label: 'Slack',
    color: 'bg-green-500',
    description: 'Send alerts to your Slack workspace',
    setupUrl: 'https://api.slack.com/messaging/webhooks'
  },
  generic: {
    icon: GlobeAltIcon,
    label: 'Generic',
    color: 'bg-gray-500',
    description: 'Send to any HTTP endpoint',
    setupUrl: null
  },
  email: {
    icon: EnvelopeIcon,
    label: 'Email',
    color: 'bg-blue-500',
    description: 'Email notifications (coming soon)',
    setupUrl: null
  },
  sms: {
    icon: DevicePhoneMobileIcon,
    label: 'SMS',
    color: 'bg-purple-500',
    description: 'Text message alerts (coming soon)',
    setupUrl: null
  },
};

const EVENT_TYPES = [
  {
    id: 'lead.discovered',
    label: 'Lead Discovered',
    description: 'New high-value leads found',
    icon: '🎯',
    recommended: true
  },
  {
    id: 'lead.replied',
    label: 'Reply Posted',
    description: 'When you reply to a lead',
    icon: '💬',
    recommended: false
  },
  {
    id: 'discovery.completed',
    label: 'Discovery Completed',
    description: 'Campaign discovery finished',
    icon: '✅',
    recommended: true
  },
  {
    id: 'performance.daily',
    label: 'Daily Report',
    description: 'Daily performance summary',
    icon: '📊',
    recommended: false
  },
  {
    id: 'system.alert',
    label: 'System Alerts',
    description: 'Important system notifications',
    icon: '⚠️',
    recommended: true
  },
];

const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

export const WebhookManagement: React.FC = () => {
    const { getToken } = useAuth();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSetupGuide, setShowSetupGuide] = useState(false);
    const [selectedWebhookType, setSelectedWebhookType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [testingWebhook, setTestingWebhook] = useState<string>('');

    const loadWebhooks = useCallback(async () => {
        const token = await getToken();
        try {
            const response = await api.getWebhooks(token);
            setWebhooks(response.webhooks || []);
        } catch (error) {
            console.error('Failed to load webhooks:', error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const loadStats = useCallback(async () => {
        const token = await getToken();
        try {
            const response = await api.getWebhookStats(token);
            setStats(response);
        } catch (error) {
            console.error('Failed to load webhook stats:', error);
        }
    }, [getToken]);

    useEffect(() => {
        loadWebhooks();
        loadStats();
    }, [loadWebhooks, loadStats]);

    const deleteWebhook = async (webhookId: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;
        const token = await getToken();
        try {
            await api.deleteWebhook(webhookId, token);
            setWebhooks(webhooks.filter(w => w.id !== webhookId));
            loadStats();
        } catch (error) {
            console.error('Failed to delete webhook:', error);
            alert('Failed to delete webhook');
        }
    };

    const testWebhook = async (webhookId: string) => {
        setTestingWebhook(webhookId);
        const token = await getToken();
        try {
            await api.testWebhook(webhookId, token);
            alert('Test webhook sent successfully! Check your endpoint.');
        } catch (error) {
            console.error('Failed to test webhook:', error);
            alert('Failed to send test webhook');
        } finally {
            setTestingWebhook('');
        }
    };

    const toggleWebhook = async (webhookId: string, isActive: boolean) => {
        const token = await getToken();
        try {
            await api.updateWebhook(webhookId, { isActive }, token);
            setWebhooks(webhooks.map(w =>
                w.id === webhookId ? { ...w, isActive } : w
            ));
        } catch (error) {
            console.error('Failed to update webhook:', error);
            alert('Failed to update webhook');
        }
    };

    const openSetupGuide = (type: string) => {
        setSelectedWebhookType(type);
        setShowSetupGuide(true);
    };

    if (loading) {
        return <LoadingWrapper isLoading={loading} children={"yes"}/>;
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="p-8 space-y-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className={`text-3xl font-bold text-white ${poppins.className}`}>
                                Webhook Management
                            </h1>
                            <p className={`text-gray-400 ${inter.className}`}>
                                Get real-time notifications when leads are discovered
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowSetupGuide(true)}
                                className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                                <span className={inter.className}>Setup Guide</span>
                            </Button>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                <span className={inter.className}>Add Webhook</span>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Start Guide */}
                    <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                    <BoltIcon className="w-5 h-5 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold text-white mb-2 ${poppins.className}`}>
                                        Get Started in 3 Steps
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                1
                                            </span>
                                            <span className={`text-gray-300 ${inter.className}`}>
                                                Choose your platform (Discord, Slack, etc.)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                2
                                            </span>
                                            <span className={`text-gray-300 ${inter.className}`}>
                                                Create webhook URL in your platform
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                3
                                            </span>
                                            <span className={`text-gray-300 ${inter.className}`}>
                                                Add webhook here and test!
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                                                    Total Webhooks
                                                </p>
                                                <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                                                    {stats.totalWebhooks}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-full bg-orange-500/10">
                                                <BoltIcon className="h-5 w-5 text-orange-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                                                    Active
                                                </p>
                                                <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                                                    {stats.activeWebhooks}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-full bg-green-500/10">
                                                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                                                    Last Triggered
                                                </p>
                                                <p className={`text-sm text-gray-400 ${inter.className}`}>
                                                    {stats.lastTriggered
                                                        ? new Date(stats.lastTriggered).toLocaleString()
                                                        : 'Never'
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-full bg-yellow-500/10">
                                                <ClockIcon className="h-5 w-5 text-yellow-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                                                    Most Used
                                                </p>
                                                <p className={`text-sm text-gray-400 ${inter.className}`}>
                                                    {Object.entries(stats.webhooksByType || {})
                                                        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'None'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-full bg-purple-500/10">
                                                <FunnelIcon className="h-5 w-5 text-purple-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    {/* Webhooks List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className={`text-xl font-semibold text-white ${poppins.className}`}>
                                Your Webhooks
                            </h2>
                            {webhooks.length > 0 && (
                                <span className={`text-sm text-gray-400 ${inter.className}`}>
                                    {webhooks.filter(w => w.isActive).length} active of {webhooks.length} total
                                </span>
                            )}
                        </div>

                        {webhooks.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <BellIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                    <CardTitle className={`text-xl font-semibold mb-2 ${poppins.className}`}>
                                        No webhooks configured
                                    </CardTitle>
                                    <p className={`text-gray-400 mb-6 ${inter.className}`}>
                                        Set up your first webhook to start receiving real-time notifications
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowSetupGuide(true)}
                                            className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
                                        >
                                            <span className={inter.className}>View Setup Guide</span>
                                        </Button>
                                        <Button
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white"
                                        >
                                            <span className={inter.className}>Create Your First Webhook</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {webhooks.map((webhook) => (
                                    <WebhookCard
                                        key={webhook.id}
                                        webhook={webhook}
                                        onDelete={() => deleteWebhook(webhook.id)}
                                        onTest={() => testWebhook(webhook.id)}
                                        onToggle={(isActive) => toggleWebhook(webhook.id, isActive)}
                                        onSetupGuide={() => openSetupGuide(webhook.type)}
                                        testing={testingWebhook === webhook.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    <AnimatePresence>
                        {showCreateModal && (
                            <CreateWebhookModal
                                onClose={() => setShowCreateModal(false)}
                                onCreated={() => {
                                    loadWebhooks();
                                    loadStats();
                                    setShowCreateModal(false);
                                }}
                            />
                        )}
                        {showSetupGuide && (
                            <SetupGuideModal
                                onClose={() => setShowSetupGuide(false)}
                                selectedType={selectedWebhookType}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const WebhookCard: React.FC<{
    webhook: Webhook;
    onDelete: () => void;
    onTest: () => void;
    onToggle: (isActive: boolean) => void;
    onSetupGuide: () => void;
    testing: boolean;
}> = ({ webhook, onDelete, onTest, onToggle, onSetupGuide, testing }) => {
    const [copied, setCopied] = useState(false);
    const TypeIcon = WEBHOOK_TYPES[webhook.type].icon;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${WEBHOOK_TYPES[webhook.type].color}`}>
                                <TypeIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`text-lg font-semibold text-white truncate ${poppins.className}`}>
                                        {webhook.name}
                                    </h3>
                                    <Badge 
                                        variant="outline" 
                                        className={webhook.isActive
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }
                                    >
                                        <span className={inter.className}>
                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </Badge>
                                </div>

                                <p className={`text-sm text-gray-400 mb-3 ${inter.className}`}>
                                    {WEBHOOK_TYPES[webhook.type].label}
                                </p>

                                <div className="flex items-center gap-2 mb-3">
                                    <p className={`text-xs text-gray-500 truncate flex-1 ${inter.className}`}>
                                        {webhook.url}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(webhook.url)}
                                        className="p-1 h-auto text-gray-400 hover:text-white"
                                        title="Copy URL"
                                    >
                                        {copied ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                    </Button>
                                </div>

                                {/* Events */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {webhook.events.map((event) => (
                                        <Badge
                                            key={event}
                                            className="bg-orange-500/10 text-orange-400 border-orange-500/20"
                                        >
                                            <span className={inter.className}>
                                                {EVENT_TYPES.find(e => e.id === event)?.label || event}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>

                                {/* Filters */}
                                {webhook.filters && (
                                    <div className={`space-y-1 text-sm text-gray-400 ${inter.className}`}>
                                        {webhook.filters.minOpportunityScore && (
                                            <p>Min Score: {webhook.filters.minOpportunityScore}%</p>
                                        )}
                                        {webhook.filters.subreddits && webhook.filters.subreddits.length > 0 && (
                                            <p>Subreddits: {webhook.filters.subreddits.join(', ')}</p>
                                        )}
                                        {webhook.filters.keywords && webhook.filters.keywords.length > 0 && (
                                            <p>Keywords: {webhook.filters.keywords.join(', ')}</p>
                                        )}
                                        {webhook.filters.priority && webhook.filters.priority.length > 0 && (
                                            <p>Priority: {webhook.filters.priority.join(', ')}</p>
                                        )}
                                    </div>
                                )}

                                {/* Last triggered */}
                                {webhook.lastTriggered && (
                                    <p className={`text-xs text-gray-500 mt-2 ${inter.className}`}>
                                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onTest}
                                disabled={testing}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                                title="Test webhook"
                            >
                                <BeakerIcon className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggle(!webhook.isActive)}
                                className={`p-2 ${webhook.isActive
                                    ? 'text-green-400 hover:bg-green-500/10'
                                    : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                                }`}
                                title={webhook.isActive ? 'Disable webhook' : 'Enable webhook'}
                            >
                                <BoltIcon className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSetupGuide}
                                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                                title="Setup guide"
                            >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                title="Delete webhook"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const CreateWebhookModal: React.FC<{
    onClose: () => void;
    onCreated: () => void;
}> = ({ onClose, onCreated }) => {
    const { getToken } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        type: 'discord' as const,
        events: ['lead.discovered'] as string[],
        filters: {
            minOpportunityScore: 70,
            subreddits: [] as string[],
            keywords: [] as string[],
            priority: ['high', 'urgent'] as string[],
        },
        rateLimitMinutes: 5,
    });
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [subredditInput, setSubredditInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = await getToken();
        try {
            await api.createWebhook(formData, token);
            onCreated();
        } catch (error) {
            console.error('Failed to create webhook:', error);
            alert('Failed to create webhook. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addSubreddit = () => {
        if (subredditInput.trim() && !formData.filters.subreddits.includes(subredditInput.trim())) {
            setFormData({
                ...formData,
                filters: {
                    ...formData.filters,
                    subreddits: [...formData.filters.subreddits, subredditInput.trim()]
                }
            });
            setSubredditInput('');
        }
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !formData.filters.keywords.includes(keywordInput.trim())) {
            setFormData({
                ...formData,
                filters: {
                    ...formData.filters,
                    keywords: [...formData.filters.keywords, keywordInput.trim()]
                }
            });
            setKeywordInput('');
        }
    };

    const removeSubreddit = (subreddit: string) => {
        setFormData({
            ...formData,
            filters: {
                ...formData.filters,
                subreddits: formData.filters.subreddits.filter(s => s !== subreddit)
            }
        });
    };

    const removeKeyword = (keyword: string) => {
        setFormData({
            ...formData,
            filters: {
                ...formData.filters,
                keywords: formData.filters.keywords.filter(k => k !== keyword)
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-zinc-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold text-white ${poppins.className}`}>
                        Create New Webhook
                    </h2>
                    <span className={`text-sm text-gray-400 ${inter.className}`}>
                        Step {currentStep} of 3
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className={`text-lg font-semibold text-white ${poppins.className}`}>
                                Basic Information
                            </h3>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Webhook Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${inter.className}`}
                                    placeholder="e.g., Team Discord Notifications"
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Webhook Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(WEBHOOK_TYPES).map(([key, type]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: key as any })}
                                            className={`p-3 rounded-lg border-2 transition-colors ${formData.type === key
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-zinc-700 hover:border-zinc-600'
                                            }`}
                                        >
                                            <type.icon className="w-5 h-5 mx-auto mb-2 text-white" />
                                            <p className={`text-sm font-medium text-white ${inter.className}`}>
                                                {type.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Webhook URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className={`w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${inter.className}`}
                                    placeholder="https://discord.com/api/webhooks/..."
                                    required
                                />
                                <p className={`text-xs text-gray-400 mt-1 ${inter.className}`}>
                                    {WEBHOOK_TYPES[formData.type].setupUrl && (
                                        <a
                                            href={WEBHOOK_TYPES[formData.type].setupUrl!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-400 hover:text-orange-300"
                                        >
                                            How to get your {WEBHOOK_TYPES[formData.type].label} webhook URL →
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className={`text-lg font-semibold text-white ${poppins.className}`}>
                                Event Configuration
                            </h3>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Events to Monitor
                                </label>
                                <div className="space-y-2">
                                    {EVENT_TYPES.map((event) => (
                                        <label key={event.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={formData.events.includes(event.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            events: [...formData.events, event.id]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            events: formData.events.filter(id => id !== event.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded text-orange-500 focus:ring-orange-500 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{event.icon}</span>
                                                    <span className={`text-white font-medium ${inter.className}`}>
                                                        {event.label}
                                                    </span>
                                                    {event.recommended && (
                                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                                            <span className={inter.className}>Recommended</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className={`text-sm text-gray-400 mt-1 ${inter.className}`}>
                                                    {event.description}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Rate Limit
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={formData.rateLimitMinutes}
                                        onChange={(e) => setFormData({ ...formData, rateLimitMinutes: parseInt(e.target.value) })}
                                        className={`w-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${inter.className}`}
                                    />
                                    <span className={`text-gray-400 ${inter.className}`}>
                                        minutes between notifications
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className={`text-lg font-semibold text-white ${poppins.className}`}>
                                Filters (Optional)
                            </h3>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Minimum Opportunity Score: {formData.filters.minOpportunityScore}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.filters.minOpportunityScore}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        filters: { ...formData.filters, minOpportunityScore: parseInt(e.target.value) }
                                    })}
                                    className="w-full accent-orange-500"
                                />
                                <div className={`flex justify-between text-xs text-gray-400 mt-1 ${inter.className}`}>
                                    <span>0% (All leads)</span>
                                    <span>100% (Only highest quality)</span>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Priority Levels
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PRIORITY_LEVELS.map((priority) => (
                                        <label key={priority} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.filters.priority.includes(priority)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            filters: {
                                                                ...formData.filters,
                                                                priority: [...formData.filters.priority, priority]
                                                            }
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            filters: {
                                                                ...formData.filters,
                                                                priority: formData.filters.priority.filter(p => p !== priority)
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="rounded text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className={`text-white capitalize ${inter.className}`}>
                                                {priority}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Subreddits Filter
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subredditInput}
                                        onChange={(e) => setSubredditInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubreddit())}
                                        className={`flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${inter.className}`}
                                        placeholder="e.g., startups, entrepreneur"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addSubreddit}
                                        className="bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        <span className={inter.className}>Add</span>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.filters.subreddits.map((subreddit) => (
                                        <Badge
                                            key={subreddit}
                                            variant="outline"
                                            className="border-zinc-700 text-gray-300 flex items-center gap-1"
                                        >
                                            <span className={inter.className}>r/{subreddit}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSubreddit(subreddit)}
                                                className="text-red-400 hover:text-red-300 ml-1"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-300 mb-2 ${inter.className}`}>
                                    Keywords Filter
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                        className={`flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${inter.className}`}
                                        placeholder="e.g., project management, productivity"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addKeyword}
                                        className="bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        <span className={inter.className}>Add</span>
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.filters.keywords.map((keyword) => (
                                        <Badge
                                            key={keyword}
                                            variant="outline"
                                            className="border-zinc-700 text-gray-300 flex items-center gap-1"
                                        >
                                            <span className={inter.className}>{keyword}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(keyword)}
                                                className="text-red-400 hover:text-red-300 ml-1"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <span className={inter.className}>Previous</span>
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className={inter.className}>Cancel</span>
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={currentStep === 1 && (!formData.name || !formData.url)}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 text-white"
                                >
                                    <span className={inter.className}>Next</span>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={loading || formData.events.length === 0}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white"
                                >
                                    <span className={inter.className}>
                                        {loading ? 'Creating...' : 'Create Webhook'}
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

interface SetupStep {
    title: string;
    description: string;
    image?: string;
    code?: string;
}

const SetupGuideModal: React.FC<{
    onClose: () => void;
    selectedType: string;
}> = ({ onClose, selectedType }) => {
    const [activeTab, setActiveTab] = useState(selectedType || 'discord');

    const guides = {
        discord: {
            title: 'Discord Webhook Setup',
            icon: ChatBubbleLeftIcon,
            color: 'text-indigo-400',
            steps: [
                {
                    title: 'Open Discord Server Settings',
                    description: 'Go to your Discord server and click on the server name dropdown, then "Server Settings".',
                    image: 'https://i.imgur.com/8x5xG4y.png'
                },
                {
                    title: 'Navigate to Integrations',
                    description: 'In the Server Settings menu, click on "Integrations", then "Webhooks".',
                    image: 'https://i.imgur.com/kZ7gY8e.png'
                },
                {
                    title: 'Create & Copy Webhook URL',
                    description: 'Click "New Webhook", give it a name, choose a channel, and click "Copy Webhook URL".',
                    image: 'https://i.imgur.com/zZQ1Z9c.png'
                },
                {
                    title: 'Paste in RedLead',
                    description: 'Paste the copied URL into the "Webhook URL" field when creating a new webhook in RedLead.',
                }
            ] as SetupStep[]
        },
        slack: {
            title: 'Slack Webhook Setup',
            icon: BellIcon,
            color: 'text-green-400',
            steps: [
                {
                    title: 'Create Slack App',
                    description: 'Go to api.slack.com/apps, click "Create New App", and choose "From scratch".',
                    image: 'https://i.imgur.com/1mN5Y4w.png'
                },
                {
                    title: 'Enable Incoming Webhooks',
                    description: 'In your new app\'s settings, navigate to "Incoming Webhooks" and toggle it on.',
                    image: 'https://i.imgur.com/eB3M3Y0.png'
                },
                {
                    title: 'Add Webhook to Workspace',
                    description: 'Click "Add New Webhook to Workspace" at the bottom of the page and select a channel to post to.',
                    image: 'https://i.imgur.com/fD6k7J3.png'
                },
                {
                    title: 'Copy Webhook URL',
                    description: 'Copy the newly generated webhook URL and paste it into the RedLead form.',
                    image: 'https://i.imgur.com/xW4c2Z9.png'
                }
            ] as SetupStep[]
        },
        generic: {
            title: 'Generic Webhook Setup',
            icon: GlobeAltIcon,
            color: 'text-gray-400',
            steps: [
                {
                    title: 'Prepare Your Endpoint',
                    description: 'Your endpoint must be able to accept POST requests with a JSON payload. Here is an example of the data we will send.',
                    code: `
POST /your-endpoint HTTP/1.1
Content-Type: application/json

{
    "event": "lead.discovered",
    "data": {
    "title": "Looking for project management tools",
    "opportunityScore": 85,
    "author": "startup_founder",
    "subreddit": "startups",
    "url": "https://reddit.com/r/startups/...",
    "intent": "solution_seeking"
    },
    "timestamp": 1643723400000,
    "priority": "high"
}
`
                },
                {
                    title: 'Secure Your Endpoint',
                    description: 'For security, we recommend verifying a signature. We will send a `X-RedLead-Signature` header with a SHA256 HMAC hash of the payload, using your webhook\'s secret signing key.',
                },
                {
                    title: 'Test Your Endpoint',
                    description: 'Use a tool like Postman, or `curl` to ensure your endpoint is working correctly before adding it to RedLead.',
                    code: `
curl -X POST https://your-domain.com/webhook \\
-H "Content-Type: application/json" \\
-d '{"event": "test", "data": {"message": "Hello World"}}'
`
                },
                {
                    title: 'Add URL to RedLead',
                    description: 'Once your endpoint is ready, copy its URL and add it to a new "Generic" webhook in RedLead.'
                }
            ] as SetupStep[]
        }
    };

    const currentGuide = guides[activeTab as keyof typeof guides];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-zinc-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold text-white ${poppins.className}`}>
                        Webhook Setup Guide
                    </h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ×
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {Object.entries(guides).map(([key, guide]) => (
                        <Button
                            key={key}
                            variant={activeTab === key ? "default" : "outline"}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 ${
                                activeTab === key
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                    : 'border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                            <guide.icon className="w-4 h-4" />
                            <span className={inter.className}>{guide.title}</span>
                        </Button>
                    ))}
                </div>

                {/* Guide Content */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <currentGuide.icon className={`w-8 h-8 ${currentGuide.color}`} />
                        <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
                            {currentGuide.title}
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {currentGuide.steps.map((step, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-semibold text-white mb-2 ${poppins.className}`}>
                                        {step.title}
                                    </h4>
                                    <p className={`text-gray-300 mb-3 ${inter.className}`}>
                                        {step.description}
                                    </p>
                                    {step.code && (
                                        <pre className={`bg-zinc-900 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto ${inter.className}`}>
                                            <code>{step.code.trim()}</code>
                                        </pre>
                                    )}
                                    {step.image && (
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="rounded-lg border border-zinc-600 max-w-full h-auto"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-zinc-800">
                    <div className="flex justify-between items-center">
                        <div className={`text-sm text-gray-400 ${inter.className}`}>
                            Need help? Contact our support team
                        </div>
                        <Button
                            onClick={onClose}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <span className={inter.className}>Got it!</span>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
