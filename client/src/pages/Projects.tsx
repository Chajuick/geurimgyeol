/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Grid layout with asymmetric card placement
- Filter and search with subtle interactions
*/

import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderKanban, Calendar, Tag } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState, useMemo } from 'react';
import { STAGE_LABELS } from '@/types';

export default function Projects() {
  const projects = useStore((state) => state.projects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 모든 태그 수집
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [projects]);
  
  // 필터링된 프로젝트
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = !selectedTag || project.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, searchQuery, selectedTag]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-4xl font-semibold mb-2 brush-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            프로젝트
          </h1>
          <p className="text-muted-foreground">
            작업 과정을 단계별로 관리하고 기록합니다
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            새 프로젝트
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="프로젝트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              전체
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className="gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const finalStage = project.stages.find(s => s.stage === 'final');
            const completedStages = project.stages.filter(s => s.enabled && s.imageUrl).length;
            const totalStages = project.stages.filter(s => s.enabled).length;
            
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
                      <img
                        src="https://private-us-east-1.manuscdn.com/sessionFile/V1f5tyyxqY2Izs5W4gKdwN/sandbox/rsyIFu0fe6tjiDw7Wzjexf-img-5_1770294206000_na1fn_cHJvamVjdC1wbGFjZWhvbGRlcg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVjFmNXR5eXhxWTJJenM1VzRnS2R3Ti9zYW5kYm94L3JzeUlGdTBmZTZ0amlEdzdXempleGYtaW1nLTVfMTc3MDI5NDIwNjAwMF9uYTFmbl9jSEp2YW1WamRDMXdiR0ZqWldodmJHUmxjZy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Nap~ILs6v03zMGV2zBYtXvB34xy8~0jB9Y2nuop-n8qSdwbzEPXNquqT17eqM4ZqK36TLWSy3O2T~9eX6KZhSr95QoYmgNW-~0xpylTdgJSKhBeXPXF7Chouk2LQAQC-kBdEpyM7QR-AO-LfQH4VFur277PTkcXkJaWgDjhl8VkAxXKJd2IbNdzXl9GQ59kPCzHTPfNVLMbV-ixUGYHa4kkKb1V3SEqnQ3MHZVUvdc~fAC8IHP2efTBQMfsx~R1D7ld6f7SIxllllz6rgP3iYkeyvM4jEIiJ-Fn3Ic8XDsf5MnuYmX~OQoh9EI6KLaahGcN4JU3GrGhJ1LbKv69ttw__"
                        alt="Project placeholder"
                        className="w-full h-full object-cover opacity-40"
                      />
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 
                      className="text-xl font-semibold mb-2 line-clamp-1"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.comment || '프로젝트 설명이 없습니다.'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(project.startDate).toLocaleDateString('ko-KR')}</span>
                        {project.endDate && (
                          <>
                            <span>~</span>
                            <span>{new Date(project.endDate).toLocaleDateString('ko-KR')}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FolderKanban className="h-3 w-3" />
                        <span>진행률: {completedStages}/{totalStages} 단계</span>
                      </div>
                    </div>
                    
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-accent/50 text-accent-foreground rounded-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 text-muted-foreground">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {searchQuery || selectedTag ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedTag 
              ? '다른 검색어나 필터를 시도해보세요' 
              : '첫 프로젝트를 만들어보세요'
            }
          </p>
          {!searchQuery && !selectedTag && (
            <Link href="/projects/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                새 프로젝트 만들기
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
