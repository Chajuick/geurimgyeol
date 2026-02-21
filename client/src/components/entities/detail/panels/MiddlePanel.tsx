import React from "react";
import type { EntityBase } from "@/types";
import ProfileCard from "@/components/ui/profile-card";

export default function MiddlePanel<T extends EntityBase>(props: {
  entity: T;
  profileUrl: string;
  onClickProfile: () => void;
}) {
  const { entity, profileUrl, onClickProfile } = props;

  return (
    <div className="w-[120px] lg:w-[140px]">
      <button
        type="button"
        onClick={onClickProfile}
        className="text-left w-full"
        title="클릭: 메인/서브 토글"
      >
        <ProfileCard name={entity.name} imageUrl={profileUrl} />
      </button>
    </div>
  );
}