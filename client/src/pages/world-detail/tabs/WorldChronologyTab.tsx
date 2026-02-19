import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { uiInput } from "@/components/ui/form/presets";

function makeId() {
  return Date.now().toString();
}

export default function WorldChronologyTab({ world, editMode, updateWorld }: any) {
  const chronology = world.chronology ?? {
    eras: [],
    yearSuffixes: [],
    displayFormat: "prefix-first",
  };

  const [openEra, setOpenEra] = useState(false);
  const [openSuffix, setOpenSuffix] = useState(false);

  const [eraDraft, setEraDraft] = useState<any>({
    id: "",
    name: "",
    short: "",
    mode: "signed-year",
    order: 0,
  });

  const [sufDraft, setSufDraft] = useState<any>({
    id: "",
    label: "",
    order: 0,
  });

  const eras = chronology.eras ?? [];
  const suffixes = chronology.yearSuffixes ?? [];

  const ensureChronology = () => {
    if (world.chronology) return;
    updateWorld({ chronology });
  };

  const addEra = () => {
    ensureChronology();
    const next = {
      ...eraDraft,
      id: eraDraft.id || makeId(),
      order: Number(eraDraft.order || 0),
      meta: { updatedAt: new Date().toISOString() },
    };
    updateWorld({
      chronology: {
        ...chronology,
        eras: [...eras, next].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
      },
    });
    setOpenEra(false);
    setEraDraft({ id: "", name: "", short: "", mode: "signed-year", order: 0 });
  };

  const removeEra = (id: string) => {
    updateWorld({
      chronology: {
        ...chronology,
        eras: eras.filter((e: any) => e.id !== id),
        defaultEraId: chronology.defaultEraId === id ? undefined : chronology.defaultEraId,
      },
    });
  };

  const addSuffix = () => {
    ensureChronology();
    const next = {
      ...sufDraft,
      id: sufDraft.id || makeId(),
      order: Number(sufDraft.order || 0),
      meta: { updatedAt: new Date().toISOString() },
    };
    updateWorld({
      chronology: {
        ...chronology,
        yearSuffixes: [...suffixes, next].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
      },
    });
    setOpenSuffix(false);
    setSufDraft({ id: "", label: "", order: 0 });
  };

  const removeSuffix = (id: string) => {
    updateWorld({
      chronology: {
        ...chronology,
        yearSuffixes: suffixes.filter((s: any) => s.id !== id),
        defaultSuffixId: chronology.defaultSuffixId === id ? undefined : chronology.defaultSuffixId,
      },
    });
  };

  const setDefaults = (patch: any) => {
    updateWorld({ chronology: { ...chronology, ...patch } });
  };

  return (
    <HUDPanel className="p-6">
      <HUDSectionTitle
        right={
          <div className="flex items-center gap-2">
            <HUDBadge>SETTINGS</HUDBadge>
            {editMode && (
              <>
                <GButton
                  variant="neutral"
                  icon={<Plus className="w-4 h-4" />}
                  text="ERA 추가"
                  onClick={() => setOpenEra(true)}
                />
                <GButton
                  variant="neutral"
                  icon={<Plus className="w-4 h-4" />}
                  text="SUFFIX 추가"
                  onClick={() => setOpenSuffix(true)}
                />
              </>
            )}
          </div>
        }
      >
        CHRONOLOGY CONFIG
      </HUDSectionTitle>

      {/* defaults */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-white/60 mb-2">Default ERA</div>
          <select
            className={uiInput}
            value={chronology.defaultEraId ?? ""}
            onChange={(e) => setDefaults({ defaultEraId: e.target.value || undefined })}
            disabled={!editMode}
          >
            <option value="">(없음)</option>
            {eras.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.id})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-white/60 mb-2">Default Suffix</div>
          <select
            className={uiInput}
            value={chronology.defaultSuffixId ?? ""}
            onChange={(e) => setDefaults({ defaultSuffixId: e.target.value || undefined })}
            disabled={!editMode}
          >
            <option value="">(없음)</option>
            {suffixes.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.id})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-white/60 mb-2">Display Format</div>
          <select
            className={uiInput}
            value={chronology.displayFormat ?? "prefix-first"}
            onChange={(e) => setDefaults({ displayFormat: e.target.value })}
            disabled={!editMode}
          >
            <option value="prefix-first">prefix-first</option>
            <option value="year-first">year-first</option>
          </select>
        </div>
      </div>

      {/* lists */}
      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.26em] text-white/55">ERAS</div>
            <HUDBadge>{`TOTAL ${eras.length}`}</HUDBadge>
          </div>

          <div className="mt-3 grid gap-2">
            {eras.length === 0 ? (
              <div className="text-sm text-white/55">ERA가 없습니다.</div>
            ) : (
              eras.map((e: any) => (
                <div key={e.id} className="rounded-xl border border-white/10 bg-black/10 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 truncate">
                      {e.name} <span className="text-white/45 text-xs">({e.id})</span>
                    </div>
                    <div className="text-xs text-white/45">
                      mode: {e.mode} / order: {e.order ?? 0}
                    </div>
                  </div>

                  {editMode && (
                    <GButton
                      variant="danger"
                      size="icon"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeEra(e.id)}
                      title="삭제"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.26em] text-white/55">YEAR SUFFIX</div>
            <HUDBadge>{`TOTAL ${suffixes.length}`}</HUDBadge>
          </div>

          <div className="mt-3 grid gap-2">
            {suffixes.length === 0 ? (
              <div className="text-sm text-white/55">Suffix가 없습니다.</div>
            ) : (
              suffixes.map((s: any) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-black/10 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/80 truncate">
                      {s.label} <span className="text-white/45 text-xs">({s.id})</span>
                    </div>
                    <div className="text-xs text-white/45">
                      order: {s.order ?? 0}
                    </div>
                  </div>

                  {editMode && (
                    <GButton
                      variant="danger"
                      size="icon"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeSuffix(s.id)}
                      title="삭제"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ERA MODAL */}
      <Modal
        open={openEra && editMode}
        onClose={() => setOpenEra(false)}
        title="ERA 추가"
        maxWidthClassName="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="neutral" text="취소" onClick={() => setOpenEra(false)} />
            <GButton variant="primary" text="추가" onClick={addEra} />
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs text-white/60 mb-2">id (비우면 자동)</div>
            <input className={uiInput} value={eraDraft.id} onChange={(e) => setEraDraft({ ...eraDraft, id: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">name</div>
            <input className={uiInput} value={eraDraft.name} onChange={(e) => setEraDraft({ ...eraDraft, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-white/60 mb-2">short</div>
              <input className={uiInput} value={eraDraft.short} onChange={(e) => setEraDraft({ ...eraDraft, short: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-2">order</div>
              <input type="number" className={uiInput} value={eraDraft.order} onChange={(e) => setEraDraft({ ...eraDraft, order: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">mode</div>
            <select className={uiInput} value={eraDraft.mode} onChange={(e) => setEraDraft({ ...eraDraft, mode: e.target.value })}>
              <option value="signed-year">signed-year</option>
              <option value="named-era">named-era</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* SUFFIX MODAL */}
      <Modal
        open={openSuffix && editMode}
        onClose={() => setOpenSuffix(false)}
        title="Suffix 추가"
        maxWidthClassName="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="neutral" text="취소" onClick={() => setOpenSuffix(false)} />
            <GButton variant="primary" text="추가" onClick={addSuffix} />
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs text-white/60 mb-2">id (비우면 자동)</div>
            <input className={uiInput} value={sufDraft.id} onChange={(e) => setSufDraft({ ...sufDraft, id: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">label</div>
            <input className={uiInput} value={sufDraft.label} onChange={(e) => setSufDraft({ ...sufDraft, label: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">order</div>
            <input type="number" className={uiInput} value={sufDraft.order} onChange={(e) => setSufDraft({ ...sufDraft, order: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>
    </HUDPanel>
  );
}