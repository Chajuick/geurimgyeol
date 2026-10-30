import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Globe,
  Globe2,
  Instagram,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useLocation } from "wouter";
import { SiPixiv } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
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

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const inputCls = cn(
  "w-full h-10 px-3 rounded-xl text-sm",
  "bg-white/[0.04] text-white/90",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-brand/40 focus:border-brand/40",
  "transition"
);

const textareaCls = cn(
  "w-full rounded-xl px-3 py-2 text-sm",
  "bg-white/[0.04] text-white/90",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-brand/40 focus:border-brand/40",
  "transition",
  "resize-none leading-relaxed"
);

export default function Profile() {
  const { data, setData, editMode } = usePortfolioContext();
  const [, setLocation] = useLocation();
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

  const archive = [
    {
      label: "세계관",
      value: data.worlds?.length ?? 0,
      path: "/worlds",
      icon: Globe2,
    },
    {
      label: "캐릭터",
      value: data.characters?.length ?? 0,
      path: "/characters",
      icon: UserRound,
    },
    {
      label: "크리쳐",
      value: data.creatures?.length ?? 0,
      path: "/creatures",
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden gyeol-bg text-white">
      {/* #region Ambient */}
      {resolvedProfileImg && (
        <img
          src={resolvedProfileImg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[70svh] w-[120%] max-w-none -translate-x-1/2 object-cover opacity-[0.12] blur-3xl saturate-150"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_10%,rgba(129,140,248,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background to-transparent" />
      {/* #endregion */}

      {editMode && (
        <div className="absolute top-4 left-4 md:left-auto md:right-6 z-20">
          <GButton
            variant="neutral"
            icon={<Pencil className="w-4 h-4" />}
            text="프로필 수정"
            onClick={openEdit}
          />
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-4 sm:px-6 pt-24 sm:pt-28 pb-16 text-center"
      >
        {/* avatar */}
        <motion.div variants={rise} className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle,rgba(165,180,252,0.25),transparent_70%)] blur-2xl"
          />
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-[32px] border border-white/15 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {resolvedProfileImg ? (
              <img
                src={resolvedProfileImg}
                alt={profile?.name || "profile"}
                className="h-full w-full object-cover"
                decoding="async"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-white/40">
                <UserRound className="h-10 w-10" />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={rise} className="mt-8 gyeol-eyebrow">
          Creator
        </motion.div>

        <motion.h1
          variants={rise}
          className="mt-3 font-display text-5xl sm:text-6xl font-semibold tracking-[-0.03em]"
        >
          {profile?.name || "그림결"}
        </motion.h1>

        <motion.p
          variants={rise}
          className="mt-5 max-w-xl text-[15px] sm:text-base leading-[1.9] text-white/60 whitespace-pre-line break-keep"
        >
          {profile?.bio?.trim()
            ? profile.bio
            : editMode
              ? "소개가 비어있어요. ‘프로필 수정’에서 내용을 추가해보세요."
              : ""}
        </motion.p>

        {/* links */}
        {cleanedViewLinks.length > 0 && (
          <motion.div
            variants={rise}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {cleanedViewLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-10 pl-3.5 pr-3 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur text-sm text-white/80 transition-colors hover:bg-white/[0.09] hover:border-white/20 hover:text-white"
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4">
                  {getSocialIconNode(link)}
                </span>
                <span className="capitalize">{link.platform}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/35 transition-[color,transform] group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </motion.div>
        )}

        {/* archive */}
        <motion.div
          variants={rise}
          className="mt-14 grid w-full grid-cols-3 gap-2 sm:gap-3"
        >
          {archive.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => setLocation(a.path)}
                className="group gyeol-surface flex flex-col items-center gap-1 px-3 py-5 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <Icon className="h-4 w-4 text-white/40 group-hover:text-brand transition-colors" />
                <span className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {a.value}
                </span>
                <span className="text-xs text-white/45">{a.label}</span>
              </button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* #region Edit Modal */}
      <Modal
        open={isEditing && editMode}
        onClose={closeEdit}
        title="프로필 편집"
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="ghost" text="취소" onClick={closeEdit} />
            <GButton
              variant="primary"
              text="저장"
              onClick={handleSaveProfile}
            />
          </div>
        }
      >
        <div className="p-5 sm:p-7 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-6">
            <EditField label="프로필 이미지">
              <ImageUpload
                value={editedProfile.profileImage}
                onChange={value => handleProfileChange("profileImage", value)}
                aspect="square"
              />
            </EditField>

            <div className="space-y-5 min-w-0">
              <EditField label="이름">
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={e => handleProfileChange("name", e.target.value)}
                  className={inputCls}
                  placeholder="이름을 입력하세요"
                />
              </EditField>
              <EditField label="소개">
                <textarea
                  rows={6}
                  value={editedProfile.bio}
                  onChange={e => handleProfileChange("bio", e.target.value)}
                  className={textareaCls}
                  placeholder="소개를 입력하세요"
                />
              </EditField>
            </div>
          </div>

          <div className="h-px bg-white/[0.07]" />

          {/* social links */}
          <section>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white/85">링크</h3>
                <p className="mt-1 text-xs text-white/40">
                  플랫폼 이름으로 아이콘이 자동 매칭돼요 (instagram, x/twitter,
                  pixiv)
                </p>
              </div>
              <GButton
                variant="neutral"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                text="링크 추가"
                onClick={addLink}
              />
            </div>

            {(editedProfile.socialLinks || []).length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                등록된 링크가 없어요
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {(editedProfile.socialLinks || []).map((link, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-2"
                  >
                    <div className="flex items-center gap-2 sm:w-52 shrink-0">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-white/70 [&_svg]:h-4 [&_svg]:w-4">
                        {getSocialIconNode(link)}
                      </span>
                      <input
                        value={link.platform}
                        onChange={e =>
                          updateLink(idx, { platform: e.target.value })
                        }
                        placeholder="플랫폼"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        value={link.url}
                        onChange={e => updateLink(idx, { url: e.target.value })}
                        placeholder="https://..."
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        title="삭제"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/45 hover:bg-red-500/80 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Modal>
      {/* #endregion */}
    </div>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-white/60">{label}</div>
      {children}
    </div>
  );
}
