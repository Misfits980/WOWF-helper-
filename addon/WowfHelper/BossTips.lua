-- 자동 생성 (app/build.py) · 보스 이름(한글/영어) → 공략 줄 "종류|이름표|내용"
WowfHelperBoss = {}
local B = WowfHelperBoss
do local t = {"tk|탱커|회전베기 — 탱커가 보스를 일행 반대로 돌리기", "add|쫄|호위 2마리 — 해골·X 표시하고 먼저 잡기"}
B["Oggleflint"] = t
B["오글플린트"] = t
end
do local t = {"av|피하기|불꽃 회오리 — 근접 딜러는 체력 관리", "tk|탱커|올려치기 — 용암 쪽에 등지지 말고 가운데서 잡기"}
B["Taragaman the Hungerer"] = t
B["욕망의 타라가만"] = t
end
do local t = {"dis|해제(독)|맹독 — 독 해제(드루이드·성기사·주술사)", "tk|탱커|사악한 일격 — 탱커 체력 주의"}
B["Bazzalan"] = t
B["바잘란"] = t
end
do local t = {"int|끊기|제물 — 끊으면 탱커 피해가 줄어요", "dis|해제(저주)|무력화 저주 — 저주 해제(마법사·드루이드)", "add|쫄|호위 2마리 — 보스부터 빨리 잡기"}
B["Jergosh the Invoker"] = t
B["기원사 제로쉬"] = t
end
do local t = {"int|끊기|정신 분열 — 여유 있으면 끊기", "dis|해제(저주)|앤빌마의 저주 — 저주 해제, 없으면 버티기"}
B["Faldrim Anvilmar"] = t
B["팔드림 앤빌마"] = t
end
do local t = {"add|쫄|검은무쇠 소환사 — 먼저 잡기", "av|피하기|불꽃 회오리 — 원거리는 떨어지고, 탱커는 일행에서 끌고 가기", "hl|치유|발화 — 탱커만 보지 말고 근접도 치유"}
B["Magmatus"] = t
B["마그마투스"] = t
end
do local t = {"tk|탱커|밀쳐내기 — 벽이나 구석을 등지고 잡기 (옆 무리로 날아가지 않게)", "av|피하기|돌진 — 필요 없으면 가까이 가지 말기"}
B["Plunder"] = t
B["약탈골렘"] = t
end
do local t = {"dz|위험|공포 — 방을 다 비우고 시작, 진동의 토템·공포의 수호물", "add|쫄|작은 돌 골렘 2 — 보스 먼저, 그다음 골렘", "tk|탱커|분쇄 — 탱커 체력 주의"}
B["Durgen Dirgehammer"] = t
B["드루겐 더지해머"] = t
end
do local t = {"dis|해제(독)|흡혈 독 — 독 해제, 못 해도 괜찮아요", "add|쫄|새끼 거미 — 붙어 오면 먼저 잡기"}
B["Witherfang"] = t
B["쇠퇴송곳니"] = t
end
do local t = {"dz|위험|기절 강타 — 탱커 체력을 늘 가득, 보스 기절기 쓰기", "tk|탱커|앞쪽 휘두르기 — 근접 딜러는 등 뒤에서", "av|피하기|근접 광역 — 원거리는 떨어져서 흩어지기"}
B["The Butcher(The Baron)"] = t
B["도살자(남작)"] = t
end
do local t = {"add|쫄|쫄 5번 — 사이사이 마나 채우기", "dis|해제(독)|흡혈 독 — 독 해제", "tk|탱커|센 공격 — 탱커가 먼저 어그로"}
B["Viktor the Vile"] = t
B["비열한 빅토르"] = t
end
do local t = {"add|쫄|언데드 3번 — 탱커가 다 붙잡기", "int|끊기|생명력 흡수 — 시전 시작에 끊기·기절", "av|피하기|얼음 회오리 — 근접은 각오, 원거리는 떨어지기", "info|참고|냉기 갑옷 — 원거리 위주"}
B["The Abandoned"] = t
B["버려진 자"] = t
end
do local t = {"info|참고|마법 보호막 — 끝날 때까지 물리 공격하거나 기다리기"}
B["Bjork"] = t
B["비요크"] = t
end
do local t = {"dz|위험|불기둥 — 시전 때 끊거나 기절, 장판에서 바로 나오기"}
B["Rath'mael"] = t
B["라스마엘"] = t
end
do local t = {"int|끊기|수면 — 끊기", "int|끊기|치유의 손길 — 꼭 끊기", "int|끊기|번개 화살 — 여유 있으면 끊기", "info|참고|가시 오라 — 근접 딜러 체력 주의"}
B["Lady Anacondra"] = t
B["여군주 아나콘드라"] = t
end
do local t = {"int|끊기|드루이드의 잠 — 치유의 손길보다 먼저 끊기", "int|끊기|치유의 손길 — 끊기", "info|참고|뱀 변신 — 독 피해 대비"}
B["Lord Cobrahn"] = t
B["군주 코브란"] = t
end
do local t = {"tk|탱커|물기 — 탱커 생존기"}
B["Kresh"] = t
B["크레쉬"] = t
end
do local t = {"int|끊기|드루이드의 잠 — 끊기", "int|끊기|치유의 손길 — 끊기", "av|피하기|천둥벼락 — 원거리는 떨어지기", "add|쫄|송곳니 드루이드 — 하나씩 잡기"}
B["Lord Pythas"] = t
B["군주 피타스"] = t
end
do local t = {"av|피하기|연쇄 번개 — 흩어지기", "info|참고|자연 면역 — 다른 속성으로"}
B["Skum"] = t
B["스컴"] = t
end
do local t = {"int|끊기|드루이드의 잠 — 끊기", "int|끊기|치유의 손길 — 끊기", "add|쫄|송곳니 드루이드 2 — 먼저 잡기"}
B["Lord Serpentis"] = t
B["군주 서펜티스"] = t
end
do local t = {"dz|위험|휘감는 덩굴 — 원거리·힐러는 멀리, 탱커엔 미리 보호막·지속 치유", "hl|치유|센 근접 공격 — 쉬지 말고 탱커 치유"}
B["Verdan the Everliving"] = t
B["영생의 베르단"] = t
end
do local t = {"av|피하기|천둥 균열 — 끝나면 근접 치유", "info|참고|공포 — 진동의 토템·공포의 수호물", "int|끊기|나라렉스의 악몽 — 끊거나 해제", "add|쫄|쫄 무리 — 나라렉스 지키며 정리"}
B["Mutanus the Devourer"] = t
B["걸신들린 무타누스"] = t
end
do local t = {"tk|탱커|라크조르 강타 — 탱커 체력 주의", "add|쫄|파수꾼 2 — 하나는 변이 등 묶기"}
B["Rhahk'Zor"] = t
B["라크조르"] = t
end
do local t = {"info|참고|공포 — 방의 벌목꾼을 먼저 정리", "info|참고|산만한 고통 — 어그로 유지", "add|쫄|스니드 등장 — 바로 도발", "tk|탱커|무장 해제 — 무기 없는 기술로 어그로"}
B["Sneed"] = t
B["스니드"] = t
end
do local t = {"tk|탱커|녹은 금속 — 자유의 축복, 딜러는 어그로 조심", "add|쫄|고블린 일꾼 — 한쪽을 비우고 시작"}
B["Gilnid"] = t
B["길니드"] = t
end
do local t = {"dz|위험|스마이트 발구르기 — 숨은 흑마수 2마리 먼저 잡기", "tk|탱커|쌍수 단계 — 탱커 생존기"}
B["Mr. Smite"] = t
B["미스터 스마이트"] = t
end
do local t = {"int|끊기|쿠키의 요리 — 끊기", "tk|탱커|산성 튀기기 — 탱커 치유"}
B["Cookie"] = t
B["쿠키"] = t
end
do local t = {"tk|탱커|회전베기 — 일행 반대로", "add|쫄|해적 쫄 — 정예 2마리 먼저 표시하고 잡기", "info|참고|독 작살 — 독 해제"}
B["Captain Greenskin"] = t
B["선장 그린스킨"] = t
end
do local t = {"add|쫄|흑마수 호위 — 50% 전에 기절기 아껴 두기", "tk|탱커|난타 — 탱커 생존기", "hl|치유|긴 전투 — 마나 아끼기"}
B["Edwin VanCleef"] = t
B["에드윈 밴클리프"] = t
end
do local t = {"int|끊기|영혼 흡수 — 기절기로 끊기"}
B["Rethilgore"] = t
B["레실고어"] = t
end
do local t = {"info|참고|도살자의 흡수 — 치유"}
B["Razorclaw the Butcher"] = t
B["도살자 칼날발톱"] = t
end
do local t = {"dz|위험|그림자의 장막 — 저주 해제, 없으면 미리 채우고 기절기"}
B["Baron Silverlaine"] = t
B["남작 실버레인"] = t
end
do local t = {"int|끊기|성스러운 빛 — 꼭 끊기", "tk|탱커|심판의 망치 — 잠깐 어그로 흔들림 주의", "dis|해제(정화)|천상의 보호 — 기다리거나 정화"}
B["Commander Springvale"] = t
B["사령관 스프링베일"] = t
end
do local t = {"dz|위험|울부짖는 분노 — 길게 끌지 말고 빨리 잡기"}
B["Odo the Blindwatcher"] = t
B["눈먼감시자 오도"] = t
end
do local t = {"dis|해제(독)|독성 침 — 독 해제"}
B["Fenrus the Devourer"] = t
B["파멸의 펜루스"] = t
end
do local t = {"add|쫄|늑대 부르기 — 나오면 먼저 잡기", "tk|탱커|센 공격 — 탱커 생존기"}
B["Wolf Master Nandos"] = t
B["늑대왕 난도스"] = t
end
do local t = {"dz|위험|아루갈의 저주 — 묶거나 피해 받아내기", "av|피하기|공허의 화살 — 기둥 뒤로 시야 끊기", "info|참고|그림자 이동 — 따라가서 다시 붙잡기", "av|피하기|천둥 충격 — 가까이 몰리지 않기"}
B["Archmage Arugal"] = t
B["대마법사 아루갈"] = t
end
do local t = {"av|피하기|짓밟기 — 방어도 낮추기(약화·요정의 불꽃)"}
B["Ghamoo-ra"] = t
B["가무라"] = t
end
do local t = {"tk|탱커|갈래 번개 — 탱커가 보스를 일행 반대로", "info|참고|얼음 회오리 — 원거리는 떨어져서", "add|쫄|나가 쫄 — 먼저 잡거나 변이로 묶기"}
B["Lady Sarevess"] = t
B["여왕 사레베스"] = t
end
do local t = {"info|참고|그물 — 묶인 동안 치유 주의", "add|쫄|멀록 무리 — 방을 먼저 비우고 보스"}
B["Gelihast"] = t
B["겔리하스트"] = t
end
do local t = {"int|끊기|번개 화살 — 끊기", "add|쫄|토템 — 토템부터 부수기"}
B["Lorgus Jett"] = t
B["로구스 제트"] = t
end
do local t = {"info|참고|물속 전투 — 빨리 잡고 올라오기"}
B["Old Serra'kis"] = t
B["늙은 세라키스"] = t
end
do local t = {"int|끊기|수면 — 끊기", "tk|탱커|정신 분열 — 탱커 치유", "add|쫄|시전자 쫄 — 입구 벽으로 시야 끊어 당기기"}
B["Twilight Lord Kelris"] = t
B["황혼의 군주 켈리스"] = t
end
do local t = {"dz|위험|독구름 — 구름에서 바로 나오기", "hl|치유|광란 — 탱커 치유 집중", "add|쫄|화로 쫄 — 화로는 하나씩 눌러 정리"}
B["Aku'mai"] = t
B["아쿠마이"] = t
end
do local t = {"info|참고|광폭 — 마무리 빨리"}
B["Targorr the Dread"] = t
B["흉악범 타고르"] = t
end
do local t = {"tk|탱커|방패 밀쳐내기 — 피해 + 2초 기절"}
B["Kam Deepfury"] = t
B["캄 딥퓨리"] = t
end
do local t = {"int|끊기|연쇄 번개 — 기절·끊기", "dis|해제(정화)|피의 욕망 — 정화로 지우기, 천둥벼락"}
B["Hamhock"] = t
B["햄혹"] = t
end
do local t = {"av|피하기|연막탄 — 원거리는 떨어져서", "info|참고|대상 바꾸기 — 그 사람 치유"}
B["Bazil Thredd"] = t
B["바질 스레드"] = t
end
do local t = {"dz|위험|위협의 외침 — 진동의 토템, 넓은 곳에서 잡기"}
B["Dextren Ward"] = t
B["덱스트렌 워드"] = t
end
do local t = {"tk|탱커|먼지 폭풍 — 딜러는 천천히", "tk|탱커|치명적 물기 — 탱커 큰 피해", "add|쫄|호수 악어 — 보스만 따로 당기기"}
B["Saltspine"] = t
B["소금가시"] = t
end
do local t = {"dz|위험|공포의 포효 — 풀숲 몹 먼저 정리, 공포의 수호물", "tk|탱커|분쇄 — 3초마다 출혈 피해", "info|참고|광폭 — 마무리 빨리"}
B["Shadetooth"] = t
B["그늘이빨"] = t
end
do local t = {"int|끊기|자연의 재생 — 끊기", "info|참고|휘감는 뿌리 — 발이 묶여요", "add|쫄|주변 진흙 — 주변 진흙 안 끌리게 조심"}
B["Highland Horror"] = t
B["고원 공포"] = t
end
do local t = {"tk|탱커|광역 강타 — 일행 반대로", "av|피하기|전투 발구르기 — 원거리는 멀리", "tk|탱커|밀쳐내기 — 다시 도발", "info|참고|천둥벼락 — 공격 속도 감소"}
B["Relic Guardian"] = t
B["유물 수호자"] = t
end
do local t = {"add|쫄|해골 일으키기 — 탱커가 모으고 광역으로 정리", "dis|해제(정화)|부정의 광기 — 주술사 정화·사제 마법 무효화", "tk|탱커|무장 해제 — 힐러가 탱커 주의", "tk|탱커|강타·난타 — 탱커 생존기"}
B["Atrexis the Grave Knight"] = t
B["무덤 기사 아트렉시스"] = t
end
do local t = {"dis|해제(저주)|가시의 저주 — 저주 해제(마법사·드루이드)", "hl|치유|연발 어둠의 화살 — 전체 치유", "add|쫄|해골 소환 — 힐러에게 가지 않게 탱커가 잡기"}
B["Lyn the Ignored"] = t
B["외면받는 린"] = t
end
do local t = {"dz|위험|쇠약 — 마나 가득 채우고 빨리 잡기", "tk|탱커|활력 흡수 — 탱커 치유", "info|참고|비전 면역 — 다른 속성으로", "add|쫄|남은 몹 합류 — 방 먼저 비우기"}
B["Mana Devourer"] = t
B["마나 포식자"] = t
end
do local t = {"dz|위험|초점 폭발 — 모두 보스 바로 뒤에 붙어 같이 돌기", "tk|탱커|비전 화살 — 탱커 치유"}
B["Arcane Anomaly"] = t
B["비전 변형물"] = t
end
do local t = {"av|피하기|지옥 목재 — 바로 나오기", "dis|해제(마법)|휘감기 — 장판이 깔리면 바로 해제, 자유의 축복·드루이드 변신"}
B["Fel Ancient"] = t
B["지옥의 고대정령"] = t
end
do local t = {"int|끊기|마나 연소 — 끊고 기절, 망령부터 잡기", "dis|해제(마법)|마나변이 — 마법 해제", "av|피하기|광역 침묵 — 원거리·힐러는 떨어져서", "add|쫄|마나 정령 소환 — 모아서 광역"}
B["Arcanic Enigma"] = t
B["신비한 수수께끼"] = t
end
do local t = {"dz|위험|기능 장애 — 시전 보이면 범위 밖으로, 시전 전 기절기", "tk|탱커|광역 강타 — 일행 반대로 돌리기"}
B["Unstable Sentinel"] = t
B["불안정한 파수꾼"] = t
end
do local t = {"dz|위험|튕기는 마나 — 흩어지고 구체 길 피하기", "av|피하기|비전 폭발 — 원거리는 20미터 밖", "dz|위험|대규모 변이 — 벽 뒤에 숨기, 방 밖으로 끌면 초기화", "tk|탱커|비전 화살 — 탱커 치유"}
B["Shade of the Archmage"] = t
B["대마법사의 망령"] = t
end
do local t = {"add|쫄|씹쇠 — 먼저 잡기", "info|참고|기절·공포 — 보스는 기절·공포가 잘 먹어요"}
B["Grubbis"] = t
B["그루비스"] = t
end
do local t = {"dis|해제(독)|독성 연발 — 독 해제, 전체 치유", "info|참고|냉기 면역 — 냉기 피해 안 들어가요"}
B["Viscous Fallout"] = t
B["방사성 폐기물"] = t
end
do local t = {"av|피하기|연쇄 번개 — 근접은 최대 거리, 흩어지기", "hl|치유|메가볼트 — 시전 뒤 바로 채우기"}
B["Electrocutioner 6000"] = t
B["기계화 문지기 6000"] = t
end
do local t = {"av|피하기|광역 강타 — 원거리는 최대 거리", "av|피하기|짓밟기 — 탱커는 벽을 등지고"}
B["Crowd Pummeler 9-60"] = t
B["고철 압축기 9-60"] = t
end
do local t = {"dz|위험|걸어오는 폭탄 — 원거리가 바로 잡기, 기둥 단추로 잠깐 멈추기", "tk|탱커|밀쳐내기 — 가운데로 돌아와 바로 도발", "add|쫄|폭탄 기계 — 기둥 단추 담당 정하기"}
B["Mekgineer Thermaplugg"] = t
B["멕기니어 텔마플러그"] = t
end
do local t = {"add|쫄|바위 정령 — 잡거나 묶기", "add|쫄|죽음의머리 선견자 — 해골 표시, 먼저"}
B["Roogug"] = t
B["루구그"] = t
end
do local t = {"add|쫄|멧돼지 영혼 — 빨리 잡고 힐러에게서 떼기", "int|끊기|치유 — 끊기"}
B["Aggem Thorncurse"] = t
B["저주의가시 아겜"] = t
end
do local t = {"dz|위험|정신 지배 — 사제 마법 무효화·주술사 정화, 보스에게서 떨어지기", "info|참고|어둠의 화살 — 근접 유지", "int|끊기|마나 연소 — 끊기"}
B["Death Speaker Jargba"] = t
B["죽음의예언자 잘그바"] = t
end
do local t = {"dz|위험|소용돌이 연타 — 돌기 시작하면 근접도 빠지기", "add|쫄|창가죽 쫄 — 힐러·원거리에서 떼어 놓기"}
B["Overlord Ramtusk"] = t
B["대군주 램터스크"] = t
end
do local t = {"av|피하기|돌진 — 근접 거리에 있기", "tk|탱커|센 공격 — 물약·생명석", "info|참고|죽은 척 — 계속 때리기"}
B["Agathelos the Raging"] = t
B["흉포한 아가테로스"] = t
end
do local t = {"av|피하기|연쇄 번개 — 흩어지기", "info|참고|정화 — 그동안 디버프 걸지 말기", "info|참고|오두막 순간이동 — 다시 붙잡기"}
B["Charlga Razorflank"] = t
B["서슬깃 차를가"] = t
end
do local t = {"dis|해제(마법)|어둠의 권능: 고통 — 마법 해제"}
B["Interrogator Vishas"] = t
B["심문관 비샤스"] = t
end
do local t = {"av|피하기|불꽃 회오리 — 근접 체력 주의", "int|끊기|화염 가시 — 끊기, 밖으로", "int|끊기|어둠의 화살 — 끊기"}
B["Bloodmage Thalnos"] = t
B["혈법사 탈노스"] = t
end
do local t = {"dis|해제(정화)|피의 욕망 — 마법 해제·정화로 지우기", "add|쫄|추적 사냥개 3 — 사냥개를 광역으로 먼저 정리, 하나는 묶기"}
B["Houndmaster Loksey"] = t
B["사냥개조련사 록시"] = t
end
do local t = {"dz|위험|비전 보호막 → 대폭발 — 보호막 보이면 모두 멀리 달아나기", "dis|해제(마법)|변이 — 마법 해제", "av|피하기|비전 폭발 — 원거리는 떨어져서", "info|참고|침묵 — 미리 체력 채워 두기"}
B["Arcanist Doan"] = t
B["신비술사 도안"] = t
end
do local t = {"dz|위험|소용돌이 — 「피의 회오리!」 외치면 근접도 바로 빠지기", "info|참고|광폭 — 생존기", "add|쫄|훈련병 무리 — 입구에서 광역", "tk|탱커|돌진 — 다시 붙잡기"}
B["Herod"] = t
B["헤로드"] = t
end
do local t = {"dis|해제(저주)|피의 저주 — 저주 해제", "info|참고|공포 — 광역 공포", "int|끊기|치유 — 끊기"}
B["High Inquisitor Fairbanks"] = t
B["종교재판관 페어뱅크스"] = t
end
do local t = {"tk|탱커|심판의 망치 — 탱커 기절", "dis|해제(정화)|천상의 보호막 — 정화하거나 기다리기", "tk|탱커|성전사의 일격 — 탱커 피해 증가"}
B["Scarlet Commander Mograine"] = t
B["붉은십자군 사령관 모그레인"] = t
end
do local t = {"dz|위험|깊은 잠 → 부활 — 마나 아끼고, 모그레인 다시 잡기", "int|끊기|치유 — 꼭 끊기", "int|끊기|신성한 일격 — 끊기", "dis|해제(정화)|신의 권능: 보호막 — 정화·마법 무효화"}
B["High Inquisitor Whitemane"] = t
B["종교재판관 화이트메인"] = t
end
do local t = {"av|피하기|거미줄 뿜기 — 탱커가 일행 반대로", "dis|해제(저주)|투텐카쉬의 저주 — 저주 해제", "dis|해제(독)|맹독 — 독 해제"}
B["Tuten'kash"] = t
B["투텐카쉬"] = t
end
do local t = {"add|쫄|호위 이벤트 쫄 — 벨니스트라즈 지키며 쫄 정리"}
B["Plaguemaw the Rotting"] = t
B["썩어가는 역병아귀"] = t
end
do local t = {"int|끊기|화염구 — 끊기", "av|피하기|불꽃 회오리 — 밖으로", "add|쫄|해골 — 광역으로 정리"}
B["Mordresh Fire Eye"] = t
B["불꽃눈 모드레쉬"] = t
end
do local t = {"int|끊기|치유 — 끊기", "int|끊기|어둠의 화살 — 끊기", "dz|위험|정신 지배 — 묶고 치유"}
B["Ragglesnout"] = t
B["너덜주둥이"] = t
end
do local t = {"av|피하기|질병 구름 — 근접 체력 주의", "hl|치유|광란 — 탱커 치유"}
B["Glutton"] = t
B["게걸먹보"] = t
end
do local t = {"dz|위험|아마넨나르의 진노 — 탱커가 보스 돌리고, 근접 체력 주의", "add|쫄|서리 망령 — 원거리가 잡기", "av|피하기|얼음 회오리 — 묶임", "int|끊기|얼음 화살 — 끊기"}
B["Amnennar the Coldbringer"] = t
B["혹한의 암네나르"] = t
end
do local t = {"int|끊기|연쇄 번개 — 끊고 흩어지기", "add|쫄|트로그 2 — 먼저 잡기"}
B["Revelosh"] = t
B["레벨로쉬"] = t
end
do local t = {"tk|탱커|돌진 — 탱커가 에릭 붙잡기", "tk|탱커|방패 밀쳐내기 — 탱커가 잡기", "info|참고|원거리 공격 — 묶기"}
B["The Lost Dwarves"] = t
B["길 잃은 드워프"] = t
end
do local t = {"tk|탱커|광역 강타 — 일행 반대로, 근접은 흩어지기", "av|피하기|전투 발구르기 — 체력 50%에 광역 기절", "tk|탱커|밀쳐내기 — 다시 도발", "info|참고|지속 피해 면역 — 직접 피해 주문만"}
B["Ironaya"] = t
B["아이로나야"] = t
end
do local t = {"add|쫄|흑요석 조각 — 먼저 잡기", "info|참고|지속 피해 면역 — 직접 피해만"}
B["Obsidian Sentinel"] = t
B["흑요석 파수꾼"] = t
end
do local t = {"dz|위험|모래 폭풍 — 원거리·힐러는 최대 거리", "info|참고|지속 피해 면역 — 직접 피해만"}
B["Ancient Stone Keeper"] = t
B["고대 바위 문지기"] = t
end
do local t = {"dis|해제(마법)|화염 증폭 — 마법 해제", "hl|치유|불꽃 회오리 — 보호막·지속 치유", "add|쫄|지질학자 2 — 하나씩 맡아 먼저 잡기"}
B["Galgann Firehammer"] = t
B["갈간 파이어해머"] = t
end
do local t = {"dis|해제(정화)|피의 욕망 — 정화", "int|끊기|번개 화살 — 끊기", "add|쫄|바실리스크 — 묶거나 먼저 잡기"}
B["Grimlok"] = t
B["그림로크"] = t
end
do local t = {"dz|위험|대지의 진동 — 흩어지고 탱커가 일행에서 끌고 가기", "add|쫄|수호자 깨우기 — 탱커가 모으기", "add|쫄|정예 4 — 보스만 잡으면 같이 죽어요"}
B["Archaedas"] = t
B["아카에다스"] = t
end
do local t = {"dis|해제(질병)|열병 — 질병 해제", "info|참고|변신 — 공격 방식 바꾸기"}
B["Theka the Martyr"] = t
B["순교자 데카"] = t
end
do local t = {"add|쫄|바실리스크 — 탱커가 모으고 광역", "int|끊기|치유 수호물 — 바로 부수기", "add|쫄|대지의 손아귀 토템 — 부수기"}
B["Antu'sul"] = t
B["안투술"] = t
end
do local t = {"int|끊기|연발 어둠의 화살 — 끊기", "add|쫄|무덤 좀비 — 탱커가 모으기", "int|끊기|치유 — 끊기"}
B["Witch Doctor Zum'rah"] = t
B["의술사 줌라"] = t
end
do local t = {"dis|해제(질병)|열병 — 질병 해제", "int|끊기|세즈지즈의 치유 — 세즈지즈부터"}
B["Nekrum Gutchewer"] = t
B["네크룸 거트츄어"] = t
end
do local t = {"tk|탱커|회전베기 — 일행 반대로", "info|참고|광폭 — 체력 낮을 때 세져요", "add|쫄|루즐루 — 하나 더 탱킹"}
B["Chief Ukorz Sandscalp"] = t
B["족장 우코르즈 샌드스칼프"] = t
end
do local t = {"int|끊기|치유의 물결 — 끊기", "info|참고|얼음 회오리 — 묶임"}
B["Hydromancer Velratha"] = t
B["유체술사 벨라타"] = t
end
do local t = {"dz|위험|가즈릴라 강타 — 탱커 생존기", "av|피하기|얼리기 — 가까이 있으면 얼어요"}
B["Gahz'rilla"] = t
B["가즈릴라"] = t
end
do local t = {"dis|해제(독)|독성 연발 — 독 해제", "add|쫄|분열 — 광역으로 정리", "tk|탱커|올려치기 — 탱커 넉백"}
B["Noxxion"] = t
B["녹시온"] = t
end
do local t = {"tk|탱커|회전베기 — 일행 반대로", "tk|탱커|꿰뚫기 — 방어도 감소"}
B["Razorlash"] = t
B["칼날채찍"] = t
end
do local t = {"av|피하기|연막탄 — 흩어지기", "info|참고|일제 사격 — 여럿 피해"}
B["Lord Vyletongue"] = t
B["군주 바일텅"] = t
end
do local t = {"int|끊기|천벌 — 끊기", "info|참고|휘감는 뿌리 — 묶임"}
B["Celebras the Cursed"] = t
B["저주받은 셀레브라스"] = t
end
do local t = {"tk|탱커|밀쳐내기 — 벽을 등지기", "add|쫄|바위 소환 — 빨리 잡기", "av|피하기|짓밟기 — 근처 피해"}
B["Landslide"] = t
B["산사태"] = t
end
do local t = {"av|피하기|폭탄 — 흩어지기", "av|피하기|고블린 용 총 — 정면 피하기"}
B["Tinkerer Gizlock"] = t
B["땜장이 기즐록"] = t
end
do local t = {"tk|탱커|치명적 물기 — 큰 피해", "tk|탱커|분쇄 — 출혈"}
B["Rotgrip"] = t
B["썩은아귀"] = t
end
do local t = {"dz|위험|혐오의 시선 — 바로 다시 도발", "av|피하기|돌덩이 — 흩어지기", "av|피하기|먼지 장판 — 근접 체력 주의"}
B["Princess Theradras"] = t
B["공주 테라드라스"] = t
end
do local t = {"tk|탱커|난타 — 연속 공격", "av|피하기|휩쓸기 — 주변 넉백"}
B["Atal'alarion"] = t
B["아탈알라리온"] = t
end
do local t = {"dz|위험|잠말란의 주술 — 묶어 두거나 기다리기", "int|끊기|치유의 물결 — 끊기", "add|쫄|오곰 — 같이 나오는 오곰부터"}
B["Jammal'an the Prophet"] = t
B["예언자 잠말란"] = t
end
do local t = {"av|피하기|산성 숨결 — 정면 피하기", "av|피하기|날개 퍼덕임 — 넉백"}
B["Dreamscythe"] = t
B["드림사이드"] = t
end
do local t = {"dz|위험|광기 — 묶거나 기다리기", "dis|해제(저주)|언어의 저주 — 저주 해제", "add|쫄|소환 의식 — 피의 단지 막기"}
B["Avatar of Hakkar"] = t
B["학카르의 화신"] = t
end
do local t = {"av|피하기|산성 숨결 — 정면 피하기", "tk|탱커|난타 — 연속 공격"}
B["Morphaz"] = t
B["몰파즈"] = t
end
do local t = {"dz|위험|깊은 잠 — 마나·체력 미리 채우기", "av|피하기|전투 발구르기 — 광역 기절", "av|피하기|산성 숨결 — 정면 피하기"}
B["Shade of Eranikus"] = t
B["에라니쿠스의 사령"] = t
end
do local t = {"dis|해제(마법)|어둠의 권능: 고통 — 마법 해제", "info|참고|공포 — 광역 공포", "dis|해제(정화)|보호막 — 정화"}
B["High Interrogator Gerstahn"] = t
B["대심문관 게르스탄"] = t
end
do local t = {"av|피하기|대지 충격 — 탱커 피해", "info|참고|지진 — 근처 기절"}
B["Lord Roccor"] = t
B["불의군주 록코르"] = t
end
do local t = {"dis|해제(정화)|피의 욕망 — 정화", "add|쫄|사냥개 — 사냥개 정리"}
B["Houndmaster Grebmar"] = t
B["사냥개조련사 그렙마르"] = t
end
do local t = {"add|쫄|투기장 쫄 — 탱커가 모으기"}
B["Ring of Law"] = t
B["법의 심판장"] = t
end
do local t = {"dz|위험|불의 폭풍 — 화염 저항, 흩어지기", "dis|해제(저주)|불의 저주 — 저주 해제"}
B["Lord Incendius"] = t
B["불의군주 인센디우스"] = t
end
do local t = {"int|끊기|성스러운 빛 — 끊기"}
B["Fineous Darkvire"] = t
B["파이너스 다크바이어"] = t
end
do local t = {"info|참고|화염 충격 — 탱커 피해", "add|쫄|불타는 토템 — 부수기"}
B["Pyromancer Loregrain"] = t
B["화염술사 로어그레인"] = t
end
do local t = {"info|참고|얼음 회오리 — 묶임", "add|쫄|베로그 — 따로 탱킹"}
B["Warder Stilgiss"] = t
B["문지기 스틸기스"] = t
end
do local t = {"add|쫄|금고 정령 — 정리"}
B["The Vault"] = t
B["아이언포지 은행"] = t
end
do local t = {"add|쫄|불타는 정령 — 빨리 잡기"}
B["Bael'Gar"] = t
B["밸가르"] = t
end
do local t = {"add|쫄|원군 소환 — 묶고 보스 집중", "tk|탱커|가르기 — 방어도 감소"}
B["General Angerforge"] = t
B["사령관 앵거포지"] = t
end
do local t = {"add|쫄|골렘 깨우기 — 방 먼저 비우기", "info|참고|번개 방패 — 때리면 반사 피해"}
B["Golem Lord Argelmach"] = t
B["골렘 군주 아젤마크"] = t
end
do local t = {"info|참고|화염 숨결 — 정면 피하기"}
B["Hurley Blackbreath"] = t
B["헐레이 블랙브레스"] = t
end
do local t = {"add|쫄|친척 — 같이 나오는 쫄"}
B["Ribbly Screwspigot"] = t
B["리블리 스크류스피곳"] = t
end
do local t = {"av|피하기|연발 화염구 — 광역 화염", "tk|탱커|천둥벼락 — 공격 속도 감소"}
B["Phalanx"] = t
B["팔란스"] = t
end
do local t = {"info|참고|맥주 던지기 — 술 훔치지 말기"}
B["Plugger Spazzring"] = t
B["플러거 스파즈링"] = t
end
do local t = {"add|쫄|불타는 정령 — 정령 먼저 잡기"}
B["Ambassador Flamelash"] = t
B["사자 화염채찍"] = t
end
do local t = {"add|쫄|일곱 형제 — 마나 관리, 자기 기술 하나씩"}
B["The Seven"] = t
B["일곱 현자"] = t
end
do local t = {"dz|위험|불길 분출 — 근접 체력 주의", "info|참고|분화구 함정 — 피하기"}
B["Magmus"] = t
B["마그무스"] = t
end
do local t = {"dz|위험|아버지의 손 — 생존기", "av|피하기|화염의 정점 — 근접 체력 주의", "info|참고|공주 — 퀘스트 확인"}
B["Emperor Dagran Thaurissan"] = t
B["제왕 다그란 타우릿산"] = t
end
do local t = {"info|참고|도망 — 마지막 방에서 쫄과 함께"}
B["Pusillin"] = t
B["푸실린"] = t
end
do local t = {"dis|해제(저주)|무력화 저주 — 저주 해제", "int|끊기|어둠의 화살 — 끊기"}
B["Lethtendris"] = t
B["레스텐드리스"] = t
end
do local t = {"av|피하기|물보라 — 넉백 + 기절", "add|쫄|분열 — 광역"}
B["Hydrospawn"] = t
B["히드로스폰"] = t
end
do local t = {"dz|위험|희생 — 그 사람 집중 치유", "info|참고|강렬한 고통 — 탱커 피해"}
B["Zevrim Thornhoof"] = t
B["제브림 쏜후프"] = t
end
do local t = {"dz|위험|변신 단계 — 변신마다 대처", "dis|해제(마법)|시들기 — 마법 해제"}
B["Alzzin the Wildshaper"] = t
B["칼날바람 알진"] = t
end
do local t = {"tk|탱커|뿌리 휘감기 — 탱커 묶임", "av|피하기|짓밟기 — 근처 피해"}
B["Tendris Warpwood"] = t
B["굽이나무 텐드리스"] = t
end
do local t = {"info|참고|일제 사격 — 흩어지기", "add|쫄|페롤 — 따로 탱킹"}
B["Illyanna Ravenoak"] = t
B["일샨나 레이븐오크"] = t
end
do local t = {"dz|위험|정신 지배 — 묶거나 해제", "int|끊기|정신 분열 — 끊기"}
B["Magister Kalendris"] = t
B["마술사 칼렌드리스"] = t
end
do local t = {"info|참고|은신 — 미리 찾기"}
B["Tsu'zee"] = t
B["츄지"] = t
end
do local t = {"dz|위험|눈의 소환 — 원거리가 바로 잡기", "tk|탱커|난타 — 큰 피해"}
B["Immol'thar"] = t
B["이몰타르"] = t
end
do local t = {"info|참고|소환 보스 — 일행 준비 후 소환"}
B["Lord Hel'nurath"] = t
B["군주 헬누라스"] = t
end
do local t = {"dz|위험|소용돌이 — 빠지기", "info|참고|마법 차단 — 원거리는 거리 두기"}
B["Prince Tortheldrin"] = t
B["왕자 토르텔드린"] = t
end
do local t = {"tk|탱커|강타 — 큰 피해"}
B["Guard Mol'dar"] = t
B["경비병 몰다르"] = t
end
do local t = {"av|피하기|소용돌이 — 빠지기"}
B["Stomper Kreeg"] = t
B["천둥발 크리그"] = t
end
do local t = {"tk|탱커|강타 — 큰 피해"}
B["Guard Fengus"] = t
B["경비병 펜구스"] = t
end
do local t = {"info|참고|공물 경로 — 조공 경로로 가면 싸우지 않아도 돼요"}
B["Guard Slip'kik"] = t
B["경비병 슬립킥"] = t
end
do local t = {"add|쫄|원군 — 정리", "info|참고|공포 — 공포"}
B["Captain Kromcrush"] = t
B["대장 크롬크러쉬"] = t
end
do local t = {"dz|위험|전쟁 발구르기 — 흩어지기", "tk|탱커|박살 — 탱커 치유 집중", "add|쫄|촐루크 — 끊기·따로 잡기"}
B["King Gordok"] = t
B["왕 고르독"] = t
end
do local t = {"tk|탱커|밀쳐내기 — 다시 도발", "tk|탱커|가르기 — 일행 반대로"}
B["Highlord Omokk"] = t
B["대군주 오모크"] = t
end
do local t = {"dis|해제(저주)|주술 — 저주 해제", "dis|해제(저주)|피의 저주 — 저주 해제"}
B["Shadow Hunter Vosh'gajin"] = t
B["어둠사냥꾼 보쉬가진"] = t
end
do local t = {"av|피하기|도끼 던지기 — 흩어지기", "tk|탱커|박살 — 치유 감소"}
B["War Master Voone"] = t
B["대장군 부네"] = t
end
do local t = {"dis|해제(독)|어미의 젖 — 독 해제", "add|쫄|새끼 거미 — 광역"}
B["Mother Smolderweb"] = t
B["여왕 불그물거미"] = t
end
do local t = {"add|쫄|오우거 무리 — 탱커가 모으기"}
B["Urok Doomhowl"] = t
B["우로크 둠하울"] = t
end
do local t = {"int|끊기|치유 물약 — 끊기", "av|피하기|폭탄 — 흩어지기"}
B["Quartermaster Zigris"] = t
B["병참장교 지그리스"] = t
end
do local t = {"tk|탱커|찢기 — 출혈"}
B["Halycon"] = t
B["할리콘"] = t
end
do local t = {"dz|위험|광란 — 사냥꾼 평정의 사격, 치유 집중"}
B["Gizrul the Slavener"] = t
B["흉포한 기즈룰"] = t
end
do local t = {"add|쫄|원군 — 정리", "av|피하기|가르기 — 정면 피하기"}
B["Overlord Wyrmthalak"] = t
B["대군주 웜타라크"] = t
end
do local t = {"add|쫄|흑요석 수도사 — 먼저 쫄을 잡아야 보스가 깨어나요", "av|피하기|불꽃 회오리 — 근접 체력 주의"}
B["Pyroguard Emberseer"] = t
B["불의수호자 엠버시어"] = t
end
do local t = {"add|쫄|투기장 무리 — 탱커 모으기", "dz|위험|자이스의 숨결 — 정면 피하기"}
B["Warchief Rend Blackhand"] = t
B["대족장 렌드 블랙핸드"] = t
end
do local t = {"dz|위험|불꽃 돌진 — 벽 등지기", "info|참고|공포 — 공포"}
B["The Beast"] = t
B["괴수"] = t
end
do local t = {"info|참고|소환 보스 — 일행 준비 후 소환"}
B["Lord Valthalak"] = t
B["군주 발타라크"] = t
end
do local t = {"dz|위험|화염 지옥 — 바로 나오기", "tk|탱커|가르기 — 일행 반대로", "add|쫄|근위병 — 따로 탱킹"}
B["General Drakkisath"] = t
B["사령관 드라키사스"] = t
end
do local t = {"dis|해제(저주)|언어의 저주 — 저주 해제", "info|참고|변신 — 박쥐/사람으로 바뀌어요"}
B["Kirtonos the Herald"] = t
B["사자 키르토노스"] = t
end
do local t = {"add|쫄|환영 — 광역", "dis|해제(저주)|무력화 저주 — 저주 해제"}
B["Jandice Barov"] = t
B["잔다이스 바로브"] = t
end
do local t = {"tk|탱커|강타 — 큰 피해", "av|피하기|밀쳐내기 — 벽 등지기"}
B["Rattlegore"] = t
B["들창어금니"] = t
end
do local t = {"info|참고|그림자 보호 — 보호막"}
B["Marduk Blackpool"] = t
B["마르두크 블랙풀"] = t
end
do local t = {"dz|위험|얼음 회오리 — 원거리 떨어져서", "dis|해제(마법)|냉기 화살 — 느려짐 해제"}
B["Ras Frostwhisper"] = t
B["라스 프로스트위스퍼"] = t
end
do local t = {"add|쫄|해골 소환 — 광역"}
B["Kormok"] = t
B["코르모크"] = t
end
do local t = {"int|끊기|치유 — 끊기"}
B["Instructor Malicia"] = t
B["조교 말리시아"] = t
end
do local t = {"dz|위험|광란 — 생존기"}
B["Doctor Theolen Krastinov"] = t
B["학자 테올렌 크라스티노브"] = t
end
do local t = {"dis|해제(질병)|질병 — 질병 해제"}
B["Lorekeeper Polkelt"] = t
B["현자 폴켈트"] = t
end
do local t = {"av|피하기|짓밟기 — 근처 피해", "tk|탱커|가르기 — 일행 반대로"}
B["The Ravenian"] = t
B["라베니안"] = t
end
do local t = {"dz|위험|정신 지배 — 묶기", "info|참고|공포 — 공포"}
B["Lady Illucia Barov"] = t
B["여군주 일루시아 바로브"] = t
end
do local t = {"info|참고|부정의 오라 — 근접 체력 주의", "dis|해제(저주)|그림자의 장막 — 저주 해제"}
B["Lord Alexei Barov"] = t
B["군주 알렉세이 바로브"] = t
end
do local t = {"dz|위험|그림자 이동 — 갇힌 사람은 방 쫄 정리 후 나오기", "info|참고|저주 — 저주 해제"}
B["Darkmaster Gandling"] = t
B["암흑스승 간들링"] = t
end
do local t = {"info|참고|희귀 — 탱킹"}
B["Stonespine"] = t
B["뾰족바위"] = t
end
do local t = {"dis|해제(독)|독 — 독 해제", "add|쫄|거미 — 광역"}
B["Nerub'enkan"] = t
B["네룹엔칸"] = t
end
do local t = {"tk|탱커|가르기 — 일행 반대로"}
B["Black Guard Swordsmith"] = t
B["검은호위대 검제작자"] = t
end
do local t = {"dz|위험|빙의 — 그 사람을 묶거나 체력 깎아 내보내기", "info|참고|침묵 — 침묵"}
B["Baroness Anastari"] = t
B["남작부인 아나스타리"] = t
end
do local t = {"int|끊기|얼음 화살 — 끊기", "info|참고|얼음 무덤 — 그 사람 치유"}
B["Maleki the Pallid"] = t
B["냉혈한 말레키"] = t
end
do local t = {"tk|탱커|난타 — 넉백"}
B["Magistrate Barthilas"] = t
B["집정관 발실라스"] = t
end
do local t = {"dz|위험|짓밟기 — 탱커 외 떨어지기", "add|쫄|해골 무리 — 쉬지 말고 대비"}
B["Ramstein the Gorger"] = t
B["먹보 람스타인"] = t
end
do local t = {"dz|위험|죽음의 고리 — 해골 바로 잡기", "tk|탱커|가르기 — 일행 반대로", "info|참고|그림자 화살 — 큰 피해"}
B["Baron Rivendare"] = t
B["남작 리븐데어"] = t
end
do local t = {"info|참고|희귀 — 그냥 잡기"}
B["Skul"] = t
B["스컬"] = t
end
do local t = {"dis|해제(저주)|무력화 저주 — 저주 해제"}
B["Postmaster Malown"] = t
B["우체국장 말로운"] = t
end
do local t = {"info|참고|희귀 — 그냥 잡기"}
B["Hearthsinger Forresten"] = t
B["하스싱어 포레스턴"] = t
end
do local t = {"info|참고|희귀 — 그냥 잡기"}
B["The Unforgiven"] = t
B["용서받지 못한 자"] = t
end
do local t = {"tk|탱커|난타 — 큰 피해", "add|쫄|주변 몹 — 마당 몹을 다 잡아야 나와요"}
B["Timmy the Cruel"] = t
B["잔혹한 티미"] = t
end
do local t = {"info|참고|퀘스트 보스 — 방 상자를 열면 나와요"}
B["Malor the Zealous"] = t
B["광신자 말로"] = t
end
do local t = {"info|참고|부르는 보스 — 대장장이 도안 퀘스트로 불러요"}
B["Crimson Hammersmith"] = t
B["진홍십자군 대장장이"] = t
end
do local t = {"add|쫄|저격수 소환 — 빨리 잡기", "tk|탱커|박살 — 넉백"}
B["Cannon Master Willey"] = t
B["포병대장 윌리"] = t
end
do local t = {"av|피하기|불꽃 회오리 — 근처 피해"}
B["Archivist Galford"] = t
B["기록관 갈포드"] = t
end
do local t = {"dz|위험|정신 지배 — 묶거나 체력 깎기", "hl|치유|정신 분열 — 치유", "info|참고|변신 — 체력 낮으면 악마로 변해요"}
B["Balnazzar"] = t
B["발나자르"] = t
end
