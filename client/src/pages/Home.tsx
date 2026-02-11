import ImageUpload from "@/components/ImageUpload";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Compass, Edit2, Send } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { data, setData, editMode } = usePortfolioContext();
  const [, setLocation] = useLocation();

  const appliedBg = data.settings.heroBackgroundImage;

  const [isEditingBg, setIsEditingBg] = useState(false);
  const [draftBgUrl, setDraftBgUrl] = useState(appliedBg || "");

  const openBgModal = () => {
    setDraftBgUrl(appliedBg || "");
    setIsEditingBg(true);
  };

  const saveBackground = () => {
    setData({
      ...data,
      settings: {
        ...data.settings,
        heroBackgroundImage: draftBgUrl,
      },
    });
    setIsEditingBg(false);
  };

  const cancelBackground = () => {
    setDraftBgUrl(appliedBg || "");
    setIsEditingBg(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Hero Section */}
      <section
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: appliedBg
            ? `url(${appliedBg})`
            : "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Content */}
        <div className="gyeol-home-content absolute z-10 bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-12 max-w-3xl px-8 py-6 bg-black/50 backdrop-blur-md rounded-sm shadow-2xl">
          <h1 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
            {data.profile.name}
          </h1>
          <p className="text-base text-white/90 drop-shadow-md mb-4 leading-relaxed">
            {data.profile.bio}
          </p>

          <div className="flex flex-row gap-4 justify-start">
            <button
              onClick={() => setLocation("/worlds")}
              className="text-sm px-6 py-3 bg-black/70 text-white rounded-sm font-semibold hover:bg-black/50 transition-colors duration-200 shadow-lg flex flex-row gap-2 items-center"
            >
              <Compass size={18} strokeWidth={2.8} />
              Enter
            </button>
            <button
              onClick={() => setLocation("/profile")}
              className="text-sm px-8 py-3 bg-black/70 text-white rounded-sm font-semibold hover:bg-black/50 transition-colors duration-200 shadow-lg flex flex-row gap-2 items-center"
            >
              <Send size={18} strokeWidth={2.8} />
              Contact
            </button>
          </div>
        </div>

        {/* Edit Background Button */}
        {editMode && (
          <button
            onClick={openBgModal}
            className="absolute top-6 right-6 z-20 p-3 bg-white/90 rounded-lg hover:bg-white transition-colors duration-200 shadow-lg"
            title="배경 이미지 변경"
          >
            <Edit2 className="w-5 h-5 text-black" />
          </button>
        )}
      </section>

      {isEditingBg && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={cancelBackground}
          />

          {/* panel */}
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                배경 이미지 변경
              </h2>
              <button
                onClick={cancelBackground}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="px-5 py-6">
              <ImageUpload value={draftBgUrl} onChange={setDraftBgUrl} />
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={cancelBackground}
                className="px-4 h-10 rounded-lg border border-zinc-200 text-black dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                취소
              </button>
              <button
                onClick={saveBackground}
                className="
                  px-4 h-10 rounded-lg
                  bg-black text-white
                  text-sm font-semibold
                  hover:bg-zinc-800
                  active:bg-zinc-900
                  transition-colors
                "
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
