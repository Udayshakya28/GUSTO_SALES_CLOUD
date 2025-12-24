"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PlusIcon,
  GlobeAltIcon,
  TagIcon,
  EyeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic info, 2: AI Analysis, 3: Customization
  
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    generatedDescription: '',
    generatedKeywords: [] as string[],
    targetSubreddits: [] as string[],
    competitors: [] as string[]
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  const handleAnalyzeWebsite = async () => {
    if (!formData.websiteUrl) return;

    setAnalyzing(true);
    try {
      const token = await getToken();
      const analysis = await api.analyzeWebsite(formData.websiteUrl, token);
      
      setFormData(prev => ({
        ...prev,
        generatedDescription: analysis.description || '',
        generatedKeywords: analysis.keywords || [],
        competitors: analysis.competitors || []
      }));
      
      setStep(3);
      toast.success('Website analyzed successfully!');
    } catch (error: any) {
      toast.error('Failed to analyze website', {
        description: error.message
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      await api.createCampaign({
        websiteUrl: formData.websiteUrl,
        generatedKeywords: formData.generatedKeywords,
        generatedDescription: formData.generatedDescription,
        competitors: formData.competitors,
        name: formData.name
      }, token);
      
      toast.success('Campaign created successfully!');
      onCampaignCreated();
      resetForm();
    } catch (error: any) {
      toast.error('Failed to create campaign', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      websiteUrl: '',
      generatedDescription: '',
      generatedKeywords: [],
      targetSubreddits: [],
      competitors: []
    });
    setStep(1);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.generatedKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        generatedKeywords: [...prev.generatedKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      generatedKeywords: prev.generatedKeywords.filter(k => k !== keyword)
    }));
  };

  const addSubreddit = () => {
    if (newSubreddit.trim() && !formData.targetSubreddits.includes(newSubreddit.trim())) {
      setFormData(prev => ({
        ...prev,
        targetSubreddits: [...prev.targetSubreddits, newSubreddit.trim()]
      }));
      setNewSubreddit('');
    }
  };

  const removeSubreddit = (subreddit: string) => {
    setFormData(prev => ({
      ...prev,
      targetSubreddits: prev.targetSubreddits.filter(s => s !== subreddit)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black rounded-xl border border-zinc-800 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-black border-b border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold text-white ${poppins.className}`}>
                  Create New Campaign
                </h2>
                <p className={`text-zinc-400 mt-1 ${inter.className}`}>
                  Step {step} of 3 - {step === 1 ? 'Basic Information' : step === 2 ? 'AI Analysis' : 'Customization'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-zinc-300 mb-2 ${inter.className}`}>
                        Campaign Name (Optional)
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="My Lead Generation Campaign"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-zinc-300 mb-2 ${inter.className}`}>
                        <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                        Website URL *
                      </label>
                      <Input
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="https://example.com"
                        type="url"
                        required
                      />
                      <p className={`text-xs text-zinc-500 mt-1 ${inter.className}`}>
                        We'll analyze your website to understand your business and generate targeting keywords
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.websiteUrl}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Next: Analyze Website
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: AI Analysis */}
            {step === 2 && (
              <div className="space-y-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <SparklesIcon className="w-5 h-5 text-orange-500" />
                      AI Website Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8">
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="w-8 h-8 text-orange-500" />
                      </div>
                      <h3 className={`text-lg font-semibold text-white mb-2 ${poppins.className}`}>
                        Ready to analyze your website
                      </h3>
                      <p className={`text-zinc-400 mb-6 ${inter.className}`}>
                        Our AI will analyze {formData.websiteUrl} to extract keywords, understand your business, and suggest targeting strategies.
                      </p>
                      <Button
                        onClick={handleAnalyzeWebsite}
                        disabled={analyzing}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {analyzing ? 'Analyzing...' : 'Analyze Website'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Skip Analysis
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Customization */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Description */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <DocumentTextIcon className="w-5 h-5 text-orange-500" />
                      Business Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.generatedDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, generatedDescription: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                      placeholder="Describe your business and what you're looking for..."
                    />
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <TagIcon className="w-5 h-5 text-orange-500" />
                      Target Keywords ({formData.generatedKeywords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Add keyword..."
                      />
                      <Button
                        type="button"
                        onClick={addKeyword}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.generatedKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="border-orange-500/20 text-orange-400 flex items-center gap-1"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Target Subreddits */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <EyeIcon className="w-5 h-5 text-orange-500" />
                      Target Subreddits ({formData.targetSubreddits.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSubreddit}
                        onChange={(e) => setNewSubreddit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubreddit())}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="subreddit name (without r/)"
                      />
                      <Button
                        type="button"
                        onClick={addSubreddit}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.targetSubreddits.map((subreddit) => (
                        <Badge
                          key={subreddit}
                          variant="outline"
                          className="border-blue-500/20 text-blue-400 flex items-center gap-1"
                        >
                          r/{subreddit}
                          <button
                            type="button"
                            onClick={() => removeSubreddit(subreddit)}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Competitors */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                      <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
                      Competitors ({formData.competitors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Competitor name or URL"
                      />
                      <Button
                        type="button"
                        onClick={addCompetitor}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.competitors.map((competitor) => (
                        <Badge
                          key={competitor}
                          variant="outline"
                          className="border-purple-500/20 text-purple-400 flex items-center gap-1"
                        >
                          {competitor}
                          <button
                            type="button"
                            onClick={() => removeCompetitor(competitor)}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !formData.websiteUrl}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                  >
                    {loading ? 'Creating Campaign...' : 'Create Campaign'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};