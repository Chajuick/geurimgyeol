import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { data, setData, editMode } = usePortfolioContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(data.profile);
  const [newLink, setNewLink] = useState({ platform: '', url: '', icon: '' });

  const handleProfileChange = (field: string, value: string) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  const handleSaveProfile = () => {
    const newData = {
      ...data,
      profile: editedProfile,
    };
    setData(newData);
    setIsEditing(false);
  };

  const handleAddLink = () => {
    if (newLink.platform && newLink.url) {
      const updated = {
        ...editedProfile,
        socialLinks: [...editedProfile.socialLinks, newLink],
      };
      setEditedProfile(updated);
      setNewLink({ platform: '', url: '', icon: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    const updated = {
      ...editedProfile,
      socialLinks: editedProfile.socialLinks.filter((_, i) => i !== index),
    };
    setEditedProfile(updated);
  };

  return (
    <div className="min-h-screen bg-background py-12 md:ml-64">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted shadow-lg">
              {editedProfile.profileImage ? (
                <img
                  src={editedProfile.profileImage}
                  alt={editedProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-5xl">
                  👤
                </div>
              )}
            </div>
            {editMode && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
                수정
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-4">{editedProfile.name}</h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {editedProfile.bio}
            </p>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                연결
              </h3>
              <div className="flex flex-wrap gap-3">
                {editedProfile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-border transition-colors duration-200"
                  >
                    {link.icon && <span>{link.icon}</span>}
                    <span className="text-sm font-medium">{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold mb-6">프로필 편집</h2>

              {/* Profile Image URL */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  프로필 이미지 URL
                </label>
                <input
                  type="text"
                  value={editedProfile.profileImage}
                  onChange={(e) =>
                    handleProfileChange('profileImage', e.target.value)
                  }
                  placeholder="이미지 URL을 입력하세요"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">이름</label>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">소개</label>
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">소셜 링크</h3>

                {/* Existing Links */}
                <div className="space-y-3 mb-4">
                  {editedProfile.socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={link.platform}
                        readOnly
                        className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={link.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Link */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3">새 링크 추가</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newLink.platform}
                      onChange={(e) =>
                        setNewLink({ ...newLink, platform: e.target.value })
                      }
                      placeholder="플랫폼 이름 (예: Twitter)"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                    <input
                      type="text"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                      placeholder="URL"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                    <input
                      type="text"
                      value={newLink.icon}
                      onChange={(e) =>
                        setNewLink({ ...newLink, icon: e.target.value })
                      }
                      placeholder="아이콘 (이모지 또는 텍스트)"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                    <button
                      onClick={handleAddLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-border transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      링크 추가
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
