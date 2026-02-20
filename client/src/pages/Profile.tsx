import React, { useEffect, useMemo, useState } from "react";
import {
  Instagram,
  Globe,
  Plus,
  Trash2,
  UserRound,
  Link2,
  Pencil,
} from "lucide-react";
import { SiPixiv } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { HUDPanel, HUDBadge } from "@/components/ui/hud";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  x: <FaXTwitter className="w-5 h-5" />,
  twitter: <FaXTwitter className="w-5 h-5" />,
  pixiv: <SiPixiv className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
};

const normalizePlatform = (platform: string) =>
  (platform || "").trim().toLowerCase();

const getSocialIconNode = (link: { platform: string; icon?: string }) => {
  const key = normalizePlatform(link.icon || link.platform);
  return SOCIAL_ICON_MAP[key] ?? SOCIAL_ICON_MAP.globe;
};

type SocialLink = {
  platform: string;
  url: string;
  icon?: string;
};

function normalizeUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function emptyLink(): SocialLink {
  return { platform: "", url: "", icon: "" };
}

const inputCls = cn(
  "w-full h-10 px-3 rounded-xl text-sm",
  "bg-black/25 text-white/90",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-white/15 focus:border-white/20",
  "transition"
);

const textareaCls = cn(
  "w-full rounded-xl px-3 py-2 text-sm",
  "bg-black/25 text-white/90",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-white/15 focus:border-white/20",
  "transition",
  "resize-none"
);

