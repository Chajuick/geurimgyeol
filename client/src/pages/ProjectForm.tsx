/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Clean form layout with natural flow
- Stage management with drag-and-drop feel
*/

import { useLocation, useParams, useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { WorkStage, STAGE_LABELS, StageImage, Project } from '@/types';
import { ArrowLeft, Save, Upload, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { fileToBase64 } from '@/lib/storage';
import { Checkbox } from '@/components/ui/checkbox';

const DEFAULT_STAGES: WorkStage[] = ['rough', 'lineart', 'basecolor', 'shading', 'detail', 'correction', 'final'];

export default function ProjectForm() {
  const params = useParams();
  const [, setLocation] = useLocation();

  const projectId = params.id;
  
  const getProject = useStore((state) => state.getProject);
  const addProject = useStore((state) => state.addProject);
  const updateProject = useStore((state) => state.updateProject);
  
  const existingProject = projectId ? getProject(projectId) : null;
  const isEdit = !!existingProject;
  
  // Form state
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [learnings, setLearnings] = useState('');
  const [memo, setMemo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [tools, setTools] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [stages, setStages] = useState<StageImage[]>([]);
  
  // Initialize form with existing data
  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setComment(existingProject.comment);
      setLearnings(existingProject.learnings);
      setMemo(existingProject.memo);
      setStartDate(existingProject.startDate);
      setEndDate(existingProject.endDate);
      setPublishDate(existingProject.publishDate);
      setTools(existingProject.tools.join(', '));
      setSubject(existingProject.subject);
      setTags(existingProject.tags.join(', '));
      setStages(existingProject.stages);
    } else {
      // Initialize with default stages
      setStages(
        DEFAULT_STAGES.map(stage => ({
          stage,
          imageUrl: null,
          description: '',
          enabled: true
        }))
      );
      setStartDate(new Date().toISOString().split('T')[0]);
      setPublishDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingProject]);
  
  const handleImageUpload = async (stage: WorkStage, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setStages(prev =>
        prev.map(s =>
          s.stage === stage ? { ...s, imageUrl: base64 } : s
        )
      );
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      toast.error('이미지 업로드에 실패했습니다');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('프로젝트 제목을 입력해주세요');
      return;
    }
    
    const projectData = {
      title: title.trim(),
      comment: comment.trim(),
      learnings: learnings.trim(),
      memo: memo.trim(),
      startDate,
      endDate,
      publishDate,
      tools: tools.split(',').map(t => t.trim()).filter(Boolean),
      subject: subject.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      stages
    };
    
    if (isEdit && projectId) {
      updateProject(projectId, projectData);
      toast.success('프로젝트가 수정되었습니다');
    } else {
      addProject(projectData);
      toast.success('프로젝트가 생성되었습니다');
    }
    
    setLocation('/projects');
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/projects')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 
            className="text-4xl font-semibold brush-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isEdit ? '프로젝트 수정' : '새 프로젝트'}
          </h1>
          <p className="text-muted-foreground mt-1">
            작업 과정을 단계별로 기록합니다
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="wabi-card p-6 space-y-6">
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            기본 정보
          </h2>
          
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 봄날의 풍경화"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">간단한 코멘트</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이 프로젝트에 대한 간단한 설명을 작성해주세요"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publishDate">게시 날짜</Label>
            <Input
              id="publishDate"
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">주제</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 풍경, 인물, 판타지"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tools">사용 툴 (쉼표로 구분)</Label>
            <Input
              id="tools"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="예: Photoshop, Procreate, Clip Studio"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 일러스트, 디지털페인팅, 풍경화"
            />
          </div>
        </section>
        
        {/* Learnings & Memo */}
        <section className="wabi-card p-6 space-y-6">
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            작업 노트
          </h2>
          
          <div className="space-y-2">
            <Label htmlFor="learnings">배운 점</Label>
            <Textarea
              id="learnings"
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="이 프로젝트를 통해 배운 기술이나 인사이트를 기록하세요"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="자유롭게 메모를 작성하세요"
              rows={4}
            />
          </div>
        </section>
        
        {/* Stages */}
        <section className="wabi-card p-6 space-y-6">
          <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            작업 단계
          </h2>
          
          <div className="space-y-4">
            {stages.map((stageData) => (
              <div
                key={stageData.stage}
                className={`p-4 rounded-sm border transition-all ${
                  stageData.enabled ? 'border-border bg-background' : 'border-border/30 bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={stageData.enabled}
                    onCheckedChange={(checked) => {
                      setStages(prev =>
                        prev.map(s =>
                          s.stage === stageData.stage ? { ...s, enabled: !!checked } : s
                        )
                      );
                    }}
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{STAGE_LABELS[stageData.stage]}</h3>
                      {stageData.enabled && (
                        <div className="flex items-center gap-2">
                          {stageData.imageUrl ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStages(prev =>
                                  prev.map(s =>
                                    s.stage === stageData.stage ? { ...s, imageUrl: null } : s
                                  )
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleImageUpload(stageData.stage, file);
                                };
                                input.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              이미지 업로드
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {stageData.enabled && stageData.imageUrl && (
                      <div className="aspect-video w-full max-w-md rounded-sm overflow-hidden border border-border">
                        <img
                          src={stageData.imageUrl}
                          alt={STAGE_LABELS[stageData.stage]}
                          className="w-full h-full object-contain bg-muted"
                        />
                      </div>
                    )}
                    
                    {stageData.enabled && (
                      <Textarea
                        value={stageData.description}
                        onChange={(e) => {
                          setStages(prev =>
                            prev.map(s =>
                              s.stage === stageData.stage ? { ...s, description: e.target.value } : s
                            )
                          );
                        }}
                        placeholder="이 단계에 대한 설명을 작성하세요"
                        rows={2}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/projects')}
          >
            취소
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {isEdit ? '수정 완료' : '프로젝트 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}
