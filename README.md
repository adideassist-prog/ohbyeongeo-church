# 오병이어교회 홈페이지

오병이어교회의 실제 운영 소스입니다. 홈·이번 주 주보·오늘의 말씀·교회소식·관리자 화면을 하나의 서버형 앱으로 운영합니다.

## 운영 주소

- 홈페이지: https://ohbyeongeo-church.modoomoa365.chatgpt.site/
- 관리자: https://ohbyeongeo-church.modoomoa365.chatgpt.site/admin
- 기존 GitHub Pages 주소는 위 운영 주소로 자동 연결됩니다.

## 주요 기능

- 페이지 이동 중 끊기지 않는 공통 음악 플레이어
- 인트로 애니메이션
- 오늘의 말씀 날짜별 보관함과 댓글
- 주보·교회소식 관리
- 관리자 로그인과 댓글 관리
- 방문자 집계

## 구조

- GitHub: 원본 소스와 변경 이력 보관
- 서버형 운영 배포: 실제 홈페이지와 API 실행
- Supabase: 관리자 로그인과 게시물·댓글 데이터 저장

`app/layout.tsx`의 음악 플레이어는 전체 앱에서 한 번만 생성됩니다. 내부 메뉴는 Next.js의 `Link`로 이동하므로 새 HTML 문서를 열지 않고 음악을 계속 재생합니다.

## 개발

Node.js 22.13 이상이 필요합니다.

```bash
npm ci
npm run dev
npm run build
```

환경변수 이름은 `.env.example`을 참고하세요. 실제 키는 저장소에 올리지 않습니다.
