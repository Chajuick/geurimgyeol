import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, Crop } from "lucide-react";
import { makeImgKey, saveImageBlob } from "@/lib/imageStore";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type Rect = { x: number; y: number; w: number; h: number };
type DragMode = "draw" | "move" | "nw" | "ne" | "sw" | "se" | null;

const HANDLE_HIT = 14;
const HANDLE_SIZE = 8;

function clampRect(r: Rect, W: number, H: number): Rect {
  let { x, y, w, h } = r;
  if (w < 0) {
    x += w;
    w = -w;
  }
  if (h < 0) {
    y += h;
    h = -h;
  }
  x = Math.max(0, Math.min(x, W - 4));
  y = Math.max(0, Math.min(y, H - 4));
  w = Math.max(4, Math.min(w, W - x));
  h = Math.max(4, Math.min(h, H - y));
  return { x, y, w, h };
}

function getDragMode(px: number, py: number, c: Rect): DragMode {
  const hs = HANDLE_HIT;
  if (Math.abs(px - c.x) < hs && Math.abs(py - c.y) < hs) return "nw";
  if (Math.abs(px - (c.x + c.w)) < hs && Math.abs(py - c.y) < hs) return "ne";
  if (Math.abs(px - c.x) < hs && Math.abs(py - (c.y + c.h)) < hs) return "sw";
  if (Math.abs(px - (c.x + c.w)) < hs && Math.abs(py - (c.y + c.h)) < hs)
    return "se";
  if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h)
    return "move";
  return "draw";
}

function modeToCursor(mode: DragMode): string {
  switch (mode) {
    case "nw":
      return "nw-resize";
    case "ne":
      return "ne-resize";
    case "sw":
      return "sw-resize";
    case "se":
      return "se-resize";
    case "move":
      return "move";
    default:
      return "crosshair";
  }
}

type Props = {
  mainImageKey: string;
  onConfirm: (profileKey: string) => void;
  onCancel: () => void;
};

