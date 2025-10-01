// components/profile/profile-form.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, KeyRound } from "lucide-react"
import type { User } from "@/lib/auth"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: user.name });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  
  const [profileImage, setProfileImage] = useState<string>(user.image || "")
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... sua lógica de upload de imagem ...
  }

  // Função para salvar nome e imagem
  const handleInfoSave = async () => {
    setIsLoadingInfo(true);
    setFeedback({ error: "", success: "" });

    const payload: { name: string; image?: string } = { name: formData.name };
    if (profileImage && profileImage !== user.image) {
        payload.image = profileImage;
    }

    try {
        const response = await fetch(`/api/teams/members/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            setFeedback({ success: t('profile.info_updated'), error: "" });
        } else {
            setFeedback({ error: result.error || t('profile.info_update_error'), success: "" });
        }
    } catch (err) {
        setFeedback({ error: t('profile.network_error'), success: "" });
    } finally {
        setIsLoadingInfo(false);
    }
  }

  // Função dedicada para alterar a senha
  const handlePasswordChange = async () => {
    setIsLoadingPassword(true);
    setFeedback({ error: "", success: "" });

    if (passwordData.newPassword.length < 6) {
        setFeedback({ error: t('profile.password_min_length'), success: "" });
        setIsLoadingPassword(false);
        return;
    }

    try {
        const response = await fetch(`/api/users/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData)
        });
        const result = await response.json();
        if (response.ok) {
            setFeedback({ success: result.message, error: "" });
            setPasswordData({ currentPassword: "", newPassword: "" }); // Limpa os campos
        } else {
            setFeedback({ error: result.error, success: "" });
        }
    } catch (err) {
        setFeedback({ error: t('profile.network_error'), success: "" });
    } finally {
        setIsLoadingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {feedback.success && <Alert variant="default" className="bg-green-100 border-green-200 text-green-800"><AlertDescription>{feedback.success}</AlertDescription></Alert>}
      {feedback.error && <Alert variant="destructive"><AlertDescription>{feedback.error}</AlertDescription></Alert>}
    
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.update_info')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImage || user.image} alt="Profile" />
                <AvatarFallback className="text-lg">{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                <Camera className="h-3 w-3" />
              </label>
              <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.full_name')}</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isLoadingInfo} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.email_address')}</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleInfoSave} disabled={isLoadingInfo} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoadingInfo ? t('profile.saving') : t('profile.save_info')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>{t('profile.change_password')}</CardTitle>
            <CardDescription>{t('profile.change_password_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('profile.current_password')}</Label>
              <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} disabled={isLoadingPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile.new_password')}</Label>
              <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} disabled={isLoadingPassword} />
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePasswordChange} disabled={isLoadingPassword} className="w-full md:w-auto">
            <KeyRound className="mr-2 h-4 w-4" />
            {isLoadingPassword ? t('profile.changing') : t('profile.change_password_btn')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}