/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Timeline-style stage presentation
- Natural flow with generous spacing
*/

import { useParams, useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { ArrowLeft, Edit, Trash2, Calendar, Tag, Wrench } from 'lucide-react';
import { STAGE_LABELS } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProjectDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const projectId = params.id;
  
  const getProject = useStore((state) => state.getProject);
  const deleteProject = useStore((state) => state.deleteProject);
  
  const project = projectId ? getProject(projectId) : null;
  
  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">프로젝트를 찾을 수 없습니다</h2>
        <Link href="/projects">
          <Button>프로젝트 목록으로</Button>
        </Link>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (projectId) {
      deleteProject(projectId);
      toast.success('프로젝트가 삭제되었습니다');
      setLocation('/projects');
    }
  };
  
  const enabledStages = project.stages.filter(s => s.enabled);
  
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 
              className="text-4xl font-semibold mb-3 brush-underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {project.title}
            </h1>
            {project.comment && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {project.comment}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Meta Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wabi-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>작업 기간</span>
          </div>
          <div className="font-medium">
            {new Date(project.startDate).toLocaleDateString('ko-KR')}
            {project.endDate && (
              <>
                <br />~ {new Date(project.endDate).toLocaleDateString('ko-KR')}
              </>
            )}
          </div>
        </div>
        
        {project.tools.length > 0 && (
          <div className="wabi-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Wrench className="h-4 w-4" />
              <span>사용 툴</span>
            </div>
            <div className="font-medium">
              {project.tools.join(', ')}
            </div>
          </div>
        )}
        
        {project.subject && (
          <div className="wabi-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Tag className="h-4 w-4" />
              <span>주제</span>
            </div>
            <div className="font-medium">
              {project.subject}
            </div>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-accent/50 text-accent-foreground rounded-sm text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Stages Timeline */}
      <section className="space-y-8">
        <h2 
          className="text-3xl font-semibold brush-underline"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          작업 단계
        </h2>
        
        <div className="space-y-12">
          {enabledStages.map((stageData, index) => (
            <div key={stageData.stage} className="relative">
              {/* Timeline connector */}
              {index < enabledStages.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-border/50 -mb-12" />
              )}
              
              <div className="flex gap-6">
                {/* Stage number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold relative z-10">
                  {index + 1}
                </div>
                
                {/* Stage content */}
                <div className="flex-1 pb-4">
                  <h3 
                    className="text-2xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {STAGE_LABELS[stageData.stage]}
                  </h3>
                  
                  {stageData.imageUrl && (
                    <div className="wabi-card overflow-hidden mb-4 max-w-3xl">
                      <img
                        src={stageData.imageUrl}
                        alt={STAGE_LABELS[stageData.stage]}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {stageData.description && (
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      {stageData.description}
                    </p>
                  )}
                  
                  {!stageData.imageUrl && !stageData.description && (
                    <p className="text-sm text-muted-foreground italic">
                      이 단계는 아직 작업 중입니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Learnings & Memo */}
      {(project.learnings || project.memo) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.learnings && (
            <div className="wabi-card p-6">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                배운 점
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.learnings}
              </p>
            </div>
          )}
          
          {project.memo && (
            <div className="wabi-card p-6">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                메모
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.memo}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
