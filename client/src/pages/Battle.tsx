import React, { useState, useMemo, useCallback } from "react";
import {
  Swords,
  Copy,
  Key,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { HUDPanel, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import StoredImage from "@/components/StoredImage";
import { cn } from "@/lib/utils";
import type { CharacterData, CreatureData } from "@/types";

/* ─── 타입 ─── */
type EntityKind = "character" | "creature";

type BattleEntity = {
  id: string;
  kind: EntityKind;
  name: string;
  profileImage: string;
  subCategories: string[];
  tags: string[];
  summary: string;
  description: string;
};

type BattleResult = {
  narrative: string;
  winner: string;
  loser: string;
  winnerQuote: string;
  loserQuote: string;
};

/* ─── 헬퍼 ─── */
function toJson(entity: BattleEntity): string {
  return JSON.stringify(
    {
      type: entity.kind,
      name: entity.name,
      subCategories: entity.subCategories,
      tags: entity.tags,
      summary: entity.summary,
      description: entity.description,
    },
    null,
    2
  );
}

function buildPrompt(
  f1: BattleEntity,
  f2: BattleEntity,
  context: string
): string {
  return `당신은 판타지 세계의 전투 판정자입니다. 반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 출력하지 마세요.

[규칙]
- 모든 텍스트는 반드시 한국어로만 작성하세요. 한자, 영어, 일본어 등 다른 언어는 절대 사용하지 마세요.
- 고유명사(이름)는 원문 그대로 유지하되, 설명 텍스트는 전부 한국어로 작성하세요.

[파이터 1: ${f1.name}]
카테고리: ${f1.subCategories.join(", ") || "없음"}
태그: ${f1.tags.join(", ") || "없음"}
요약: ${f1.summary || "없음"}
상세: ${f1.description || "없음"}

[파이터 2: ${f2.name}]
카테고리: ${f2.subCategories.join(", ") || "없음"}
태그: ${f2.tags.join(", ") || "없음"}
요약: ${f2.summary || "없음"}
상세: ${f2.description || "없음"}

[전투 배경]
${context.trim() || "일반 결투장"}

위 두 존재가 1:1 전투를 벌입니다. 아래 지침에 따라 서사를 작성하고 승자를 결정하세요.

[서사 작성 지침]
- 전투는 실제 격돌처럼 공격, 방어, 반격의 흐름으로 구성하세요.
- 서로의 능력과 특성이 충돌하는 구체적인 장면을 묘사하세요.
- 전세가 뒤집히거나 결정적 한 방이 터지는 순간을 생동감 있게 써주세요.
- 문단은 장면이 바뀔 때마다 \\n\\n으로 구분하세요. (최소 3문단 이상)
- 승패는 등급이 아닌 두 존재의 특성과 궁합에 따라 결정하세요.

아래 JSON 스키마를 정확히 지켜 응답하세요:
{
  "narrative": "전투 서사 (문단 사이는 \\n\\n으로 구분)",
  "winner": "승자 이름 (원문 그대로)",
  "loser": "패자 이름 (원문 그대로)",
  "winnerQuote": "승자의 성격에 맞는 짧고 강렬한 승리 한마디 (따옴표 제외, 한국어)",
  "loserQuote": "패자의 성격에 맞는 짧은 패배 한마디 (따옴표 제외, 한국어)"
}`;
}

function parseJsonResult(raw: string): BattleResult | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.narrative === "string" &&
      typeof parsed.winner === "string" &&
      typeof parsed.loser === "string"
    ) {
      return {
        narrative: parsed.narrative,
        winner: parsed.winner,
        loser: parsed.loser,
        winnerQuote:
          typeof parsed.winnerQuote === "string" ? parsed.winnerQuote : "",
        loserQuote:
          typeof parsed.loserQuote === "string" ? parsed.loserQuote : "",
      };
    }
  } catch {}
  return null;
}

