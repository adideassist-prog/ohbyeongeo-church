# 오병이어교회 홈페이지

오병이어교회의 실제 운영 소스입니다. GitHub Pages에서도 홈·이번 주 주보·오늘의 말씀·교회소식·관리자 화면을 하나의 앱으로 운영합니다.

## 운영 주소

- 홈페이지: https://adideassist-prog.github.io/ohbyeongeo-church/
- 관리자: https://adideassist-prog.github.io/ohbyeongeo-church/admin/

## 주요 기능

- 페이지 이동 중 끊기지 않는 공통 음악 플레이어
- 인트로 애니메이션
- 오늘의 말씀 날짜별 보관함과 댓글
- 주보·교회소식 관리
- 관리자 로그인과 댓글 관리
- 방문자 집계

## 구조

- GitHub: 원본 소스, 변경 이력, GitHub Pages 운영
- GitHub Pages: 한 페이지 앱으로 화면을 전환해 음악 플레이어 유지
- Supabase: 관리자 로그인과 게시물·댓글 데이터 저장

GitHub Pages에서는 `app/GitHubApp.tsx`가 주소와 화면만 바꾸고, `app/layout.tsx`의 음악 플레이어는 전체 앱에서 한 번만 생성됩니다. 따라서 내부 메뉴를 이동해도 음악이 끊기지 않습니다.

## 개발

Node.js 22.13 이상이 필요합니다.

```bash
npm ci
npm run dev
npm run build
```

환경변수 이름은 `.env.example`을 참고하세요. 실제 키는 저장소에 올리지 않습니다.
