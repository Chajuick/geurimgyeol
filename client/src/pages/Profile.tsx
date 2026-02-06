/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Simple profile management
- Data export/import functionality
*/

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Save, Download, Upload, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { fileToBase64 } from '@/lib/storage';

export default function Profile() {
  const profile = useStore((state) => state.profile);
  const updateProfile = useStore((state) => state.updateProfile);
  const exportData = useStore((state) => state.exportData);
  const importDataFromFile = useStore((state) => state.importDataFromFile);
  
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [website, setWebsite] = useState(profile.website);
  const [instagram, setInstagram] = useState(profile.social.instagram || '');
  const [twitter, setTwitter] = useState(profile.social.twitter || '');
  const [behance, setBehance] = useState(profile.social.behance || '');
  const [artstation, setArtstation] = useState(profile.social.artstation || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  
  const handleSave = () => {
    updateProfile({
      name,
      bio,
      website,
      avatarUrl,
      social: {
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        behance: behance || undefined,
        artstation: artstation || undefined
      }
    });
    toast.success('프로필이 저장되었습니다');
  };
  
  const handleAvatarUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setAvatarUrl(base64);
      toast.success('프로필 이미지가 업로드되었습니다');
    } catch (error) {
      toast.error('이미지 업로드에 실패했습니다');
    }
  };
  
  const handleExport = () => {
    exportData();
    toast.success('데이터가 다운로드되었습니다');
  };
  
  const handleImport = async (file: File) => {
    try {
      await importDataFromFile(file);
      toast.success('데이터를 가져왔습니다');
      
      // 스토어에서 업데이트된 프로필 정보 가져오기
      const updatedProfile = useStore.getState().profile;
      setName(updatedProfile.name);
      setBio(updatedProfile.bio);
      setWebsite(updatedProfile.website);
      setInstagram(updatedProfile.social.instagram || '');
      setTwitter(updatedProfile.social.twitter || '');
      setBehance(updatedProfile.social.behance || '');
      setArtstation(updatedProfile.social.artstation || '');
      setAvatarUrl(updatedProfile.avatarUrl);
    } catch (error) {
      toast.error('데이터 가져오기에 실패했습니다');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 
          className="text-4xl font-semibold mb-2 brush-underline"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          프로필
        </h1>
        <p className="text-muted-foreground">
          나의 정보를 관리하고 데이터를 백업합니다
        </p>
      </div>
      
      {/* Profile Form */}
      <section className="wabi-card p-6 space-y-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          기본 정보
        </h2>
        
        {/* Avatar */}
        <div className="space-y-2">
          <Label>프로필 이미지</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleAvatarUpload(file);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                업로드
              </Button>
              {avatarUrl && (
                <Button
                  variant="outline"
                  onClick={() => setAvatarUrl(null)}
                >
                  제거
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="일러스트레이터"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">소개</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="나를 소개하는 글을 작성해주세요"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">웹사이트</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </section>
      
      {/* Social Links */}
      <section className="wabi-card p-6 space-y-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          소셜 링크
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="behance">Behance</Label>
            <Input
              id="behance"
              value={behance}
              onChange={(e) => setBehance(e.target.value)}
              placeholder="username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="artstation">ArtStation</Label>
            <Input
              id="artstation"
              value={artstation}
              onChange={(e) => setArtstation(e.target.value)}
              placeholder="username"
            />
          </div>
        </div>
      </section>
      
      {/* Data Management */}
      <section className="wabi-card p-6 space-y-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          데이터 관리
        </h2>
        
        <p className="text-sm text-muted-foreground">
          모든 프로젝트, 갤러리, 설정을 JSON 파일로 백업하거나 복원할 수 있습니다.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            데이터 내보내기
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImport(file);
              };
              input.click();
            }}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            데이터 가져오기
          </Button>
        </div>
      </section>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          프로필 저장
        </Button>
      </div>
    </div>
  );
}
