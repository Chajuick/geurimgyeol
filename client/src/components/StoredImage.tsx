import { ImgHTMLAttributes } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string;
  fallback?: React.ReactNode;
};

export default function StoredImage({ src, fallback = null, ...rest }: Props) {
  const resolved = useResolvedImage(src);

  if (!resolved) return <>{fallback}</>;
  return <img src={resolved} {...rest} />;
}