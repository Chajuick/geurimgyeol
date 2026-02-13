import { ReactNode } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type Props = {
  src?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  fallbackBg?: string; // fallback backgroundImage string
};

export default function ResolvedBg({
  src,
  className = "",
  style,
  children,
  fallbackBg = "linear-gradient(135deg, #0b0b0c 0%, #121214 40%, #0a0a0b 100%)",
}: Props) {
  const resolved = useResolvedImage(src);

  return (
    <div
      className={className}
      style={{
        backgroundImage: resolved ? `url(${resolved})` : fallbackBg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}