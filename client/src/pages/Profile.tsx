import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Edit2, Instagram, Twitter, Globe, Plus, Trash2 } from "lucide-react";
import { SiPixiv } from "react-icons/si";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { FaXTwitter } from "react-icons/fa6";

const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  x: <FaXTwitter className="w-5 h-5" />,
  twitter: <FaXTwitter className="w-5 h-5" />,
  pixiv: <SiPixiv className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
};

const normalizePlatform = (platform: string) => (platform || "").trim().toLowerCase();

const getSocialIconNode = (link: { platform: string; icon?: string }) => {
  const key = normalizePlatform(link.icon || link.platform);
  return SOCIAL_ICON_MAP[key] ?? SOCIAL_ICON_MAP.globe;
};

type SocialLink = {
  platform: string;
  url: string;
  icon?: string;
};

const getIcon = (platform: string) => {
  const p = (platform || "").toLowerCase();
  if (p.includes("twitter") || p === "x") return Twitter;
  if (p.includes("instagram")) return Instagram;
  if (p.includes("pixiv")) return SiPixiv;
  return Globe;
};

function normalizeUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  // http(s) 없으면 자동으로 https 붙여주기
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function emptyLink(): SocialLink {
  return { platform: "", url: "", icon: "" };
}

export default function Profile() {
  const { data, setData, editMode } = usePortfolioContext();

  const resolvedProfileImg = useResolvedImage(data.profile?.profileImage || "");

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(data.profile);

  // ✅ data.profile이 외부에서 바뀌어도 편집 draft가 맞게 따라가도록
  useEffect(() => {
    if (!isEditing) setEditedProfile(data.profile);
  }, [data.profile, isEditing]);

  const openEdit = () => {
    setEditedProfile(data.profile);
    setIsEditing(true);
  };

  const closeEdit = () => setIsEditing(false);

  const handleProfileChange = (field: keyof typeof editedProfile, value: any) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // url 정리 + 빈 링크 제거
    const cleanedLinks = (editedProfile.socialLinks || [])
      .map((l) => ({
        platform: (l.platform || "").trim(),
        url: normalizeUrl(l.url),
        icon: (l.icon || "").trim(),
      }))
      .filter((l) => l.platform && l.url);

    setData({
      ...data,
      profile: {
        ...editedProfile,
        socialLinks: cleanedLinks,
      },
    });

    setIsEditing(false);
  };

  // ===== social links helpers =====
  const updateLink = (idx: number, patch: Partial<SocialLink>) => {
    setEditedProfile((prev) => {
      const next = [...(prev.socialLinks || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, socialLinks: next };
    });
  };

  const addLink = () => {
    setEditedProfile((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), emptyLink()],
    }));
  };

  const removeLink = (idx: number) => {
    setEditedProfile((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== idx),
    }));
  };

  // ===== view =====
  const profile = data.profile;

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-white gyeol-bg">
      <div className="px-6 md:px-12 py-16 md:py-20">
        {/* ===== Profile Header ===== */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-12 mb-16 md:mb-20">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-52 h-52 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm">
              {resolvedProfileImg ? (
                <img
                  src={resolvedProfileImg}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full text-sm flex items-center justify-center text-white/40">
                  이미지 없음
                </div>
              )}
            </div>

            {editMode && (
              <div className="mt-5">
                <GButton
                  variant="ghost"
                  text="프로필 수정"
                  onClick={openEdit}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl text-white/90 font-bold tracking-tight mb-5">
              {profile.name || "그림결"}
            </h1>

            <p className="text-white/70 leading-relaxed mb-10 max-w-2xl whitespace-pre-wrap">
              {profile.bio || "나만의 세계관을 만들어보세요"}
            </p>

            {/* Social Links */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-white/40">
                Connect
              </p>

              <div className="flex flex-wrap gap-3">
                {(profile.socialLinks || []).length === 0 ? (
                  <div className="text-sm text-white/40">
                    등록된 링크가 없습니다.
                  </div>
                ) : (
                  profile.socialLinks.map((link, index) => {
                    const Icon = getIcon(link.platform);
                    const href = normalizeUrl(link.url);

                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          group w-11 h-11 flex items-center justify-center rounded-full
                          bg-white/5 border border-white/10
                          text-white/70 hover:text-white
                          hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]
                          transition duration-300
                        "
                      >
                        {getSocialIconNode(link)}
                      </a>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Edit Modal (Modal + GButton 통일) ===== */}
        <Modal
          open={isEditing && editMode}
          onClose={closeEdit}
          title="프로필 편집"
          maxWidthClassName="max-w-2xl"
          footer={
            <div className="flex justify-end gap-2">
              <GButton variant="default" text="취소" onClick={closeEdit} />
              <GButton variant="dark" text="저장" onClick={handleSaveProfile} />
            </div>
          }
        >
          <div className="space-y-8">
            {/* 프로필 이미지 */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">
                프로필 이미지
              </p>
              <ImageUpload
                value={editedProfile.profileImage}
                onChange={(value) => handleProfileChange("profileImage", value)}
              />
            </div>

            {/* 이름 */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">이름</p>
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => handleProfileChange("name", e.target.value)}
                className="
                  w-full h-10 rounded-xl px-3 text-sm
                  border border-border bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-white/20
                "
              />
            </div>

            {/* 소개 */}
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">소개</p>
              <textarea
                rows={5}
                value={editedProfile.bio}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                className="
                  w-full rounded-xl px-3 py-2 text-sm
                  border border-border bg-background text-foreground
                  resize-none
                  focus:outline-none focus:ring-2 focus:ring-white/20
                "
              />
            </div>

            {/* 소셜 링크 편집 */}
            <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">소셜 링크</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    플랫폼 + URL을 입력하면 아이콘이 자동으로 매칭돼요.
                    (예: instagram, twitter/x, pixiv)
                  </p>
                </div>

                <GButton
                  variant="default"
                  icon={<Plus className="w-4 h-4" />}
                  text="추가"
                  onClick={addLink}
                />
              </div>

              {(editedProfile.socialLinks || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  링크가 없습니다. “추가” 버튼으로 링크를 등록하세요.
                </div>
              ) : (
                <div className="space-y-3">
                  {(editedProfile.socialLinks || []).map((link, idx) => {
                    const Icon = getIcon(link.platform);

                    return (
                      <div
                        key={idx}
                        className="
                          rounded-2xl border border-border bg-background/40
                          p-4 flex flex-col gap-3
                        "
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-black grid place-items-center border border-border">
                              {/* @ts-expect-error */}
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                링크 #{idx + 1}
                              </div>
                              <div className="text-sm text-foreground truncate">
                                {link.platform || "플랫폼 미입력"}
                              </div>
                            </div>
                          </div>

                          <GButton
                            variant="danger"
                            size="icon"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => removeLink(idx)}
                            title="삭제"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <div className="mb-1 text-[11px] text-muted-foreground">
                              플랫폼
                            </div>
                            <input
                              value={link.platform}
                              onChange={(e) =>
                                updateLink(idx, { platform: e.target.value })
                              }
                              placeholder="instagram / twitter / pixiv ..."
                              className="
                                w-full h-10 px-3 rounded-xl
                                border border-border bg-background text-foreground
                                focus:outline-none focus:ring-2 focus:ring-white/20
                              "
                            />
                          </div>

                          <div className="md:col-span-2">
                            <div className="mb-1 text-[11px] text-muted-foreground">
                              URL
                            </div>
                            <input
                              value={link.url}
                              onChange={(e) =>
                                updateLink(idx, { url: e.target.value })
                              }
                              placeholder="https://..."
                              className="
                                w-full h-10 px-3 rounded-xl
                                border border-border bg-background text-foreground
                                focus:outline-none focus:ring-2 focus:ring-white/20
                              "
                            />
                          </div>
                        </div>

                        {/* (선택) icon 필드가 필요하면 여기에 추가 가능 */}
                        {/* <input ... /> */}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}