/* ─── FighterPanel ─── */
function FighterPanel({
  label,
  entities,
  selected,
  search,
  onSearch,
  onSelect,
}: {
  label: string;
  entities: BattleEntity[];
  selected: BattleEntity | null;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (e: BattleEntity | null) => void;
}) {
  const filtered = useMemo(
    () =>
      entities.filter(e => e.name.toLowerCase().includes(search.toLowerCase())),
    [entities, search]
  );

  const handleCopy = useCallback(() => {
    if (!selected) return;
    navigator.clipboard.writeText(toJson(selected)).catch(() => {});
  }, [selected]);

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="text-[11px] tracking-[0.26em] text-white/55">{label}</div>

      {/* 검색 */}
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="이름 검색..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
      />

      {/* 목록 */}
      <div className="rounded-xl border border-white/10 bg-black/20 overflow-y-auto max-h-52">
        {filtered.length === 0 ? (
          <div className="p-4 text-sm text-white/40 text-center">없음</div>
        ) : (
          filtered.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e.id === selected?.id ? null : e)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-white/10",
                e.id === selected?.id
                  ? "bg-white/15 text-white"
                  : "text-white/70"
              )}
            >
              <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-white/10 border border-white/10">
                <StoredImage
                  src={e.profileImage}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-white/30">
                      {e.kind === "character" ? "캐" : "크"}
                    </div>
                  }
                />
              </div>
              <span className="flex-1 truncate">{e.name}</span>
            </button>
          ))
        )}
      </div>

      {/* 선택된 카드 */}
      {selected ? (
        <div className="rounded-xl border border-white/20 bg-white/5 p-4 flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/10">
              <StoredImage
                src={selected.profileImage}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                    {selected.kind === "character" ? "캐" : "크"}
                  </div>
                }
              />
            </div>
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-base font-bold text-white truncate">
                  {selected.name}
                </div>
                {selected.subCategories.length > 0 && (
                  <div className="text-xs text-white/50 mt-0.5 truncate">
                    {selected.subCategories.join(", ")}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/20 transition-colors"
                title="JSON 복사"
              >
                <Copy size={12} />
                JSON
              </button>
            </div>
          </div>
          {selected.summary && (
            <div className="text-xs text-white/60 line-clamp-2">
              {selected.summary}
            </div>
          )}
          {selected.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-white/30">
          파이터를 선택하세요
        </div>
      )}
    </div>
  );
}

