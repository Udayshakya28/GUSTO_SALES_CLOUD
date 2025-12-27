"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export const EmailSettings = () => {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [getToken]);

  const handleSave = async () => {
    const token = await getToken();
    try {
      await api.updateEmailSettings({ email, enabled }, token);
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save email settings:', error);
      alert('Failed to save settings.');
    }
  };

  const handleSendTest = async () => {
    const token = await getToken();
    try {
      await api.sendTestEmail(token);
      alert('Test email sent!');
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="email-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <label htmlFor="email-enabled">Enable Email Notifications</label>
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!enabled}
        />
        <div className="flex space-x-2">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button onClick={handleSendTest} disabled={!enabled}>Send Test Email</Button>
        </div>
      </CardContent>
    </Card>
  );
};