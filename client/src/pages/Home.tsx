import ImageUpload from '@/components/ImageUpload';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Compass, Edit2, Send } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const { data, setData, editMode } = usePortfolioContext();
  const [, setLocation] = useLocation();
  const [backgroundUrl, setBackgroundUrl] = useState(data.settings.heroBackgroundImage);
  const [isEditingBg, setIsEditingBg] = useState(false);

  const handleBackgroundChange = (value: string) => {
    setBackgroundUrl(value);
        const newData = {
      ...data,
      settings: {
        ...data.settings,
        heroBackgroundImage: backgroundUrl,
      },
    };
    setData(newData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Hero Section */}
      <section
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: backgroundUrl
            ? `url(${backgroundUrl})`
            : 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Content */}
        <div className="gyeol-home-content absolute z-10 bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-12 max-w-3xl px-10 py-6 bg-black/50 backdrop-blur-md rounded-sm shadow-2xl">
          <h1 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
            {data.profile.name}
          </h1>
          <p className="text-base text-white/90 drop-shadow-md mb-4 leading-relaxed">
            {data.profile.bio}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-4 justify-start">
            <button
              onClick={() => setLocation('/worlds')}
              className="px-6 py-3 bg-black/70 text-white rounded-sm font-semibold hover:bg-black/50 transition-colors duration-200 shadow-lg flex flex-row gap-2 items-center"
            >
              <Compass size={18} strokeWidth={2.8} />Enter
            </button>
            <button
              onClick={() => setLocation('/profile')}
              className="px-8 py-3 bg-black/70 text-white rounded-sm font-semibold hover:bg-black/50 transition-colors duration-200 shadow-lg flex flex-row gap-2 items-center">
              <Send size={18} strokeWidth={2.8} />Contact
            </button>
          </div>
        </div>

        {/* Edit Background Button */}
        {editMode && (
          <button
            onClick={() => setIsEditingBg(true)}
            className="absolute top-6 right-6 z-20 p-3 bg-white/90 rounded-lg hover:bg-white transition-colors duration-200 shadow-lg"
            title="배경 이미지 변경"
          >
            <Edit2 className="w-5 h-5 text-black" />
          </button>
        )}

        {/* Scroll Indicator */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/70 text-sm">스크롤</span>
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div> */}
      </section>

      {/* Background Edit Modal */}
      {isEditingBg && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">배경 이미지 변경</h2>
            <ImageUpload value={backgroundUrl} onChange={handleBackgroundChange} />
            <div className="flex mt-2">
              <button
                onClick={() => setIsEditingBg(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Section */}
      {/* <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">
            포트폴리오 둘러보기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '세계관', icon: '🌍', path: '/worlds' },
              { title: '캐릭터', icon: '👤', path: '/characters' },
              { title: '크리쳐', icon: '🐉', path: '/creatures' },
              { title: '프로필', icon: '✨', path: '/profile' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="card-elevated p-8 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}
