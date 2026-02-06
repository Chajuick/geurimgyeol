/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Hero section with watercolor background
- Asymmetric card layout
- Generous whitespace and natural flow
*/

import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FolderKanban, Image, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Home() {
  const projects = useStore((state) => state.projects);
  const galleryDataMap = useStore((state) => state.galleryDataMap);
  const currentGalleryId = useStore((state) => state.currentGalleryId);
  const currentGallery = galleryDataMap[currentGalleryId];
  const galleryItems = currentGallery?.items || [];
  
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section
        className="relative -mx-6 -mt-8 lg:-mx-12 lg:-mt-12 px-6 lg:px-12 py-24 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663336206210/TPFRpzcdcHvuRXrD.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-3xl">
          <h1 
            className="text-5xl lg:text-6xl font-semibold mb-6 text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            나의 작업실
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
            일러스트 프로젝트를 단계별로 관리하고,<br />
            완성된 작품을 전시 공간처럼 꾸며보세요.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/projects">
              <Button size="lg" className="gap-2">
                <FolderKanban className="h-5 w-5" />
                프로젝트 시작하기
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="gap-2">
                <Image className="h-5 w-5" />
                갤러리 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="wabi-card p-6">
          <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {projects.length}
          </div>
          <div className="text-muted-foreground">진행한 프로젝트</div>
        </div>
        
        <div className="wabi-card p-6">
          <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {projects.filter(p => p.stages.find(s => s.stage === 'final' && s.imageUrl)).length}
          </div>
          <div className="text-muted-foreground">완성된 작품</div>
        </div>
        
        <div className="wabi-card p-6">
          <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {galleryItems.length}
          </div>
          <div className="text-muted-foreground">전시 중인 작품</div>
        </div>
      </section>
      
      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-3xl font-semibold brush-underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              최근 작업
            </h2>
            <Link href="/projects">
              <Button variant="ghost" className="gap-2">
                전체 보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => {
              const finalStage = project.stages.find(s => s.stage === 'final');
              
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="wabi-card overflow-hidden group">
                    {finalStage?.imageUrl ? (
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={finalStage.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                        <FolderKanban className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    <div className="p-5">
                      <h3 
                        className="text-xl font-semibold mb-2 line-clamp-1"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {project.comment || '프로젝트 설명이 없습니다.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-accent/50 text-accent-foreground rounded-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      
      {/* Empty State */}
      {projects.length === 0 && (
        <section className="text-center py-16">
          <div className="max-w-md mx-auto">
            <img
              src="https://private-us-east-1.manuscdn.com/sessionFile/V1f5tyyxqY2Izs5W4gKdwN/sandbox/rsyIFu0fe6tjiDw7Wzjexf-img-4_1770294200000_na1fn_ZW1wdHktc3RhdGUtaWxsdXN0cmF0aW9u.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVjFmNXR5eXhxWTJJenM1VzRnS2R3Ti9zYW5kYm94L3JzeUlGdTBmZTZ0amlEdzdXempleGYtaW1nLTRfMTc3MDI5NDIwMDAwMF9uYTFmbl9aVzF3ZEhrdGMzUmhkR1V0YVd4c2RYTjBjbUYwYVc5dS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=UfZ8VNmG97SNojmoRDGCURfjV2~VdImFeZ1e~8TJErX9Qp6BU1vUEbqBuT-WuyW9PDBTf~rwWsWb4lBNLKeFJodUAmkl9kAGB1PokZ4nM-1f5yYIRAgZGgoRpX0b03Okc8a0tnRlQuIDintxfytDRXnDX8GFyWuh8quvXoj-Xnbt0V5AWCig9VnD5l06GzeLPHuPwsgnLtDWlVwd2hbiIrAWjbY6yvZdfZkvFQASImih4e~GO-ouIvoA~vIRZOw4PmjPzr4802GsqMk4O5d~4gSaeQ2M5pNtJdxQwJ6r24av-7PRC2WmvBffekof12kvvZRRQv7ycZPV5TccOiLlEA__"
              alt="Empty state"
              className="w-full max-w-xs mx-auto mb-8 rounded-lg"
            />
            <h3 
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              첫 프로젝트를 시작해보세요
            </h3>
            <p className="text-muted-foreground mb-6">
              아직 진행 중인 프로젝트가 없습니다.<br />
              새로운 작품을 만들어보세요.
            </p>
            <Link href="/projects">
              <Button size="lg" className="gap-2">
                <FolderKanban className="h-5 w-5" />
                프로젝트 만들기
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
