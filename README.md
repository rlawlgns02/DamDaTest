# DamDa Design Lab

각진 형태, 절제된 색상, 선명한 정보 구조로 다시 디자인한 디지털 명함 목업입니다.

- 공개 주소: https://rlawlgns02.github.io/DamDaTest/
- 체험 로그인: **admin / 1234**
- 기존 DamDa 운영 프로젝트와 별개의 저장소입니다.

## 체험할 수 있는 화면

로그인, 내 명함, 프로필 편집, 공개 항목 선택, 이름·닉네임 전환, 사용자 항목 추가·삭제, 공개 정보 프리셋 저장·변경·삭제, 디자인 갤러리, 사진 업로드·모양·크기, 앞뒷면 디자인, 마우스·터치·키보드 3D 회전, 샘플 명함함 검색·분류·삭제, 라이트·다크·시스템 모드, 한국어·영어, 모션 설정을 지원합니다.

PNG 앞뒷면과 VCF는 브라우저에서 생성합니다. QR과 복사 주소는 목업 홈페이지로만 연결되며, 개인 명함 데이터가 들어가지 않습니다. PNG는 디자인 확인용 이미지이며 웹 명함과 내보내기의 글꼴·행간은 다를 수 있습니다.

## 서버와 분리

Supabase SDK, API 키, 데이터베이스, 이메일 발송, 실제 회원가입은 포함하지 않습니다. 로그인은 목업 진입용이며 보안 인증이 아닙니다. 편집 내용은 `damda-design-lab-v1` 브라우저 저장소에만 보관합니다. CSP의 `connect-src 'none'`으로 네트워크 API 호출을 차단합니다. 폰트와 QR 라이브러리도 같은 사이트에서 제공합니다.

## 로컬 실행

Node.js 22 이상에서:

```sh
npm start
```

http://127.0.0.1:4174/DamDaTest/ 에서 확인합니다. 파일을 수정한 뒤 새로고침하세요. Live Server의 인라인 자동 새로고침 스크립트는 CSP에 차단될 수 있으므로 제공하는 실행 명령을 사용하세요.

```sh
npm run check
# 브라우저 검증 (개발 의존성 필요)
npm install
npm run test:browser
```

## 구성

- `site/index.html`: 정적 페이지 진입점
- `site/app.js`: 목업 상태, 로컬 기능, 화면 렌더링
- `site/design.css`: 반응형 디자인 및 테마
- `preview.cjs`: 루프백 주소 전용 정적 미리보기 서버
- `.github/workflows/pages.yml`: GitHub Pages 자동 배포

버튼·입력창·명함·모달은 사각형을 사용합니다. 데스크톱은 편집 패널과 큰 명함을 나란히, 태블릿은 공간에 따라 열을 조정하고, 모바일은 미리보기를 먼저 배치합니다.

## 외부 자산

- Pretendard v1.3.9 — SIL Open Font License, `site/font-LICENSE.txt`
- node-qrcode v1.5.4 — MIT, `site/qrcode-LICENSE.txt`
- 아이콘·로고는 이 목업을 위한 SVG/코드로 구성했습니다.
