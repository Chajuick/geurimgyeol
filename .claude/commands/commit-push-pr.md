# commit-push-pr

변경사항을 커밋하고 푸시한 뒤 PR을 생성합니다.

## 실행 순서

1. `git status` - 변경된 파일 확인
2. `git diff` - 변경 내용 검토
3. `pnpm check` - 타입체크 통과 확인
4. `git add` - 관련 파일 스테이징 (민감 파일 제외)
5. `git commit -m "..."` - 변경 목적 중심의 커밋 메시지 작성
6. `git push` - 원격 브랜치에 푸시
7. `gh pr create` - PR 생성 (제목 70자 이내)

## 규칙

- `.env` 파일 절대 커밋 금지
- `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` 포함
- force push 금지
- PR 본문에 변경 요약 및 테스트 체크리스트 포함
