# 클래식 던전 쫄 무리·순찰 (data/guides/dungeon-mobs.json)

재료: CMaNGOS classic-db (GPL-3.0) `Full_DB/ClassicDB_1_12_1_z2815.sql.gz` — 저장소에 넣지 않음.

1. `python3 -I parse.py <sql.gz> /tmp/cmout/classic.json` — 던전 맵 19곳 몹 생성 자리·순찰(creature_movement·spawn_group 대형·waypoint_path)
2. `python3 packs.py` — 10야드 안(높이 6야드 안)·같은 대형이면 한 무리, 순찰 경로 붙임 → /tmp/cmout/packs.json
3. `python3 project.py` — 층마다 보스 핀(dungeon-guide.json)과 몹 자리로 지도 % 맞춤(3곳 이상·오차 3% 안·가로세로 비율 1.2~1.9만), 보스·핀 있는 NPC는 뺌

지금은 wowf.io 지도 위에 맞춤. 우리 3D 지도로 바꾸면 그 지도 범위로 다시 계산.
