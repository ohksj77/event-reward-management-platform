# event-reward-management-platform
이벤트 보상 시스템

## Table Of Contents

1. 이벤트 설계
2. API 설계
3. DB 스키마 명세
4. DB 인덱스 설계
5. DB 분리 여부
6. 멀티 모듈 vs 프로젝트 분리
7. API Gateway 관련 고민
8. 실행 방법
9. 아쉬운 점 & 보완하고 싶은 점


## 1. 이벤트 설계

- 처음에는 다음 이벤트들에 맞는 컬렉션을 따로 만들고자 하였으나 따로 GameLog 컬렉션을 만들고 이벤트에 따른 로그가 발생하는 환경이라 가정하여 이 로그로 보상 여부를 판단하고자 함

- 로그인 연속 N일
    - N의 최대치는 7일로 제한 (GameLog 샤딩 시 여러 샤드에서 조회하는 부담을 줄이기 위함, GameLog 컬렉션은 로그성 데이터이기에 일자를 키로 샤드를 구성할 확률이 높아보이기 때문, 실제 구현한다면 따로 카운터를 저장하는게 좋아보임)
    - login 타입의 GameLog 확인

- 초대한 친구의 로그인
    - invite 타입의 GameLog에 친구의 loginId가 포함됨
    - 해당 loginId의 유저에 대한 login 타입의 GameLog가 이후 조회되면 보상 지급

- 하루에 특정 몬스터 N마리 사냥
    - N의 최대치는 굳이 제한하지 않음
    - 유저의 알맞은 몬스터에 대한 hunt 타입의 GameLog 횟수를 조회


## 2. API 설계

- 공통 사항
    - api 서버임을 구분 가능하면서 api 버저닝이 가능하도록 prefix “/api/v1/” 을 사용

### 인증

- 회원가입: [POST] /api/v1/auth/register
- 로그인: [POST] /api/v1/auth/login
- 토큰 리프레시: [POST] /api/v1/auth/refresh
- 로그아웃: [POST] /api/v1/auth/logout

### 이벤트

- 이벤트 등록: [POST] /api/v1/events
- 이벤트 목록 조회: [GET] /api/v1/events?page=0&size=20
- 이벤트 상세 조회: [GET] /api/v1/events/{event-id}
    - 보상 정보도 함께 조회

### 보상

- 보상 등록: [POST] /api/v1/rewards
- 보상 조회: [GET] /api/v1/rewards/{reward-id}

### 보상 요청

- 보상 요청: [POST] /api/v1/reward-requests
    - 즉시 응답 이후 비동기적으로 로직 수행

### 보상 요청 내역 확인

- 유저 본인 보상 요청 이력 확인: [GET] /api/v1/reward-requests/{reward-request-id}
    - 실제 요청 결과를 확인할 때는 이 API를 폴링으로 PENDING에서 성공/실패로 바뀔때까지 반복 요청 (최대 반복 횟수 혹은 전체 timeout 설정 필요)
- [운영자 / 감사자 / 관리자] 전체 유저 요청 기록 조회: [GET] /api/v1/reward-requests?page=0&size=20
- 필터링 조회: [GET] /api/v1/reward-requests?type=STATUS&target=PENDING

### 테스트의 편의성을 위해 만든 API
- 게임 로그 생성: [POST] /api/v1/game-logs
- 게임 로그 목록 조회: [GET] /api/v1/game-logs?page=0&size=20
- 관리자 회원 가입: [POST] /api/v1/auth/admin/register
    - 권한을 설정하여 회원 가입 가능


## 3. DB 스키마 명세

- 공통으로 다음과 같은 필드를 가짐
    - created_at
    - updated_at
    - deleted_at (soft-delete를 위함)

- 유저 user
    - objectId
    - loginId
    - password
    - nickname
    - 권한
- 리프레시 토큰 refresh-token (TTL Index)
    - objectId
    - value
- 이벤트 event
    - objectId
    - name
    - condition (nested)
        - type (연속 로그인 일자 등)
        - metadata (nested) → type 별 필요한 데이터가 다를 수 있기에 확장성을 위한 설계
            - ex) required-count (필요 조건 만족 횟수)
    - status (활성/비활성)