/* ─── FighterResultCard ─── */
function FighterResultCard({
  entity,
  role,
  quote,
}: {
  entity: BattleEntity;
  role: "winner" | "loser";
  quote: string | null;
}) {
  const isWinner = role === "winner";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex gap-4 items-start",
        isWinner
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-white/10 bg-white/[0.03] opacity-70"
      )}
    >
      {/* 프로필 이미지 */}
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10">
        <StoredImage
          src={entity.profileImage}
          className="w-full h-full object-cover"
          fallback={
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
              {entity.kind === "character" ? "캐" : "크"}
            </div>
          }
        />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div
          className={cn(
            "text-[10px] font-bold tracking-[0.22em]",
            isWinner ? "text-amber-400" : "text-white/30"
          )}
        >
          {isWinner ? "WINNER" : "LOSER"}
        </div>

        <div className="text-base font-bold text-white leading-tight">
          {entity.name}
        </div>

        {entity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entity.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/45"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {quote && (
          <div
            className={cn(
              "text-sm italic leading-snug mt-0.5",
              isWinner ? "text-white/75" : "text-white/40"
            )}
          >
            "{quote}"
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ResultPanel ─── */
function ResultPanel({
  result,
  winnerEntity,
  loserEntity,
}: {
  result: BattleResult;
  winnerEntity: BattleEntity | null;
  loserEntity: BattleEntity | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* 승자 / 패자 카드 */}
      <div className="flex flex-col gap-2">
        {winnerEntity && (
          <FighterResultCard
            entity={winnerEntity}
            role="winner"
            quote={result.winnerQuote || null}
          />
        )}
        {loserEntity && (
          <FighterResultCard
            entity={loserEntity}
            role="loser"
            quote={result.loserQuote || null}
          />
        )}
      </div>

      {/* 전투 서사 */}
      <div className="flex flex-col gap-3">
        {result.narrative.split(/\n\n+/).map((para, i) => (
          <p key={i} className="text-sm text-white/75 leading-relaxed">
            {para.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── ApiKeyPanel ─── */
function ApiKeyPanel({
  apiKey,
  onSave,
}: {
  apiKey: string;
  onSave: (key: string) => void;
}) {
  const [draft, setDraft] = useState(apiKey);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 flex flex-col gap-3">
      <div className="text-xs text-white/50">
        console.groq.com에서 발급한 Groq API 키를 입력하세요 (무료). 키는
        브라우저 localStorage에만 저장됩니다.
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="gsk_..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <GButton
          variant="primary"
          text="저장"
          onClick={() => onSave(draft.trim())}
        />
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Battle() {
  const { data } = usePortfolioContext();

  /* 모든 엔티티 합치기 */
  const allEntities: BattleEntity[] = useMemo(() => {
    const chars: BattleEntity[] = (data.characters ?? []).map(
      (c: CharacterData) => ({
        id: c.id,
        kind: "character" as EntityKind,
        name: c.name,
        profileImage: c.profileImage ?? "",
        subCategories: c.subCategories ?? [],
        tags: c.tags ?? [],
        summary: c.summary ?? "",
        description: c.description ?? "",
      })
    );

    const cres: BattleEntity[] = (data.creatures ?? []).map(
      (c: CreatureData) => ({
        id: c.id,
        kind: "creature" as EntityKind,
        name: c.name,
        profileImage: c.profileImage ?? "",
        subCategories: c.subCategories ?? [],
        tags: c.tags ?? [],
        summary: c.summary ?? "",
        description: c.description ?? "",
      })
    );

    return [...chars, ...cres];
  }, [data.characters, data.creatures]);

  /* 상태 */
  const [fighter1, setFighter1] = useState<BattleEntity | null>(null);
  const [fighter2, setFighter2] = useState<BattleEntity | null>(null);
  const [context, setContext] = useState("");
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("gyeol:battle:api-key") ?? ""
  );
  const [result, setResult] = useState<BattleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiInput, setShowApiInput] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");

  const canFight = !!fighter1 && !!fighter2 && !!apiKey && !isLoading;

  const winnerEntity = useMemo<BattleEntity | null>(() => {
    if (!result || !fighter1 || !fighter2) return null;
    const name = result.winner;
    if (
      name === fighter1.name ||
      fighter1.name.includes(name) ||
      name.includes(fighter1.name)
    )
      return fighter1;
    if (
      name === fighter2.name ||
      fighter2.name.includes(name) ||
      name.includes(fighter2.name)
    )
      return fighter2;
    return null;
  }, [result, fighter1, fighter2]);

  const loserEntity = useMemo<BattleEntity | null>(() => {
    if (!winnerEntity || !fighter1 || !fighter2) return null;
    return winnerEntity.id === fighter1.id ? fighter2 : fighter1;
  }, [winnerEntity, fighter1, fighter2]);

  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem("gyeol:battle:api-key", key);
    } catch {}
    setShowApiInput(false);
  }, []);

  const handleBattle = useCallback(async () => {
    if (!fighter1 || !fighter2 || !apiKey) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const prompt = buildPrompt(fighter1, fighter2, context);

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 1024,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API 오류 ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const raw: string = json?.choices?.[0]?.message?.content ?? "";
      const parsed = parseJsonResult(raw);
      if (!parsed)
        throw new Error("응답을 파싱할 수 없습니다. 다시 시도해주세요.");
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [fighter1, fighter2, apiKey, context]);

  return (
    <div
      className={cn(
        "min-h-[100svh] w-full max-w-full overflow-x-hidden",
        "gyeol-bg text-white relative"
      )}
    >
      {/* 배경 그라디언트 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.65))]" />

      <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 flex flex-col gap-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <HUDBadge>BATTLE</HUDBadge>
          </div>

          <button
            type="button"
            onClick={() => setShowApiInput(v => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-colors"
          >
            <Key size={13} />
            API 키 설정
            {showApiInput ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* API 키 패널 */}
        {showApiInput && (
          <ApiKeyPanel apiKey={apiKey} onSave={handleSaveApiKey} />
        )}

        {/* HEADER */}
        <HUDPanel className="p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[11px] tracking-[0.26em] text-white/55">
                ARENA
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
                배틀 아레나
              </div>
              <div className="mt-1 text-sm text-white/60">
                걱정마세요. 심판은 아주 공정하답니다.
              </div>
            </div>
          </div>
        </HUDPanel>

        {/* 파이터 선택 영역 */}
        <HUDPanel className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FighterPanel
              label="FIGHTER 1"
              entities={allEntities}
              selected={fighter1}
              search={search1}
              onSearch={setSearch1}
              onSelect={setFighter1}
            />
            <FighterPanel
              label="FIGHTER 2"
              entities={allEntities}
              selected={fighter2}
              search={search2}
              onSearch={setSearch2}
              onSelect={setFighter2}
            />
          </div>
        </HUDPanel>

        {/* 전투 배경 + 시작 버튼 */}
        <HUDPanel className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] tracking-[0.26em] text-white/55 mb-2">
                BATTLE CONTEXT
              </div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="전투 배경을 입력하세요 (선택). 예: 황폐한 사막 한가운데서의 결투"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />
            </div>

            {!apiKey && (
              <div className="text-xs text-amber-400/80">
                ⚠️ API 키를 먼저 설정해주세요.
              </div>
            )}

            <GButton
              variant="primary"
              icon={
                isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Swords size={16} />
                )
              }
              text={isLoading ? "판정 중..." : "전투 시작"}
              onClick={handleBattle}
              disabled={!canFight}
            />
          </div>
        </HUDPanel>

        {/* 결과 패널 */}
        {error && (
          <HUDPanel className="p-5">
            <div className="text-sm text-red-400 whitespace-pre-wrap">
              {error}
            </div>
          </HUDPanel>
        )}

        {result && (
          <HUDPanel className="p-6">
            <div className="text-[11px] tracking-[0.26em] text-white/55 mb-3">
              RESULT
            </div>
            <ResultPanel
              result={result}
              winnerEntity={winnerEntity}
              loserEntity={loserEntity}
            />
          </HUDPanel>
        )}
      </div>
    </div>
  );
}
