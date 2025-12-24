"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NotificationSettings = () => {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = await getToken();
      try {
        const settings = await api.getEmailSettings(token);
        if (settings) {
          setEmail(settings.email);
          setEnabled(settings.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch email settings:', error);
        showMessage('Failed to load your notification settings.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [getToken]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    const token = await getToken();
    try {
      await api.updateEmailSettings({ email, enabled }, token);
      showMessage('Notification settings saved!', 'success');
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showMessage('Failed to save settings. Please try again.', 'error');
    }
  };

  const handleSendTest = async () => {
    const token = await getToken();
    try {
      await api.sendTestEmail(token);
      showMessage('Test email sent successfully!', 'success');
    } catch (error) {
      console.error('Failed to send test email:', error);
      showMessage('Failed to send test email.', 'error');
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive notifications about new leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading settings...</p>
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <Switch id="email-enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="email-enabled" className="text-sm font-medium">
                Enable Email Notifications
              </Label>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                id="email-address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!enabled}
                className="max-w-sm border-zinc-700 bg-zinc-900"
                />
            </div>
            <div className="flex space-x-2">
                <Button onClick={handleSave} className="bg-white text-black hover:bg-gray-200">Save</Button>
                <Button onClick={handleSendTest} disabled={!enabled} variant="outline" className="bg-transparent border-zinc-700 hover:bg-zinc-800">
                    Send Test Email
                </Button>
            </div>
             {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