- 보상 reward
    - objectId
    - event objectId
    - type (포인트/아이템/쿠폰)
    - count
- 보상 요청 reward-request
    - objectId
    - user objectId
    - event objectId
    - status (성공/실패)
- 게임 로그 GameLog
    - objectId
    - user objectId
    - type (hunt/invite/login)
    - metadata (nested) → type 별 필요한 데이터가 다름
        - ex) monster


## 4. DB 인덱스 설계

- RefreshToken 컬렉션의 value → TTL 인덱스
- user 컬렉션의 loginId → 유니크 인덱스
- reward-request 컬렉션의 (user objectId, event objectId) → 유니크 인덱스

- 조회 성능만을 위한 인덱스
    - reward-request 컬렉션의 (userId, status, created_at) → 복합 인덱스
    - event 컬렉션의 status → 단일 인덱스
    - reward 컬렉션의 eventId → 단일 인덱스
- 인덱스가 떠오른 부분들이기에 우선 적용하기로 결정
    - 실 서비스에서는 해당 기능의 중요도와 데이터가 많아졌을때의 성능 등을 고려해야 함


## 5. DB 분리 여부

- 샤딩
    - 데이터가 어느정도로 쌓였다고 가정해둔 부분이 없기에 굳이 나누지 않음
    - 실 서비스에서는 고려 필요, 특히 GameLog 테이블은 필연적으로 날짜 등을 키로 샤딩을 수행할 것으로 보임
- 서버 별 DB 분리
    - 현재는 서버 실행과 활용의 단순성을 위해 공통 DB 하나만 활용
    - 실 서비스로 확장 시에는 각 역할에 맞는 DB 분리를 고려해야 함
    - 또한, 경우에 따라 MongoDB 만 활용하지 않을 수도 있음


## 6. 멀티 모듈 vs 프로젝트 분리 고민

- MSA를 가정으로 했다는 점에서 각 다른 서버로 분리된 형태로 개발 진행
- 간단히 멀티 모듈 형태로 포트를 구분해 작동시키는 방안도 고려는 했지만 서로 연관성이 크지 않은 서버들로 판단하여 굳이 멀티 모듈 형태를 가져가지 않음


## 7. API Gateway 관련 고민

### 인증/인가 흐름

- Jwt 에 userId 와 권한 정보를 담음
- userId와 권한 정보를 확인하는 작업은 API Gateway Server 에서 진행
    - 매번 Auth Server를 거치는건 비효율적

### API Gateway Server ↔ 서버 간 통신 방식

- HTTP
    - 다른 통신 방법에 비해 간단히 활용할 수 있기에 선택
    - RPC 방식은 gRPC는 학습이 필요했으며 RabbitMQ RPC 방식의 경우 MQ를 추가해야 하는 부담
    - 만약 높은 트래픽을 가정한다면 다른 선택을 해야할 수 있음

## 8. 실행 방법

1. 프로젝트 최상위 디렉토리로 이동합니다.
2. 다음 커맨드로 docker-compose.yml을 실행합니다.
```
docker compose up -d
```

- MongoDB 접속 커맨드
```
docker compose exec -it mongo mongosh
```

- API Docs (auth-server)
```
http://localhost:3001/api-docs
```

- API Docs (event-server)
```
http://localhost:3002/api-docs
```

- API Gateway의 요청 로그는 ./api-gateway-server/log 로컬 디렉토리에 마운트되어 저장됩니다.

## 9. 아쉬운 점 & 보완하고 싶은 점
1. MongoDB 트랜잭션에 대해 고려하지 못한 점 아쉽습니다.
2. 분산 환경에서의 API Docs를 어떻게 통합 설정할 수 있을지 좋을지 헷갈려 시간을 많이 소요한 점 아쉽습니다.
3. 테스트 작성 시 Fixture를 도입했다면 시간을 절약할 수 있었을 것이라 느꼈습니다.