export default function ImageCropPicker({
  mainImageKey,
  onConfirm,
  onCancel,
}: Props) {
  const resolvedSrc = useResolvedImage(mainImageKey);
  const hiddenImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const [hoverMode, setHoverMode] = useState<DragMode>(null);
  const [error, setError] = useState("");

  const cropRef = useRef<Rect | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startMx: number;
    startMy: number;
    startCrop: Rect;
  } | null>(null);

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  // Redraw canvas when crop changes
  const redrawCanvas = useCallback((c: Rect | null) => {
    const canvas = canvasRef.current;
    const img = hiddenImgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    if (!c) return;

    // Dark mask outside crop
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, W, c.y);
    ctx.fillRect(0, c.y + c.h, W, H - c.y - c.h);
    ctx.fillRect(0, c.y, c.x, c.h);
    ctx.fillRect(c.x + c.w, c.y, W - c.x - c.w, c.h);

    // Crop border
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);

    // Rule of thirds
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(c.x + c.w / 3, c.y);
    ctx.lineTo(c.x + c.w / 3, c.y + c.h);
    ctx.moveTo(c.x + (2 * c.w) / 3, c.y);
    ctx.lineTo(c.x + (2 * c.w) / 3, c.y + c.h);
    ctx.moveTo(c.x, c.y + c.h / 3);
    ctx.lineTo(c.x + c.w, c.y + c.h / 3);
    ctx.moveTo(c.x, c.y + (2 * c.h) / 3);
    ctx.lineTo(c.x + c.w, c.y + (2 * c.h) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner handles
    const hs = HANDLE_SIZE;
    ctx.fillStyle = "white";
    (
      [
        [c.x, c.y],
        [c.x + c.w, c.y],
        [c.x, c.y + c.h],
        [c.x + c.w, c.y + c.h],
      ] as [number, number][]
    ).forEach(([cx, cy]) => {
      ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
    });
  }, []);

  useEffect(() => {
    if (imgLoaded) redrawCanvas(crop);
  }, [crop, imgLoaded, redrawCanvas]);

  const handleImgLoad = useCallback(() => {
    const img = hiddenImgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const maxW = 480;
    const maxH = Math.floor(window.innerHeight * 0.5);
    const scale = Math.min(
      1,
      maxW / img.naturalWidth,
      maxH / img.naturalHeight
    );
    const cw = Math.max(1, Math.round(img.naturalWidth * scale));
    const ch = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.width = cw;
    canvas.height = ch;

    // Initial crop: center 60%
    const iw = Math.round(cw * 0.6);
    const ih = Math.round(ch * 0.6);
    const initCrop: Rect = {
      x: Math.round((cw - iw) / 2),
      y: Math.round((ch - ih) / 2),
      w: iw,
      h: ih,
    };
    setCrop(initCrop);
    cropRef.current = initCrop;
    setImgLoaded(true);
  }, []);

  // Pointer helpers
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasPos(e);
    const c = cropRef.current;
    const mode: DragMode = c ? getDragMode(x, y, c) : "draw";
    if (mode === "draw" || !c) {
      const nc: Rect = { x, y, w: 1, h: 1 };
      setCrop(nc);
      cropRef.current = nc;
      dragRef.current = { mode: "draw", startMx: x, startMy: y, startCrop: nc };
    } else {
      dragRef.current = {
        mode,
        startMx: x,
        startMy: y,
        startCrop: { ...c },
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasPos(e);
    const W = canvas.width;
    const H = canvas.height;

    if (!dragRef.current) {
      const c = cropRef.current;
      setHoverMode(c ? getDragMode(x, y, c) : "draw");
      return;
    }

    const { mode, startMx, startMy, startCrop } = dragRef.current;
    const dx = x - startMx;
    const dy = y - startMy;
    let next: Rect;

    switch (mode) {
      case "draw":
        next = {
          x: Math.min(startCrop.x, x),
          y: Math.min(startCrop.y, y),
          w: Math.abs(x - startCrop.x),
          h: Math.abs(y - startCrop.y),
        };
        break;
      case "move":
        next = { ...startCrop, x: startCrop.x + dx, y: startCrop.y + dy };
        break;
      case "nw":
        next = {
          x: startCrop.x + dx,
          y: startCrop.y + dy,
          w: startCrop.w - dx,
          h: startCrop.h - dy,
        };
        break;
      case "ne":
        next = {
          x: startCrop.x,
          y: startCrop.y + dy,
          w: startCrop.w + dx,
          h: startCrop.h - dy,
        };
        break;
      case "sw":
        next = {
          x: startCrop.x + dx,
          y: startCrop.y,
          w: startCrop.w - dx,
          h: startCrop.h + dy,
        };
        break;
      case "se":
        next = {
          x: startCrop.x,
          y: startCrop.y,
          w: startCrop.w + dx,
          h: startCrop.h + dy,
        };
        break;
      default:
        return;
    }

    const clamped = clampRect(next, W, H);
    setCrop(clamped);
    cropRef.current = clamped;
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleConfirm = async () => {
    const c = cropRef.current;
    const img = hiddenImgRef.current;
    const canvas = canvasRef.current;
    if (!c || !img || !canvas) return;
    setBusy(true);
    setError("");
    try {
      const scaleX = img.naturalWidth / canvas.width;
      const scaleY = img.naturalHeight / canvas.height;
      const sx = Math.round(c.x * scaleX);
      const sy = Math.round(c.y * scaleY);
      const sw = Math.round(c.w * scaleX);
      const sh = Math.round(c.h * scaleY);

      const maxDim = 640;
      const scale =
        sw > 0 && sh > 0 ? Math.min(1, maxDim / Math.max(sw, sh)) : 1;
      const outW = Math.max(1, Math.round(sw * scale));
      const outH = Math.max(1, Math.round(sh * scale));

      const out = document.createElement("canvas");
      out.width = outW;
      out.height = outH;
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob = await new Promise<Blob | null>(r =>
        out.toBlob(b => r(b), "image/webp", 0.85)
      );
      if (!blob) {
        setError("이미지 변환에 실패했습니다.");
        return;
      }

      const key = makeImgKey();
      await saveImageBlob(key, blob);
      onConfirm(key);
    } catch {
      setError("크롭 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const isLoading = Boolean(mainImageKey && !resolvedSrc);
  const cursor = dragRef.current
    ? modeToCursor(dragRef.current.mode)
    : modeToCursor(hoverMode);

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75" onClick={onCancel} />
      <div
        className="relative w-full max-w-[540px] bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-white/60" />
            <span className="text-sm font-semibold text-white">
              프로필 영역 선택
            </span>
          </div>
          <button
            onClick={onCancel}
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/15 transition grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="p-4">
          <p className="text-xs text-white/50 mb-3">
            드래그해서 영역을 선택하고, 모서리를 드래그해서 크기를 조절하세요
          </p>

          {isLoading ? (
            <div className="h-48 rounded-xl bg-black/40 border border-white/10 grid place-items-center text-sm text-white/40">
              이미지 로드 중...
            </div>
          ) : resolvedSrc ? (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {/* Hidden img for loading + canvas draw source */}
              <img
                ref={hiddenImgRef}
                src={resolvedSrc}
                alt=""
                className="hidden"
                onLoad={handleImgLoad}
                draggable={false}
              />
              <canvas
                ref={canvasRef}
                className="block w-full"
                style={{ cursor, touchAction: "none" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>
          ) : (
            <div className="h-48 rounded-xl bg-black/40 border border-white/10 grid place-items-center text-sm text-white/40">
              메인 이미지 없음
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onCancel}
            className="h-10 px-5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm text-white"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!crop || busy || !imgLoaded}
            className="h-10 px-5 rounded-xl bg-white text-zinc-950 hover:bg-white/90 transition text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {busy ? "처리 중..." : "이 영역으로 적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
