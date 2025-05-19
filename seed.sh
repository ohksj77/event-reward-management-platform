#!/bin/bash

# seed.js 를 통해 MongoDB에 더미데이터를 삽입합니다.
# 프로젝트 최상위 디렉토리에서 실행해주세요. 초기 한 번만 실행해주세요.

docker cp ./seed.js mongo:/seed.js
docker exec -it mongo mongosh /seed.js
