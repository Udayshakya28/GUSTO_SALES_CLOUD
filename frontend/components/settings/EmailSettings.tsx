"use client";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

//================================================================//
//          New Email Settings Component                          //
//================================================================//
export const EmailSettings = () => {
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
        setMessage({ text: 'Failed to load settings.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [getToken]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    const token = await getToken();
    try {
      await api.updateEmailSettings({ email, enabled }, token);
      showMessage('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showMessage('Failed to save settings.', 'error');
    }
  };

  const handleSendTest = async () => {
    const token = await getToken();
    try {
      await api.sendTestEmail(token);
      showMessage('Test email sent!', 'success');
    } catch (error) {
      console.error('Failed to send test email:', error);
      showMessage('Failed to send test email.', 'error');
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading settings...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="email-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <label htmlFor="email-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Enable Email Notifications
          </label>
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!enabled}
          className="max-w-sm"
        />
        <div className="flex space-x-2">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button onClick={handleSendTest} disabled={!enabled} variant="outline">Send Test Email</Button>
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