export default function Profile() {
  const { data, setData, editMode } = usePortfolioContext();
  const profile = data.profile;

  const resolvedProfileImg = useResolvedImage(profile?.profileImage || "");

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // ✅ data.profile이 외부에서 바뀌어도 편집 draft가 맞게 따라가도록
  useEffect(() => {
    if (!isEditing) setEditedProfile(profile);
  }, [profile, isEditing]);

  const openEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };
  const closeEdit = () => setIsEditing(false);

  const handleProfileChange = (
    field: keyof typeof editedProfile,
    value: any
  ) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const cleanedLinks = (editedProfile.socialLinks || [])
      .map(l => ({
        platform: (l.platform || "").trim(),
        url: normalizeUrl(l.url),
        icon: (l.icon || "").trim(),
      }))
      .filter(l => l.platform && l.url);

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
    setEditedProfile(prev => {
      const next = [...(prev.socialLinks || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, socialLinks: next };
    });
  };

  const addLink = () => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), emptyLink()],
    }));
  };

  const removeLink = (idx: number) => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== idx),
    }));
  };

  const cleanedViewLinks = useMemo(() => {
    return (profile?.socialLinks || [])
      .map(l => ({
        ...l,
        platform: (l.platform || "").trim(),
        url: normalizeUrl(l.url),
        icon: (l.icon || "").trim(),
      }))
      .filter(l => l.platform && l.url);
  }, [profile?.socialLinks]);

  return (
    <div
      className={cn(
        "min-h-screen w-full overflow-x-hidden text-white",
        "gyeol-bg relative"
      )}
    >
      {/* background HUD vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.65))]" />

      <div className="relative z-10 px-6 md:px-12 py-14 md:py-20">
        {/* ===== TOP HUD BAR ===== */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {editMode ? (
              <HUDBadge tone="warn">EDIT MODE</HUDBadge>
            ) : (
              <HUDBadge>VIEW MODE</HUDBadge>
            )}
            <HUDBadge>PROFILE</HUDBadge>
          </div>

          {editMode && (
            <GButton
              variant="ghost"
              icon={<Pencil className="w-4 h-4" />}
              text="프로필 수정"
              onClick={openEdit}
            />
          )}
        </div>

        {/* ===== HEADER ===== */}
        <HUDPanel className="p-5 md:p-7 mt-6">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* Profile Image Card */}
            <div className="flex-shrink-0">
              <div className="relative w-56 h-56 rounded-2xl overflow-hidden border border-white/10 bg-black/25">
                {/* subtle scanlines */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:100%_3px]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.10),transparent_55%)]" />

                {resolvedProfileImg ? (
                  <img
                    src={resolvedProfileImg}
                    alt={profile?.name || "profile"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/45 gap-2">
                    <UserRound className="w-8 h-8" />
                    <div className="text-xs">이미지 없음</div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] tracking-[0.26em] text-white/55">
                DOSSIER
              </div>

              <h1 className="mt-2 text-4xl text-white/90 font-extrabold tracking-tight">
                {profile?.name || "그림결"}
              </h1>

              <p className="mt-4 text-white/70 leading-relaxed max-w-3xl whitespace-pre-wrap">
                {profile?.bio || "나만의 세계관을 만들어보세요"}
              </p>

              {/* Connect */}
              <div className="mt-8">
                <div className="flex items-center gap-2">
                  <HUDBadge>CONNECT</HUDBadge>
                  <div className="text-xs text-white/40">
                    등록된 링크: {cleanedViewLinks.length}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {cleanedViewLinks.length === 0 ? (
                    <div className="text-sm text-white/40">
                      등록된 링크가 없습니다.
                    </div>
                  ) : (
                    cleanedViewLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group relative w-11 h-11 rounded-full grid place-items-center",
                          "bg-white/5 border border-white/10",
                          "text-white/70 hover:text-white",
                          "hover:bg-white/10",
                          "transition duration-300",
                          "hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                        )}
                        title={link.platform}
                        aria-label={link.platform}
                      >
                        {getSocialIconNode(link)}
                        <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </HUDPanel>

        {/* ===== SECONDARY PANELS (optional, keeps premium UI balance) ===== */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <HUDPanel className="p-5 md:p-6 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] tracking-[0.26em] text-white/55">
                  SUMMARY
                </div>
                <div className="mt-2 text-sm text-white/70">
                  프로필 소개는 카드/도감 상단에도 표시돼요.
                </div>
              </div>
              <HUDBadge>ACTIVE</HUDBadge>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65 leading-relaxed">
              {profile?.bio?.trim()
                ? profile.bio
                : "소개가 비어있습니다. 편집 모드에서 내용을 추가해보세요."}
            </div>
          </HUDPanel>

          <HUDPanel className="p-5 md:p-6">
            <div className="text-[11px] tracking-[0.26em] text-white/55">
              STATUS
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/55">이름</span>
                <span className="text-white/85 truncate max-w-[60%]">
                  {profile?.name?.trim() ? profile.name : "미설정"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/55">이미지</span>
                <span className="text-white/85">
                  {profile?.profileImage ? "설정됨" : "없음"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/55">링크</span>
                <span className="text-white/85">{cleanedViewLinks.length}</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-xs text-white/55">
                <Link2 className="w-4 h-4" />
                <span>링크는 platform 기준으로 아이콘이 매칭돼요.</span>
              </div>
            </div>
          </HUDPanel>
        </div>

        {/* ===== Edit Modal ===== */}
        <Modal
          open={isEditing && editMode}
          onClose={closeEdit}
          title="프로필 편집"
          maxWidthClassName="max-w-3xl"
          footer={
            <div className="flex justify-end gap-2">
              <GButton variant="default" text="취소" onClick={closeEdit} />
              <GButton variant="dark" text="저장" onClick={handleSaveProfile} />
            </div>
          }
        >
          <div className="space-y-8">
            {/* HUD header inside modal */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] tracking-[0.26em] text-white/55">
                  EDITOR
                </div>
                <div className="mt-2 text-lg font-extrabold text-white/90">
                  Profile Settings
                </div>
              </div>
              <HUDBadge tone="warn">LIVE</HUDBadge>
            </div>

            {/* 프로필 이미지 */}
            <HUDPanel className="p-4 md:p-5">
              <div className="text-[11px] tracking-[0.26em] text-white/55">
                IMAGE
              </div>
              <div className="mt-3">
                <ImageUpload
                  value={editedProfile.profileImage}
                  onChange={value => handleProfileChange("profileImage", value)}
                />
              </div>
            </HUDPanel>

            {/* 이름/소개 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HUDPanel className="p-4 md:p-5">
                <div className="text-[11px] tracking-[0.26em] text-white/55">
                  NAME
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={e => handleProfileChange("name", e.target.value)}
                    className={inputCls}
                    placeholder="이름을 입력하세요"
                  />
                </div>
              </HUDPanel>

              <HUDPanel className="p-4 md:p-5">
                <div className="text-[11px] tracking-[0.26em] text-white/55">
                  BIO
                </div>
                <div className="mt-3">
                  <textarea
                    rows={5}
                    value={editedProfile.bio}
                    onChange={e => handleProfileChange("bio", e.target.value)}
                    className={textareaCls}
                    placeholder="소개를 입력하세요"
                  />
                </div>
              </HUDPanel>
            </div>

            {/* 소셜 링크 편집 */}
            <HUDPanel className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] tracking-[0.26em] text-white/55">
                    SOCIAL LINKS
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    플랫폼 + URL 입력 → 아이콘 자동 매칭 (instagram, twitter/x,
                    pixiv)
                  </div>
                </div>

                <GButton
                  variant="ghost"
                  icon={<Plus className="w-4 h-4" />}
                  text="추가"
                  onClick={addLink}
                />
              </div>

              {(editedProfile.socialLinks || []).length === 0 ? (
                <div className="mt-4 text-sm text-white/45">
                  링크가 없습니다. “추가” 버튼으로 링크를 등록하세요.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {(editedProfile.socialLinks || []).map((link, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border border-white/10 bg-black/20 p-4",
                        "relative overflow-hidden"
                      )}
                    >
                      {/* subtle scanline */}
                      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:100%_3px]" />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-black/40 grid place-items-center border border-white/10">
                            {getSocialIconNode(link)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-white/45">
                              LINK #{idx + 1}
                            </div>
                            <div className="text-sm text-white/85 truncate">
                              {link.platform?.trim()
                                ? link.platform
                                : "플랫폼 미입력"}
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

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <div className="mb-1 text-[11px] text-white/45">
                            플랫폼
                          </div>
                          <input
                            value={link.platform}
                            onChange={e =>
                              updateLink(idx, { platform: e.target.value })
                            }
                            placeholder="instagram / twitter / pixiv ..."
                            className={inputCls}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="mb-1 text-[11px] text-white/45">
                            URL
                          </div>
                          <input
                            value={link.url}
                            onChange={e =>
                              updateLink(idx, { url: e.target.value })
                            }
                            placeholder="https://..."
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HUDPanel>
          </div>
        </Modal>
      </div>
    </div>
  );
}
