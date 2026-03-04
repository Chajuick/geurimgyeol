// src/pages/Battle.tsx

import React, { useState, useMemo, useCallback } from "react";
import { Swords, Copy, Key, Loader2, ChevronDown, ChevronUp } from "lucide-react";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { HUDPanel, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import StoredImage from "@/components/StoredImage";
import { cn } from "@/lib/utils";
import type { CharacterData, CreatureData } from "@/types";

/* ──────────────────────────────────────────────────────────────
 * #region Types
 * ────────────────────────────────────────────────────────────── */

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

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region Helpers
 * ────────────────────────────────────────────────────────────── */

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

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function parseRetryAfterSeconds(msg: string): number | null {
  // Groq 에러 메시지에: "Please try again in 3.01s."
  const m = msg.match(/try again in ([0-9.]+)s/i);
  if (!m?.[1]) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region Prompt Builder
 * ────────────────────────────────────────────────────────────── */

function buildPrompt(f1: BattleEntity, f2: BattleEntity, context: string): string {
  const ctx = (context || "").trim() || "일반 결투장";

  const f1Cats = f1.subCategories?.length ? f1.subCategories.join(", ") : "없음";
  const f1Tags = f1.tags?.length ? f1.tags.join(", ") : "없음";
  const f2Cats = f2.subCategories?.length ? f2.subCategories.join(", ") : "없음";
  const f2Tags = f2.tags?.length ? f2.tags.join(", ") : "없음";

  return `당신은 세계관의 전투 판정자입니다.
반드시 아래 규칙을 지키고, 오직 JSON만 출력하세요. (설명/해설/코드블록/머리말/꼬리말 금지)

[절대 규칙]
- 출력은 JSON 단 하나만. JSON 바깥의 글자 1개라도 출력하면 실패입니다.
- 모든 문장은 반드시 한국어로만 작성하세요. (한자, 영어, 일본어, 이모지, 특수문자 남발 금지)
- 고유명사(이름)는 입력 원문 그대로 유지하세요. (이름을 번역/변형/줄임말 금지)
- 서사에 "카운트다운", "설명충 독백", "메타 발언(너는/나는/AI)", "뜬금 소품 추가"를 넣지 마세요.
- 같은 문장/표현/단어를 과도하게 반복하지 마세요.
- 세계관 밖 설정을 새로 만들지 마세요. 아래 정보에 기반해서만 전투를 구성하세요.
- 전투가 끝난 뒤의 해설/교훈/기록/정리 문단을 쓰지 마세요. 마지막 문단은 오직 마지막 교전 장면으로 끝내세요.

[전투 입력 정보]
- 파이터 1: ${f1.name}
  - 카테고리: ${f1Cats}
  - 태그: ${f1Tags}
  - 요약: ${f1.summary || "없음"}
  - 상세: ${f1.description || "없음"}

- 파이터 2: ${f2.name}
  - 카테고리: ${f2Cats}
  - 태그: ${f2Tags}
  - 요약: ${f2.summary || "없음"}
  - 상세: ${f2.description || "없음"}

- 전투 배경: ${ctx}

[작성 목표]
1) 먼저 승자를 "궁합/특성/상황" 기준으로 결정합니다. (등급/서열로 결정 금지)
2) 그 승패가 납득되도록, 전투 흐름을 장면 단위로 선명하게 씁니다.

[서사 품질 규격]
- 문단 구분은 반드시 \\n\\n 으로만.
- 문단은 5문단(정확히).
- 각 문단은 최소 2문장.
- narrative는 900자 이상.
- 공방 교환(공격→대응)은 최소 3회 이상.
- 두 파이터 이름은 서사에 각각 최소 3회 이상 등장.
- 마지막 문단에서만 결판을 내고, 그 전에는 "끝났다/패배했다/승리했다" 같은 단정 문장을 쓰지 마세요.
- 결정타는 마지막 문단에 한 번만. 과장 대신 구체적인 충돌 묘사로 마무리하세요.
- 부상/피로/실수 등 "리스크"를 최소 1회 넣어 전투를 현실감 있게 만드세요.

[대사 규칙]
- winnerQuote / loserQuote는 25자 이내의 짧은 한마디.
- 따옴표(큰따옴표/작은따옴표) 넣지 마세요.
- 비속어/혐오표현/성적인 표현 금지.

[출력 JSON 스키마 - 반드시 정확히]
{
  "narrative": "전투 서사 (문단 사이는 \\n\\n)",
  "winner": "승자 이름 (원문 그대로)",
  "loser": "패자 이름 (원문 그대로)",
  "winnerQuote": "승리 한마디 (25자 이내, 따옴표 제외)",
  "loserQuote": "패배 한마디 (25자 이내, 따옴표 제외)"
}

주의: winner/loser는 반드시 위 파이터 이름 둘 중 하나여야 하며, 오탈자 없이 정확히 일치해야 합니다.`;
}

function sanitizeForRetry(raw: string) {
  // 영문/숫자/일본어/한자 제거 + 길면 컷(토큰 낭비 방지)
  const cleaned = raw
    .replace(/[A-Za-z0-9]/g, " ")
    .replace(/[ぁ-ゟ゠-ヿ一-龥]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 800);
}

function buildRetryPrompt(originalPrompt: string, raw: string, reason: string) {
  const safePrev = sanitizeForRetry(raw);

  return `${originalPrompt}

[재생성 지시]
이전 출력은 다음 규칙 위반으로 실패했습니다: ${reason}

- 반드시 영문자와 숫자를 한 글자도 쓰지 마세요.
- 반드시 일본어(히라가나/가타카나)와 한자를 한 글자도 쓰지 마세요.
- 문단은 정확히 5문단.
- 각 문단 최소 2문장.
- narrative 900자 이상.
- 반드시 오직 JSON 하나만 출력.

[이전 출력(정제본, 참고)]
${safePrev}

이제 규칙을 모두 만족하는 JSON만 출력하세요.`;
}

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region Parse / Validate
 * ────────────────────────────────────────────────────────────── */

function parseJsonResult(raw: string): BattleResult | null {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed?.narrative === "string" &&
      typeof parsed?.winner === "string" &&
      typeof parsed?.loser === "string"
    ) {
      return {
        narrative: parsed.narrative,
        winner: parsed.winner,
        loser: parsed.loser,
        winnerQuote: typeof parsed.winnerQuote === "string" ? parsed.winnerQuote : "",
        loserQuote: typeof parsed.loserQuote === "string" ? parsed.loserQuote : "",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function validateResult(
  result: BattleResult,
  f1: BattleEntity,
  f2: BattleEntity
): { ok: boolean; reason?: string } {
  const narrative = (result.narrative ?? "").trim();
  const wq = (result.winnerQuote ?? "").trim();
  const lq = (result.loserQuote ?? "").trim();

  const allText = `${narrative}\n${wq}\n${lq}`;

  // 영문/숫자 금지
  if (/[A-Za-z0-9]/.test(allText)) {
    return { ok: false, reason: "영문 또는 숫자가 포함됨" };
  }

  // 일본어/한자(대략 CJK) 금지
  if (/[ぁ-ゟ゠-ヿ一-龥]/.test(allText)) {
    return { ok: false, reason: "한국어 외 문자가 포함됨" };
  }

  // 길이
  if (narrative.length < 900) {
    return { ok: false, reason: "서사가 너무 짧습니다." };
  }

  // 문단 수: 정확히 5
  const paragraphs = narrative.split(/\n\s*\n+/).filter(Boolean);
  if (paragraphs.length !== 5) {
    return { ok: false, reason: "문단 수 규격 위반" };
  }

  // 이름 정확히 일치(둘 중 하나)
  if (result.winner !== f1.name && result.winner !== f2.name) {
    return { ok: false, reason: "승자 이름 불일치" };
  }
  if (result.loser !== f1.name && result.loser !== f2.name) {
    return { ok: false, reason: "패자 이름 불일치" };
  }
  if (result.winner === result.loser) {
    return { ok: false, reason: "승자/패자가 동일함" };
  }

  // 이름 언급 횟수(각 3회 이상)
  const f1Count = narrative.split(f1.name).length - 1;
  const f2Count = narrative.split(f2.name).length - 1;
  if (f1Count < 3 || f2Count < 3) {
    return { ok: false, reason: "서사에 이름 언급이 부족함" };
  }

  // 대사 길이(25자)
  if (wq.length > 25 || lq.length > 25) {
    return { ok: false, reason: "대사 길이 초과" };
  }

  return { ok: true };
}

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region Error Copy (위트 멘트)
 * ────────────────────────────────────────────────────────────── */

type BattleErrorMeta = {
  attempt?: number; // 1~3
  reason?: string; // validate reason
};

class BattleJudgeError extends Error {
  meta: BattleErrorMeta;
  constructor(message: string, meta: BattleErrorMeta) {
    super(message);
    this.name = "BattleJudgeError";
    this.meta = meta;
  }
}

function formatBattleError(err: unknown, meta: BattleErrorMeta = {}) {
  const attempt = meta.attempt ?? 0;
  const reason = meta.reason ?? "";

  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "알 수 없는 오류";

  // 재생성 실패(검증 실패)
  if (raw.includes("재생성 실패") || (err instanceof BattleJudgeError && raw)) {
    if (reason.includes("영문") || raw.includes("영문")) {
      return `어라, 심판이 외국어 주문을 섞어버렸네요.\n입 다물고 한국어로만 다시 판정합니다.\n\n(사유: ${reason || "영문/숫자 포함"})`;
    }
    if (reason.includes("한국어 외") || raw.includes("한국어 외")) {
      return `심판이 갑자기 다른 대륙 말투를 써버렸습니다.\n한국어만 쓰라고 다시 목줄을 채울게요.\n\n(사유: ${reason || "한국어 외 문자 포함"})`;
    }
    if (reason.includes("짧") || raw.includes("짧")) {
      return `심판이 요약본만 던지고 튀려 합니다.\n이번엔 장면으로 길게, 제대로 판정하라!\n\n(사유: ${reason || "서사 길이 부족"})`;
    }
    if (reason.includes("문단") || raw.includes("문단")) {
      return `심판이 장면 전환을 깜빡했네요.\n문단 규격 맞춰서 다시 판정 들어갑니다.\n\n(사유: ${reason || "문단 규격 위반"})`;
    }
    if (reason.includes("이름") || raw.includes("이름")) {
      return `심판이 이름표를 헷갈렸습니다.\n선수 명단 다시 확인하고 판정합니다.\n\n(사유: ${reason || "승자/패자 이름 불일치"})`;
    }
    return `심판이 규칙서를 어겼습니다.\n규칙 다시 주입하고 재판정 들어갑니다.\n\n(사유: ${reason || raw})`;
  }

  // 429: 속도/토큰 분당 제한
  if (raw.includes("API 오류 429") || raw.toLowerCase().includes("rate_limit")) {
    const sec = parseRetryAfterSeconds(raw);
    return sec
      ? `심판이 숨이 찼습니다. 토큰 호흡 조절 중…\n${sec.toFixed(2)}초만 쉬고 다시 휘슬 불게요.\n\n(사유: 호출 속도 제한)`
      : `심판이 너무 빨리 판정해서 목이 탔습니다.\n잠깐 숨 고르고 다시 갑니다.\n\n(사유: 호출 속도 제한)`;
  }

  // 400: 모델 폐기/요청 오류
  if (raw.includes("API 오류 400") || raw.toLowerCase().includes("invalid_request")) {
    if (raw.toLowerCase().includes("decommissioned") || raw.includes("model_decommissioned")) {
      return `이런, 심판이 쓰던 판정서가 단종됐습니다.\n다른 심판(모델)으로 교체가 필요해요.\n\n(사유: 모델 변경 필요)`;
    }
    return `심판이 규칙서(요청 형식)를 잘못 읽었습니다.\n요청서를 다시 정리해서 판정해볼게요.\n\n(사유: 잘못된 요청)`;
  }

  // 토큰/컨텍스트 초과류(서비스마다 문구 다름)
  if (
    raw.toLowerCase().includes("context_length") ||
    raw.toLowerCase().includes("maximum context") ||
    raw.toLowerCase().includes("max tokens") ||
    (raw.includes("Requested") && raw.toLowerCase().includes("tokens"))
  ) {
    return `심판의 두루마리가 꽉 찼습니다.\n판정문이 너무 길어요. 규칙을 조금 다이어트해볼까요?\n\n(사유: 토큰/컨텍스트 한도)`;
  }

  // 파싱/형식
  if (raw.includes("파싱") || raw.toLowerCase().includes("json")) {
    return `심판이 판정문을 낙서로 줬네요.\n형식(제이슨) 맞춰서 다시 받겠습니다.\n\n(사유: 응답 형식 오류)`;
  }

  // 네트워크
  if (raw.toLowerCase().includes("failed to fetch") || raw.includes("NetworkError")) {
    return `심판석이 잠깐 끊겼습니다.\n연결 복구하고 다시 판정 들어갈게요.\n\n(사유: 네트워크 오류)`;
  }

  const badge = attempt ? ` (시도 ${attempt}차)` : "";
  return `어라, 심판이 잠깐 혀가 꼬인 것 같네요${badge}.\n다시 한 번 시작해볼까요?\n\n(사유: ${raw})`;
}

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region UI Components
 * ────────────────────────────────────────────────────────────── */

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
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return entities;
    return entities.filter(e => e.name.toLowerCase().includes(q));
  }, [entities, search]);

  const handleCopy = useCallback(() => {
    if (!selected) return;
    navigator.clipboard.writeText(toJson(selected)).catch(() => {});
  }, [selected]);

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="text-[11px] tracking-[0.26em] text-white/55">{label}</div>

      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="이름 검색..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
      />

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
                e.id === selected?.id ? "bg-white/15 text-white" : "text-white/70"
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
                <div className="text-base font-bold text-white truncate">{selected.name}</div>
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
            <div className="text-xs text-white/60 line-clamp-2">{selected.summary}</div>
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
        isWinner ? "border-amber-400/30 bg-amber-400/5" : "border-white/10 bg-white/[0.03] opacity-70"
      )}
    >
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

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div
          className={cn(
            "text-[10px] font-bold tracking-[0.22em]",
            isWinner ? "text-amber-400" : "text-white/30"
          )}
        >
          {isWinner ? "WINNER" : "LOSER"}
        </div>

        <div className="text-base font-bold text-white leading-tight">{entity.name}</div>

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

        {/* ✅ 프롬프트 규칙(따옴표 금지)에 맞춰 UI에서도 따옴표 제거 */}
        {quote && (
          <div
            className={cn(
              "text-sm italic leading-snug mt-0.5",
              isWinner ? "text-white/75" : "text-white/40"
            )}
          >
            {quote}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="flex flex-col gap-2">
        {winnerEntity && (
          <FighterResultCard entity={winnerEntity} role="winner" quote={result.winnerQuote || null} />
        )}
        {loserEntity && (
          <FighterResultCard entity={loserEntity} role="loser" quote={result.loserQuote || null} />
        )}
      </div>

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

function ApiKeyPanel({ apiKey, onSave }: { apiKey: string; onSave: (key: string) => void }) {
  const [draft, setDraft] = useState(apiKey);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 flex flex-col gap-3">
      <div className="text-xs text-white/50">
        console.groq.com에서 발급한 Groq API 키를 입력하세요 (무료). 키는 브라우저 localStorage에만 저장됩니다.
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="gsk_..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <GButton variant="primary" text="저장" onClick={() => onSave(draft.trim())} />
      </div>
    </div>
  );
}

/* #endregion */

/* ──────────────────────────────────────────────────────────────
 * #region Main
 * ────────────────────────────────────────────────────────────── */

export default function Battle() {
  const { data } = usePortfolioContext();

  const allEntities: BattleEntity[] = useMemo(() => {
    const chars: BattleEntity[] = (data.characters ?? []).map((c: CharacterData) => ({
      id: c.id,
      kind: "character" as EntityKind,
      name: c.name,
      profileImage: c.profileImage ?? "",
      subCategories: c.subCategories ?? [],
      tags: c.tags ?? [],
      summary: c.summary ?? "",
      description: c.description ?? "",
    }));

    const cres: BattleEntity[] = (data.creatures ?? []).map((c: CreatureData) => ({
      id: c.id,
      kind: "creature" as EntityKind,
      name: c.name,
      profileImage: c.profileImage ?? "",
      subCategories: c.subCategories ?? [],
      tags: c.tags ?? [],
      summary: c.summary ?? "",
      description: c.description ?? "",
    }));

    return [...chars, ...cres];
  }, [data.characters, data.creatures]);

  const [fighter1, setFighter1] = useState<BattleEntity | null>(null);
  const [fighter2, setFighter2] = useState<BattleEntity | null>(null);
  const [context, setContext] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gyeol:battle:api-key") ?? "");
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

    if (name === fighter1.name || fighter1.name.includes(name) || name.includes(fighter1.name)) return fighter1;
    if (name === fighter2.name || fighter2.name.includes(name) || name.includes(fighter2.name)) return fighter2;

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
    } catch {
      // ignore
    }
    setShowApiInput(false);
  }, []);

  const handleBattle = useCallback(async () => {
    // null 가드 + TS 확정
    if (!fighter1 || !fighter2 || !apiKey) return;
    const f1: BattleEntity = fighter1;
    const f2: BattleEntity = fighter2;
    const key: string = apiKey;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const basePrompt = buildPrompt(f1, f2, context);

    async function callLLM(prompt: string) {
      const doFetch = async () => {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            // 응답이 짧아지는 걸 막되, TPM/429도 줄이기 위해 과도하게 크게 잡진 않음
            max_completion_tokens: 1400,
            temperature: 0.9,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`API 오류 ${res.status}: ${errBody}`);
        }

        const json = await res.json();
        return json?.choices?.[0]?.message?.content ?? "";
      };

      // ✅ 429면 Retry-After(메시지 기반)를 보고 1회 자동 재시도
      try {
        return await doFetch();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("API 오류 429") || msg.toLowerCase().includes("rate_limit")) {
          const sec = parseRetryAfterSeconds(msg) ?? 2.5;
          await sleep(Math.ceil(sec * 1000) + 150);
          return await doFetch();
        }
        throw e;
      }
    }

    async function runOnce(prompt: string, attempt: number) {
      const raw = await callLLM(prompt);
      const parsed = parseJsonResult(raw);

      if (!parsed) {
        return { ok: false as const, raw, reason: "응답 JSON 파싱 실패", attempt };
      }

      const check = validateResult(parsed, f1, f2);
      if (!check.ok) {
        return { ok: false as const, raw, reason: check.reason ?? "규칙 위반", attempt };
      }

      return { ok: true as const, raw, parsed, attempt };
    }

    try {
      // 1차
      const r1 = await runOnce(basePrompt, 1);
      if (r1.ok) {
        setResult(r1.parsed);
        return;
      }

      // 2차
      const prompt2 = buildRetryPrompt(basePrompt, r1.raw, r1.reason);
      const r2 = await runOnce(prompt2, 2);
      if (r2.ok) {
        setResult(r2.parsed);
        return;
      }

      // 3차(더 강하게)
      const prompt3 = `${buildRetryPrompt(basePrompt, r2.raw, r2.reason)}

[추가 강제]
- 문단은 정확히 다섯 문단.
- 각 문단 최소 두 문장.
- 서사는 구백 자 이상.
- 두 파이터 이름은 각각 세 번 이상.`;

      const r3 = await runOnce(prompt3, 3);
      if (r3.ok) {
        setResult(r3.parsed);
        return;
      }

      throw new BattleJudgeError("재생성 실패", { attempt: 3, reason: r3.reason });
    } catch (e) {
      const meta = e instanceof BattleJudgeError ? e.meta : undefined;
      setError(formatBattleError(e, meta));
    } finally {
      setIsLoading(false);
    }
  }, [fighter1, fighter2, apiKey, context]);

  return (
    <div className={cn("min-h-[100svh] w-full max-w-full overflow-x-hidden", "gyeol-bg text-white relative")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.65))]" />

      <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 flex flex-col gap-6">
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

        {showApiInput && <ApiKeyPanel apiKey={apiKey} onSave={handleSaveApiKey} />}

        <HUDPanel className="p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[11px] tracking-[0.26em] text-white/55">ARENA</div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">배틀 아레나</div>
              <div className="mt-1 text-sm text-white/60">걱정마세요. 심판은 아주 공정하답니다.</div>
            </div>
          </div>
        </HUDPanel>

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

        <HUDPanel className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] tracking-[0.26em] text-white/55 mb-2">BATTLE CONTEXT</div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="전투 배경을 입력하세요 (선택). 예: 황폐한 사막 한가운데서의 결투"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 resize-none"
              />
            </div>

            {!apiKey && <div className="text-xs text-amber-400/80">⚠️ API 키를 먼저 설정해주세요.</div>}

            <GButton
              variant="primary"
              icon={isLoading ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} />}
              text={isLoading ? "판정 중..." : "전투 시작"}
              onClick={handleBattle}
              disabled={!canFight}
            />
          </div>
        </HUDPanel>

        {error && (
          <HUDPanel className="p-5">
            <div className="text-sm text-red-400 whitespace-pre-wrap">{error}</div>
          </HUDPanel>
        )}

        {result && (
          <HUDPanel className="p-6">
            <div className="text-[11px] tracking-[0.26em] text-white/55 mb-3">RESULT</div>
            <ResultPanel result={result} winnerEntity={winnerEntity} loserEntity={loserEntity} />
          </HUDPanel>
        )}
      </div>
    </div>
  );
}

/* #endregion */