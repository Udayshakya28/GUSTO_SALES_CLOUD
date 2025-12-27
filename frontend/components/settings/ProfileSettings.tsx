"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import {
  Camera, Check, X, Loader2, AlertCircle, User, Settings, Shield,
  Trash2, Edit, Briefcase, PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import { Inter, Poppins } from 'next/font/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

// --- TYPE DEFINITIONS ---

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  publicProfile: boolean;
  emailNotifications: boolean;
}

interface Campaign {
  _id: string;
  name: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
}

// --- MAIN COMPONENT ---

export function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  
  // State to manage which campaign is being edited
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);


  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.publicMetadata?.bio as string || "",
    location: user?.publicMetadata?.location as string || "",
    publicProfile: user?.publicMetadata?.publicProfile as boolean || false,
    emailNotifications: user?.publicMetadata?.emailNotifications as boolean || true,
  });

  const fetchCampaigns = async () => {
    if (!user) return;
    setIsLoadingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns.');
      }
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Could not load your campaigns.");
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
        // Set initial form data once user is loaded
        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            bio: user?.publicMetadata?.bio as string || "",
            location: user?.publicMetadata?.location as string || "",
            publicProfile: user?.publicMetadata?.publicProfile as boolean || false,
            emailNotifications: user?.publicMetadata?.emailNotifications as boolean || true,
        });
        fetchCampaigns();
    }
  }, [isLoaded, user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageUpload(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (formData.bio.length > 500) newErrors.bio = "Bio must be less than 500 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in your profile information.");
      return;
    }
    if (!user) {
      toast.error("User not found. Please refresh and try again.");
      return;
    }
    setIsLoading(true);
    try {
      if (imageUpload) {
        await user.setProfileImage({ file: imageUpload });
      }
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        publicMetadata: {
          bio: formData.bio,
          location: formData.location,
          publicProfile: formData.publicProfile,
          emailNotifications: formData.emailNotifications,
        }
      };
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update profile on the server.');
      await user.reload();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCampaign = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Server failed to update campaign.");
      toast.success("Campaign updated successfully!");
      await fetchCampaigns(); // Refetch to get the latest data
    } catch (error) {
      console.error("Failed to update campaign:", error)
      toast.error("Failed to update campaign. Please try again.");
    }
    setEditingCampaign(null); // Close the modal
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Server failed to delete campaign.");
      toast.success("Campaign deleted successfully!");
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      toast.error("Failed to delete campaign. Please try again.");
    }
  };

  const handleReset = () => {
    if (!user) return;
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.publicMetadata?.bio as string || "",
      location: user.publicMetadata?.location as string || "",
      publicProfile: user.publicMetadata?.publicProfile as boolean || false,
      emailNotifications: user.publicMetadata?.emailNotifications as boolean || true,
    });
    setErrors({});
    setPreviewUrl("");
    setImageUpload(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* --- PROFILE SETTINGS SECTION --- */}
      <div className="space-y-6">
        <div>
          <h3 className={`${poppins.className} text-2xl font-bold text-white tracking-tight`}>
            Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">Profile</span>
          </h3>
          <p className={`${inter.className} text-white/80 font-medium mt-2`}>
            This is how others will see you on the site.
          </p>
        </div>
        <Separator className="bg-white/10" />
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="space-y-4">
            <Label className={`${inter.className} text-white font-semibold text-base`}>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-orange-500/30">
                <AvatarImage src={previewUrl || user?.imageUrl} alt="Profile picture" />
                <AvatarFallback className="bg-gradient-to-br from-orange-600 to-orange-700 text-white text-lg font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className={`${inter.className} cursor-pointer inline-flex items-center gap-2 text-sm bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200`}>
                  <Camera size={16} /> Change Photo
                </Label>
                <Input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <p className={`${inter.className} text-white/60 text-sm`}>JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </div>
          </div>
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}><Settings className="text-orange-500" size={18} /> Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name *" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
              <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label className={`${inter.className} text-white font-semibold`}>Username</Label>
              <Input type="text" value={user?.username || ""} disabled className="border-white/20 bg-white/5 text-white/70 disabled:opacity-50" />
              <p className={`${inter.className} text-white/60 text-sm`}>Username cannot be changed. Use the <strong>Account</strong> settings.</p>
            </div>
            <div className="space-y-2">
              <Label className={`${inter.className} text-white font-semibold`}>Email Address</Label>
              <Input type="email" value={user?.primaryEmailAddress?.emailAddress || ""} disabled className="border-white/20 bg-white/5 text-white/70 disabled:opacity-50" />
              <p className={`${inter.className} text-white/60 text-sm`}>Email cannot be changed. Use the <strong>Account</strong> settings.</p>
            </div>
          </div>
          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}><User className="text-orange-500" size={18} /> Additional Information</h4>
            <div className="space-y-2">
              <Label className={`${inter.className} text-white font-semibold`}>Bio</Label>
              <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us a bit about yourself..." className="border-white/20 bg-white/5 text-white placeholder:text-white/40 min-h-[80px] focus:border-orange-500/50 focus:ring-orange-500/20" />
              <div className={`${inter.className} flex justify-between text-sm`}>
                <span className="text-white/60">{formData.bio.length}/500 characters</span>
                {errors.bio && (<span className="text-red-400 flex items-center gap-1"><AlertCircle size={14} />{errors.bio}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" />
            </div>
          </div>
          {/* Privacy & Notifications */}
          <div className="space-y-4">
            <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}><Shield className="text-orange-500" size={18} /> Privacy & Notifications</h4>
            <div className="space-y-4">
              <SettingToggle title="Public Profile" description="Make your profile visible to other users" checked={formData.publicProfile} onChange={(checked) => handleSwitchChange('publicProfile', checked)} />
              <SettingToggle title="Email Notifications" description="Receive email updates and notifications" checked={formData.emailNotifications} onChange={(checked) => handleSwitchChange('emailNotifications', checked)} />
            </div>
          </div>
          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className={`${inter.className} bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border-none font-semibold transition-all duration-200 disabled:opacity-50`}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<><Check className="mr-2 h-4 w-4" /> Save Changes</>)}
            </Button>
            <Button type="button" variant="outline" className={`${inter.className} border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-semibold transition-all duration-200`} onClick={handleReset}>
              <X className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </form>
      </div>

      <Separator className="bg-white/10" />

      {/* --- CAMPAIGN MANAGEMENT SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}>
                <Briefcase className="text-orange-500" size={18} /> Campaign Management
            </h4>
            <Button variant="outline" className="text-sm font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">
                <PlusCircle size={16} className="mr-2"/> New Campaign
            </Button>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            {isLoadingCampaigns ? (
                <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
            ) : campaigns.length > 0 ? (
                campaigns.map(campaign => (
                    <div key={campaign._id} className="flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                        <div>
                            <p className="font-semibold text-white">{campaign.name}</p>
                            <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${ campaign.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400' }`}>{campaign.status}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => setEditingCampaign(campaign)}>
                                <Edit className="h-4 w-4 text-white/70 hover:text-white" />
                            </Button>
                           <DeleteCampaignButton onDelete={() => handleDeleteCampaign(campaign._id)} />
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-white/60 py-4">You don't have any campaigns yet.</p>
            )}
        </div>
      </div>
      
      {/* This modal will be rendered when 'editingCampaign' is not null */}
      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={handleUpdateCampaign}
        />
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FormField({ label, name, type = "text", value, onChange, placeholder, error }: { label: string; name: string; type?: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; error?: string;}) {
  return (
    <div className="space-y-2">
      <Label className={`${inter.className} text-white font-semibold`}>{label}</Label>
      <Input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20" />
      {error && (<p className={`${inter.className} text-red-400 text-sm flex items-center gap-1`}><AlertCircle size={14} />{error}</p>)}
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void; }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="space-y-1">
        <Label className={`${inter.className} text-white font-semibold`}>{title}</Label>
        <p className={`${inter.className} text-white/60 text-sm`}>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-orange-500" />
    </div>
  );
}

// --- MODAL COMPONENTS ---

function EditCampaignModal({ campaign, onClose, onSave }: { campaign: Campaign, onClose: () => void, onSave: (id: string, name: string) => void }) {
  const [name, setName] = useState(campaign.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Campaign name cannot be empty.");
      return;
    }
    setIsSaving(true);
    await onSave(campaign._id, name);
    setIsSaving(false);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/90 backdrop-blur-sm border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Campaign</DialogTitle>
          <DialogDescription className="text-white/60">
            Make changes to your campaign here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white/80">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border-none font-semibold">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCampaignButton({ onDelete }: { onDelete: () => void }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500/70 hover:text-red-500" /></Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900/90 backdrop-blur-sm border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">Are you absolutely sure?</DialogTitle>
                    <DialogDescription className="text-white/60">This action cannot be undone. This will permanently delete your campaign.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={onDelete}>Yes, delete campaign</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}