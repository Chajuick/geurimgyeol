/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Exhibition space with draggable frames
- Natural background textures
- Custom frame and background creation
*/

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Plus, Settings, Trash2, Image as ImageIcon, Palette, Frame, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Gallery() {
  const projects = useStore((state) => state.projects);
  const frames = useStore((state) => state.frames);
  const backgrounds = useStore((state) => state.backgrounds);
  const galleryDataMap = useStore((state) => state.galleryDataMap);
  const currentGalleryId = useStore((state) => state.currentGalleryId);
  const gallery = galleryDataMap[currentGalleryId] || galleryDataMap['gallery-1'];
  const setGalleryBackground = useStore((state) => state.setGalleryBackground);
  const addGalleryItem = useStore((state) => state.addGalleryItem);
  const updateGalleryItem = useStore((state) => state.updateGalleryItem);
  const deleteGalleryItem = useStore((state) => state.deleteGalleryItem);
  const clearGallery = useStore((state) => state.clearGallery);
  const addFrame = useStore((state) => state.addFrame);
  const addBackground = useStore((state) => state.addBackground);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [galleryHeightState, setGalleryHeightState] = useState(600);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Custom Frame Creation State
  const [frameName, setFrameName] = useState('');
  const [frameBorderWidth, setFrameBorderWidth] = useState(8);
  const [frameBorderColor, setFrameBorderColor] = useState('#8B7355');
  const [frameBorderStyle, setFrameBorderStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double' | 'ridge' | 'groove'>('solid');
  const [frameBackgroundColor, setFrameBackgroundColor] = useState('#F5F1E8');
  const [framePadding, setFramePadding] = useState(8);
  const [frameShadowSize, setFrameShadowSize] = useState(8);
  const [frameShadowColor, setFrameShadowColor] = useState('rgba(0,0,0,0.15)');
  const [isTransparentFrame, setIsTransparentFrame] = useState(false);
  
  // Custom Background Creation State
  const [backgroundName, setBackgroundName] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  
  const [location] = useLocation();
  const galleries = useStore((state) => state.galleries);
  const storeCurrentGalleryId = useStore((state) => state.currentGalleryId);
  const createGallery = useStore((state) => state.createGallery);
  const deleteGallery = useStore((state) => state.deleteGallery);
  const switchGallery = useStore((state) => state.switchGallery);
  const renameGallery = useStore((state) => state.renameGallery);
  const updateGalleryHeight = useStore((state) => state.setGalleryHeight);
  const setGalleryName = useStore((state) => state.setGalleryName);
  
  const [newGalleryName, setNewGalleryName] = useState('');
  const [renamingGalleryId, setRenamingGalleryId] = useState<string | null>(null);
  const [renamingGalleryName, setRenamingGalleryName] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const galleryParam = params.get('gallery');
    
    if (galleryParam) {
      try {
        const decodedData = JSON.parse(atob(galleryParam));
        if (decodedData.backgroundId) {
          setGalleryBackground(decodedData.backgroundId);
        }
      } catch (error) {
        console.error('Failed to load shared gallery:', error);
      }
    }
  }, []);
  
  const currentBackground = backgrounds.find(b => b.id === gallery.backgroundId);
  const availableProjects = projects.filter(p => 
    p.stages.find(s => s.stage === 'final' && s.imageUrl)
  );
  
  const handleAddToGallery = () => {
    if (!selectedProject || !selectedFrame) {
      toast.error('프로젝트와 액자를 선택해주세요');
      return;
    }
    
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;
    
    addGalleryItem({
      projectId: selectedProject,
      frameId: selectedFrame,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 400 },
      rotation: 0,
      zIndex: gallery.items.length
    });
    
    toast.success('갤러리에 작품이 추가되었습니다');
    setSelectedProject('');
    setSelectedFrame('');
  };
  
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    const item = gallery.items.find(i => i.id === itemId);
    if (!item) return;
    
    setDraggedItemId(itemId);
    setDragOffset({
      x: e.clientX - item.position.x,
      y: e.clientY - item.position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItemId || !galleryRef.current) return;
    
    const rect = galleryRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    updateGalleryItem(draggedItemId, {
      position: { x, y }
    });
  };
  
  const handleMouseUp = () => {
    setDraggedItemId(null);
  };
  
  const handleCreateFrame = () => {
    if (!frameName.trim()) {
      toast.error('액자 이름을 입력해주세요');
      return;
    }
    
    addFrame({
      name: frameName,
      borderWidth: isTransparentFrame ? 0 : frameBorderWidth,
      borderColor: isTransparentFrame ? 'transparent' : frameBorderColor,
      borderStyle: frameBorderStyle,
      backgroundColor: isTransparentFrame ? 'transparent' : frameBackgroundColor,
      padding: isTransparentFrame ? 0 : framePadding,
      shadowSize: isTransparentFrame ? 0 : frameShadowSize,
      shadowColor: isTransparentFrame ? 'transparent' : frameShadowColor,
      isTransparent: isTransparentFrame
    });
    
    toast.success('커스텀 액자가 생성되었습니다');
    
    // Reset form
    setFrameName('');
    setFrameBorderWidth(8);
    setFrameBorderColor('#8B7355');
    setFrameBorderStyle('solid');
    setFrameBackgroundColor('#F5F1E8');
    setFramePadding(8);
    setFrameShadowSize(8);
    setFrameShadowColor('rgba(0,0,0,0.15)');
    setIsTransparentFrame(false);
  };
  
  const handleCreateBackground = () => {
    if (!backgroundName.trim()) {
      toast.error('배경 이름을 입력해주세요');
      return;
    }
    
    if (!backgroundImageUrl.trim()) {
      toast.error('배경 이미지 URL을 입력해주세요');
      return;
    }
    
    addBackground({
      name: backgroundName,
      imageUrl: backgroundImageUrl
    });
    
    toast.success('커스텀 배경이 생성되었습니다');
    
    // Reset form
    setBackgroundName('');
    setBackgroundImageUrl('');
  };
  
  return (
    <div className="space-y-6">
      {/* Gallery Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium">갤러리:</span>
        <div className="flex gap-2 flex-wrap">
          {galleries.map((gal) => (
            <div key={gal.id} className="flex items-center gap-1">
              <Button
                variant={gal.id === currentGalleryId ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchGallery(gal.id)}
              >
                {gal.name}
              </Button>
              {gal.id === currentGalleryId && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setRenamingGalleryName(gal.name)}>
                      ✏️
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>갤러리 이름 변경</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        value={renamingGalleryName}
                        onChange={(e) => setRenamingGalleryName(e.target.value)}
                        placeholder="새로운 갤러리 이름"
                      />
                      <Button
                        onClick={() => {
                          renameGallery(gal.id, renamingGalleryName);
                          setRenamingGalleryName('');
                          toast.success('갤러리 이름이 변경되었습니다');
                        }}
                        className="w-full"
                      >
                        변경하기
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {galleries.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    deleteGallery(gal.id);
                    toast.success('갤러리가 삭제되었습니다');
                  }}
                >
                  🗑️
                </Button>
              )}
            </div>
          ))}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              새 갤러리
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 갤러리 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={newGalleryName}
                onChange={(e) => setNewGalleryName(e.target.value)}
                placeholder="갤러리 이름"
              />
              <Button
                onClick={() => {
                  if (newGalleryName.trim()) {
                    createGallery(newGalleryName);
                    setNewGalleryName('');
                    toast.success('새 갤러리가 생성되었습니다');
                  }
                }}
                className="w-full"
              >
                생성하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-4xl font-semibold mb-2 brush-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            갤러리
          </h1>
          <p className="text-muted-foreground">
            완성된 작품을 전시 공간처럼 배치합니다
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              const galleryData = btoa(JSON.stringify(gallery));
              const shareUrl = `${window.location.origin}${window.location.pathname}?gallery=${galleryData}`;
              navigator.clipboard.writeText(shareUrl);
              toast.success('공유 링크가 복사되었습니다');
            }}
          >
            <Share2 className="h-4 w-4" />
            공유
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                작품 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>갤러리에 작품 추가</DialogTitle>
                <DialogDescription>
                  완성된 작품을 선택하고 액자를 골라주세요
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">프로젝트 선택</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="프로젝트를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">액자 선택</label>
                  <Select value={selectedFrame} onValueChange={setSelectedFrame}>
                    <SelectTrigger>
                      <SelectValue placeholder="액자를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {frames.map(frame => (
                        <SelectItem key={frame.id} value={frame.id}>
                          {frame.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddToGallery} className="w-full">
                  추가하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>갤러리 설정</DialogTitle>
                <DialogDescription>
                  배경, 높이를 조정하거나 액자/배경을 커스터마이징할 수 있습니다
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">기본 설정</TabsTrigger>
                  <TabsTrigger value="frame">액자 생성</TabsTrigger>
                  <TabsTrigger value="background">배경 생성</TabsTrigger>
                </TabsList>
                
                {/* Basic Settings */}
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">배경 선택</label>
                    <Select value={gallery.backgroundId} onValueChange={setGalleryBackground}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgrounds.map(bg => (
                          <SelectItem key={bg.id} value={bg.id}>
                            {bg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      갤러리 높이: {galleryHeightState}px
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="50"
                      value={galleryHeightState}
                      onChange={(e) => setGalleryHeightState(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      작품이 많을 때 높이를 늘려서 더 많은 작품을 배치할 수 있습니다
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clearGallery();
                      toast.success('갤러리가 초기화되었습니다');
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    갤러리 초기화
                  </Button>
                </TabsContent>
                
                {/* Custom Frame Creation */}
                <TabsContent value="frame" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="frame-name">액자 이름</Label>
                    <Input
                      id="frame-name"
                      value={frameName}
                      onChange={(e) => setFrameName(e.target.value)}
                      placeholder="예: 내 스타일 액자"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="transparent-frame"
                      checked={isTransparentFrame}
                      onChange={(e) => setIsTransparentFrame(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="transparent-frame" className="cursor-pointer">
                      투명 액자 (낡만 보이기)
                    </Label>
                  </div>
                  
                  {!isTransparentFrame && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="border-width">테두리 두께: {frameBorderWidth}px</Label>
                      <input
                        id="border-width"
                        type="range"
                        min="1"
                        max="30"
                        value={frameBorderWidth}
                        onChange={(e) => setFrameBorderWidth(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="border-color">테두리 색상</Label>
                      <div className="flex gap-2">
                        <input
                          id="border-color"
                          type="color"
                          value={frameBorderColor}
                          onChange={(e) => setFrameBorderColor(e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={frameBorderColor}
                          onChange={(e) => setFrameBorderColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="border-style">테두리 스타일</Label>
                      <Select value={frameBorderStyle} onValueChange={(v: any) => setFrameBorderStyle(v)}>
                        <SelectTrigger id="border-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">실선</SelectItem>
                          <SelectItem value="dashed">점선</SelectItem>
                          <SelectItem value="dotted">점</SelectItem>
                          <SelectItem value="double">이중선</SelectItem>
                          <SelectItem value="ridge">릿지</SelectItem>
                          <SelectItem value="groove">그루브</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">배경 색상</Label>
                      <div className="flex gap-2">
                        <input
                          id="bg-color"
                          type="color"
                          value={frameBackgroundColor}
                          onChange={(e) => setFrameBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={frameBackgroundColor}
                          onChange={(e) => setFrameBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="padding">패딩: {framePadding}px</Label>
                      <input
                        id="padding"
                        type="range"
                        min="0"
                        max="30"
                        value={framePadding}
                        onChange={(e) => setFramePadding(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shadow-size">그림자 크기: {frameShadowSize}px</Label>
                      <input
                        id="shadow-size"
                        type="range"
                        min="0"
                        max="20"
                        value={frameShadowSize}
                        onChange={(e) => setFrameShadowSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  )}
                  
                  {/* Preview */}
                  <div className="mt-6 p-4 border-2 border-border/50 rounded-lg bg-background">
                    <p className="text-sm font-medium mb-3">미리보기</p>
                    <div
                      style={{
                        padding: `${framePadding}px`,
                        backgroundColor: frameBackgroundColor,
                        border: `${frameBorderWidth}px ${frameBorderStyle} ${frameBorderColor}`,
                        boxShadow: `${frameShadowSize}px ${frameShadowSize}px ${frameShadowSize * 2}px ${frameShadowColor}`,
                        width: '200px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        미리보기
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleCreateFrame} className="w-full">
                    <Frame className="h-4 w-4 mr-2" />
                    액자 생성
                  </Button>
                </TabsContent>
                
                {/* Custom Background Creation */}
                <TabsContent value="background" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-name">배경 이름</Label>
                    <Input
                      id="bg-name"
                      value={backgroundName}
                      onChange={(e) => setBackgroundName(e.target.value)}
                      placeholder="예: 내 배경"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bg-url">이미지 URL</Label>
                    <Input
                      id="bg-url"
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      placeholder="https://example.com/background.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      이미지 URL을 입력하면 갤러리 배경으로 사용됩니다
                    </p>
                  </div>
                  
                  {/* Preview */}
                  {backgroundImageUrl && (
                    <div className="mt-4 p-4 border-2 border-border/50 rounded-lg">
                      <p className="text-sm font-medium mb-3">미리보기</p>
                      <div
                        style={{
                          backgroundImage: `url(${backgroundImageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          width: '100%',
                          height: '200px',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>
                  )}
                  
                  <Button onClick={handleCreateBackground} className="w-full">
                    <Palette className="h-4 w-4 mr-2" />
                    배경 생성
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Gallery Canvas */}
      <div
        ref={galleryRef}
        className="relative w-full rounded-lg overflow-hidden border-2 border-border/50"
        style={{
          minHeight: '300px',
          height: `${galleryHeightState}px`,
          backgroundImage: currentBackground ? `url(${currentBackground.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: draggedItemId ? 'grabbing' : 'default'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {gallery.items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                갤러리가 비어있습니다
              </h3>
              <p className="text-muted-foreground mb-4">
                완성된 작품을 추가하여 전시해보세요
              </p>
            </div>
          </div>
        ) : (
          gallery.items.map(item => {
            const project = projects.find(p => p.id === item.projectId);
            const frame = frames.find(f => f.id === item.frameId);
            const finalStage = project?.stages.find(s => s.stage === 'final');
            
            if (!project || !frame || !finalStage?.imageUrl) return null;
            
            return (
              <div
                key={item.id}
                className="absolute group"
                style={{
                  left: `${item.position.x}px`,
                  top: `${item.position.y}px`,
                  width: `${item.size.width}px`,
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: item.zIndex,
                  cursor: draggedItemId === item.id ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
              >
                {/* Frame */}
                <div
                  className="relative transition-shadow duration-300 group-hover:shadow-xl"
                  style={{
                    padding: `${frame.padding}px`,
                    backgroundColor: frame.backgroundColor,
                    border: `${frame.borderWidth}px ${frame.borderStyle} ${frame.borderColor}`,
                    boxShadow: `${frame.shadowSize}px ${frame.shadowSize}px ${frame.shadowSize * 2}px ${frame.shadowColor}`
                  }}
                >
                  <img
                    src={finalStage.imageUrl}
                    alt={project.title}
                    className="w-full h-auto pointer-events-none select-none"
                    draggable={false}
                  />
                  
                  {/* Controls */}
                  <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGalleryItem(item.id);
                        toast.success('작품이 제거되었습니다');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Title label */}
                  <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="inline-block bg-background/90 backdrop-blur-sm px-3 py-1 rounded-sm text-sm">
                      {project.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {availableProjects.length === 0 && (
        <div className="text-center py-8 wabi-card">
          <p className="text-muted-foreground">
            아직 완성된 작품이 없습니다. 프로젝트의 '작품' 단계에 이미지를 업로드해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
