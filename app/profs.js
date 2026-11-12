/* 전문기술 1~300 빠른 레벨링 (제작: metabot.gg 포에버 루트 / 채집: timesaver.gg 포에버 얼라이언스 지역) */
const PROF_RANK=[['수습',1,75,'레벨 5'],['숙련',75,150,'레벨 10 · 기술 50부터 배우기'],['전문',150,225,'레벨 20 · 기술 125부터 배우기'],['장인',225,300,'레벨 35 · 기술 200부터 배우기']];
const PROFS=[
 {id:'alch',ko:'연금술',en:'Alchemy',k:'c',pair:'약초채집',src:'https://metabot.gg/en/wow-forever/professions/alchemy',steps:[
  [1,5,'Minor Arcane Elixir',4,'Peacebloom 1, Empty Vial 1',''],[5,22,'Mana Well',18,'Peacebloom 1, Empty Vial 1','포에버 신규'],[22,65,'Elixir of Minor Defense',45,'Silverleaf 1, Peacebloom 1, Empty Vial 1',''],
  [65,96,'Blackmouth Oil',46,'Oily Blackmouth 2, Empty Vial 1','낚시 재료'],[96,104,'Lesser Discolored Healing Potion',13,'Briarthorn 1, Murloc Eye 1, Empty Vial 1','포에버 신규'],[104,105,'Elixir of Giant Growth',1,'Deviate Fish 1, Earthroot 1, Empty Vial 1','도안 아이템'],
  [105,115,'Elixir of Wisdom',10,'Mageroyal 1, Briarthorn 2, Empty Vial 1',''],[115,135,'Swim Speed Potion',21,'Swiftthistle 1, Blackmouth Oil 1, Empty Vial 1',''],
  [135,167,'Fire Oil',51,'Firefin Snapper 2, Empty Vial 1','한 번에 2개'],[167,200,'Greater Discolored Healing Potion',47,'Kingsblood 1, Murloc Eye 1, Leaded Vial 1',''],
  [200,208,'절연 니오다인 (Insulating Gniodine)',10,'Crate of Tainted Gniodine Solution 5, Leaded Vial 1','도안 아이템'],[208,235,'Elixir of Defense',35,'Wild Steelbloom 1, Goldthorn 1, Leaded Vial 1',''],
  [235,260,'Stonescale Oil',45,'Stonescale Eel 1, Leaded Vial 1','한 번에 2개'],[260,267,'Elixir of Greater Agility',9,'Sungrass 1, Goldthorn 1, Crystal Vial 1',''],
  [267,289,'Draught of Detect Demon',28,'Gromsblood 2, Crystal Vial 1','275~280은 Essence of Fire'],[289,300,'Greater Arcane Protection Potion',11,'Dream Dust 1, Dreamfoil 1, Crystal Vial 1','도안 아이템']]},
 {id:'bs',ko:'대장기술',en:'Blacksmithing',k:'c',pair:'채광',src:'https://metabot.gg/en/wow-forever/professions/blacksmithing',steps:[
  [1,36,'Rough Sharpening Stone',44,'Rough Stone 1',''],[36,83,'Rough Grinding Stone',121,'Rough Stone 2',''],[83,111,'Heavy Weightstone',36,'Heavy Stone 1',''],[111,127,'Iron Buckle',17,'Iron Bar 1',''],
  [127,137,'Patterned Bronze Bracers',13,'Bronze Bar 5, Coarse Grinding Stone 2',''],[137,145,'Silvered Bronze Boots',10,'Bronze Bar 6, Silver Bar 1, Coarse Grinding Stone 2',''],[145,154,'Silvered Bronze Gauntlets',14,'Bronze Bar 8, Silver Bar 1, Coarse Grinding Stone 2',''],
  [154,155,'Bronze Warhammer',1,'Bronze Bar 8, Strong Flux 1, Medium Leather 1',''],[155,183,'Solid Sharpening Stone',35,'Solid Stone 1',''],[183,198,'Golden Scale Bracers',20,'Steel Bar 5, Heavy Grinding Stone 2',''],
  [198,210,'Steel Plate Helm',12,'Steel Bar 14, Solid Grinding Stone 1',''],[210,235,'Dense Weightstone',32,'Dense Stone 1',''],[235,256,'Arcanite Skeleton Key',24,'Arcanite Bar 1, Dense Grinding Stone 1',''],
  [256,288,'Dark Iron Shoulders',40,'Dark Iron Bar 6, Heart of Fire 1','도안 아이템'],[288,295,'Dark Iron Bracers',8,'Dark Iron Bar 4, Fiery Core 2, Lava Core 2','도안 아이템'],[295,300,'흑요석 연마석 (Obsidian Grinding Stone)',5,'Small Obsidian Shard 5','도안 아이템']]},
 {id:'ench',ko:'마법부여',en:'Enchanting',k:'c',pair:'(분해로 재료 모음)',src:'https://metabot.gg/en/wow-forever/professions/enchanting',steps:[
  [1,25,'Enchant Bracer - Inferior Stamina',31,'Mote of Magic 1','포에버 신규 재료'],[25,50,'Enchant Bracer - Minor Deflect',25,'Lesser Magic Essence 1',''],[50,71,'Enchant Chest - Inferior Stamina',21,'Strange Dust 1',''],
  [71,110,'Enchant Chest - Minor Absorption',47,'Lesser Magic Essence 1',''],[110,120,'Enchant Cloak - Minor Agility',10,'Lesser Astral Essence 1','도안 아이템'],[120,135,'Enchant Bracer - Lesser Spirit',15,'Lesser Astral Essence 1','도안 아이템'],
  [135,156,'Enchant Bracer - Lesser Stamina',21,'Soul Dust 1',''],[156,171,'Enchant Chest - Intellect',15,'Greater Astral Essence 1',''],[171,186,'Bracer Lesser Intellect → Boots Lesser Agility → Bracer Spirit',15,'Greater Astral Essence / Soul Dust / Lesser Mystic Essence','각 5번씩'],
  [186,201,'Enchant Bracer - Strength',15,'Vision Dust 1',''],[201,206,'Enchant Chest - Greater Intellect',5,'Lesser Mystic Essence 1',''],[206,226,'Enchant Cloak - Greater Defense',20,'Vision Dust 1',''],
  [226,231,'Enchant Gloves - Agility',5,'Vision Dust 1',''],[231,251,'Enchant Chest - Superior Intellect',20,'Greater Nether Essence 1',''],[251,286,'Enchant Boots - Agility',62,'Greater Nether Essence 1',''],
  [286,290,'Enchant Weapon - Greater Striking',10,'Large Radiant Shard 1, Greater Nether Essence 1',''],[290,300,'Enchanted Sigil: Flowing Waters',10,'Illusion Dust 1','도안 아이템']]},
 {id:'eng',ko:'기계공학',en:'Engineering',k:'c',pair:'채광',src:'https://metabot.gg/en/wow-forever/professions/engineering',steps:[
  [1,38,'Rough Blasting Powder',61,'Rough Stone 1',''],[38,40,'Crafted Light Shot',3,'Rough Blasting Powder 1, Copper Bar 1',''],[40,57,'Handful of Copper Bolts',28,'Copper Bar 1',''],[57,68,'Rough Copper Bomb',13,'Copper Bar 1, Copper Bolts 1, Rough Blasting Powder 2, Linen Cloth 1',''],
  [68,75,'Arclight Spanner',8,'Copper Bar 6',''],[75,80,'Copper Tube',5,'Copper Bar 2, Weak Flux 1',''],[80,93,'Coarse Blasting Powder',20,'Coarse Stone 1',''],[93,107,'Coarse Dynamite → Copper Modulator',18,'Coarse Blasting Powder 3 / Copper Bolts 2, Copper Bar 1, Linen Cloth 2',''],
  [107,120,'Silver Contact → Practice Lock',14,'Silver Bar 1 / Bronze Bar 1, Copper Bolts 2, Weak Flux 1',''],[120,139,'Heavy Blasting Powder',28,'Heavy Stone 1',''],[139,145,'Whirring Bronze Gizmo → Bronze Framework',7,'Bronze Bar 2, Wool Cloth 1 (+Medium Leather)',''],
  [145,160,'Aquadynamic Fish Attractor',19,'Bronze Bar 2, Nightcrawlers 1, Coarse Blasting Powder 1',''],[160,170,'Bronze Framework',17,'Bronze Bar 2, Medium Leather 1, Wool Cloth 1',''],[170,181,'Solid Blasting Powder',12,'Solid Stone 2',''],
  [181,200,'Gyromatic Micro-Adjustor',32,'Steel Bar 4',''],[200,205,'Recipe: Goblin Rocket Fuel',5,'Blank Parchment 1, Engineer\'s Ink 1',''],[205,240,'Hi-Impact Mithril Slugs',59,'Mithril Bar 1, Solid Blasting Powder 1',''],
  [240,275,'Mithril Gyro-Shot (245~258은 강도 높은 화약)',64,'Mithril Bar 2, Solid Blasting Powder 2',''],[275,285,'Large Blue Rocket Cluster → Thorium Widget',15,'Dense Blasting Powder, Rugged Leather / Thorium Bar 3, Runecloth 1','도안 아이템'],[285,300,'Thorium Shells',15,'Thorium Bar 2, Dense Blasting Powder 1','도안 아이템']]},
 {id:'lw',ko:'가죽세공',en:'Leatherworking',k:'c',pair:'무두질',src:'https://metabot.gg/en/wow-forever/professions/leatherworking',steps:[
  [1,52,'Light Armor Kit',68,'Light Leather 1',''],[52,85,'Embossed Leather Gloves',39,'Light Leather 3, Coarse Thread 2',''],[85,105,'Fine Leather Belt',32,'Light Leather 6, Coarse Thread 2',''],[105,115,'Heavy Leather',10,'Medium Leather 5',''],
  [115,142,'Cured Heavy Hide',31,'Heavy Hide 1, Salt 3',''],[142,153,'Heavy Armor Kit → Hillman\'s Leather Gloves',14,'Heavy Leather 5, Fine Thread 1 / Medium Leather 14, Fine Thread 4',''],[153,155,'Green Leather Belt',2,'Cured Heavy Hide, Heavy Leather 5, Green Dye, Iron Buckle',''],
  [155,175,'Cured Thick Hide',20,'Thick Hide 1, Deeprock Salt 1',''],[175,194,'Thick Leather → Guardian Gloves',22,'Heavy Leather 6 / Heavy Leather 4, Cured Heavy Hide 1, Silken Thread 1',''],[194,200,'Thick Armor Kit → Nightscape Headband',7,'Thick Leather 5, Silken Thread',''],
  [200,205,'Faintly Glowing Leather',6,'Cured Thick Hide 1, Irradiated Leather Scraps 5','도안 아이템'],[205,233,'Cured Rugged Hide → Rugged Armor Kit',32,'Rugged Hide 1, Refined Deeprock Salt 1 / Rugged Leather 5',''],
  [233,246,'Turtle Scale Breastplate',28,'Thick Leather 6, Turtle Scale 12, Heavy Silken Thread 1',''],[246,265,'Volcanic Leggings → 붉은십자군 잠입자의 손목보호구 (Scarlet Infiltrator\'s Bracers)',20,'Rugged Leather 6~8 등','도안 아이템'],
  [265,291,'Gordok Ogre Suit',29,'Rugged Leather 4, Bolt of Runecloth 2, Ogre Tannin 1, Rune Thread 1',''],[291,300,'명품 화산 다리보호구 → 명품 화산 흉갑 (Masterwork Volcanic)',10,'Rugged Leather 6~8, Essence of Fire, Core/Essence of Earth','도안 아이템']]},
 {id:'tail',ko:'재봉술',en:'Tailoring',k:'c',pair:'(옷감은 몹에게서)',src:'https://metabot.gg/en/wow-forever/professions/tailoring',steps:[
  [1,34,'Bolt of Linen Cloth',35,'Linen Cloth 2',''],[34,46,'Brown Linen Vest',12,'Bolt of Linen Cloth 1, Coarse Thread 1',''],[46,74,'Linen Belt',44,'Bolt of Linen Cloth 1, Coarse Thread 1',''],
  [74,103,'Woolen Cape',43,'Bolt of Woolen Cloth 1, Fine Thread 1',''],[103,124,'Double-Stitched Woolen Shoulders',25,'Bolt of Woolen Cloth 3, Fine Thread 2',''],[124,142,'Gloves of Meditation',26,'Bolt of Woolen Cloth 4, Fine Thread 3, Elixir of Wisdom 1',''],
  [142,152,'Bolt of Mageweave → Red Swashbuckler\'s Shirt',12,'Mageweave Cloth 5 / Bolt of Silk Cloth 3, Red Dye 2, Silken Thread 1',''],[152,170,'Earthen Vest → Crimson Silk Vest',19,'Bolt of Silk Cloth 3~4, Elemental Earth / Red Dye 2, Fine Thread 2',''],
  [170,187,'Orange Mageweave Shirt',18,'Bolt of Mageweave 1, Orange Dye 1, Heavy Silken Thread 1',''],[187,195,'Earthen Vest',9,'Bolt of Silk Cloth 3, Elemental Earth 1, Fine Thread 2',''],[195,212,'Bolt of Runecloth',18,'Runecloth 5',''],
  [212,243,'Black Mageweave Vest',51,'Bolt of Mageweave 2, Silken Thread 3',''],[243,270,'Mooncloth',27,'Felcloth 2','도안 아이템'],[270,294,'Gordok Ogre Suit',35,'Bolt of Runecloth 2, Rugged Leather 4, Ogre Tannin 1, Rune Thread 1',''],[294,300,'Mooncloth Boots',10,'Bolt of Runecloth 6, Mooncloth 4, Black Pearl 2, Rune Thread 1','']]},
 {id:'cook',ko:'요리',en:'Cooking',k:'s',src:'https://metabot.gg/en/wow-forever/professions/cooking',steps:[
  [1,71,'Roasted Boar Meat',86,'Chunk of Boar Meat 1',''],[71,90,'Coyote Steak',19,'Coyote Meat 1',''],[90,170,'Dig Rat Stew',212,'Dig Rat 1','도안 아이템'],[170,185,'Goblin Deviled Clams → Rockscale Cod',22,'Tangy Clam Meat 1, Hot Spices 1',''],
  [185,215,'Plain Ol\' Paletusk',36,'Chunk of Boar Meat 2, Mild Spices 1','도안 아이템'],[215,225,'Mithril Head Trout',12,'Raw Mithril Head Trout 1','도안 아이템'],[225,290,'Spotted Yellowtail',79,'Raw Spotted Yellowtail 1','도안 아이템'],
  [290,300,'Poached Sunscale Salmon → Runn Tum Tuber Surprise',11,'Raw Sunscale Salmon / Runn Tum Tuber, Soothing Spices','도안 아이템']]},
 {id:'fa',ko:'응급치료',en:'First Aid',k:'s',src:'https://metabot.gg/en/wow-forever/professions/first-aid',steps:[
  [1,40,'Linen Bandage',41,'Linen Cloth 1',''],[40,75,'Minor Healing Potion',43,'Empty Vial 1, Mild Spices 1, Peacebloom 1','포에버: 응급치료가 물약도 만들어요'],[75,135,'Simple Poultice',87,'Spider Ichor 1, Mild Spices 1, Bottle of Dalaran Noir 1','포에버 신규'],
  [135,150,'Healing Potion',19,'Leaded Vial 1, Hot Spices 1, Bruiseweed 1',''],[150,158,'Heavy Wool Bandage',18,'Wool Cloth 2',''],[158,195,'Silk Bandage',74,'Silk Cloth 1',''],[195,210,'Clever Poultice',54,'Murloc Fin 1, Soothing Spices 1, Thunder Ale 1','도안 아이템'],
  [210,225,'Mageweave Bandage',18,'Mageweave Cloth 1','도안 아이템'],[225,245,'Heavy Mageweave Bandage',21,'Mageweave Cloth 2',''],[245,291,'Runecloth Bandage',59,'Runecloth 1',''],[291,300,'Heavy Runecloth Bandage',10,'Runecloth 2','']]},
 {id:'mine',ko:'채광',en:'Mining',k:'g',src:'https://timesaver.gg/tools/wow-forever/professions/mining',gather:[
  [1,'구리 광맥','서부 몰락지대, 그늘숲, 모단 호수'],[65,'주석 광맥','저습지, 그늘숲, 모단 호수'],[75,'은 광맥','아라시 고원, 알터랙 산맥, 가시덤불 골짜기'],[125,'철 광맥','아라시 고원, 알터랙 산맥, 가시덤불 골짜기'],
  [155,'금 광맥','아라시 고원, 알터랙 산맥, 가시덤불 골짜기'],[175,'미스릴 광맥','황야의 땅, 동부 내륙지, 알터랙 산맥'],[230,'진은 광맥 / 검은무쇠 광맥','황야의 땅, 동부 내륙지 / 이글거리는 협곡'],[245,'작은 토륨 광맥','여명의 설원, 슬픔의 늪, 저주받은 땅'],[275,'풍부한 토륨 광맥','여명의 설원, 아즈샤라']],
  tips:['훈련비만 들어요(모두 5골 55실버). 캐면서 올리는 전문기술이에요.','포에버 신규 캠프: 20 Lodestone(근접 전투력 버프), 140 Rock Garden, 300 Molten Foundry','제련(Copper Bar 1~66, Bronze 66~100, Silver 100~125)도 기술이 올라요(metabot)']},
 {id:'herb',ko:'약초채집',en:'Herbalism',k:'g',src:'https://timesaver.gg/tools/wow-forever/professions/herbalism',gather:[
  [1,'평화꽃 · 은엽수','던 모로, 엘윈 숲, 모단 호수, 어둠해안'],[15,'뱀뿌리','던 모로, 엘윈 숲, 붉은마루 산맥'],[50,'마법초 · 쇠풀','잿빛 골짜기, 어둠해안, 서부 몰락지대'],[70,'찔레가시','그늘숲, 잿빛 골짜기, 서부 몰락지대'],
  [85,'갈래물풀','가시덤불 골짜기, 저습지, 잿빛 골짜기'],[100,'생채기풀','돌발톱 산맥, 힐스브래드 구릉지, 저습지'],[115,'야생 철쭉 · 무덤이끼','아라시 고원, 가시덤불 골짜기, 그늘숲, 저습지'],[125,'왕꽃잎풀','가시덤불 골짜기, 저습지, 잿빛 골짜기'],
  [150,'생명의 뿌리','가시덤불 골짜기, 저습지, 아라시 고원'],[160,'흐린 나뭇잎','아라시 고원, 슬픔의 늪, 알터랙 산맥'],[170,'황금가시','가시덤불 골짜기, 아라시 고원, 슬픔의 늪'],[185,'카드가의 수염','가시덤불 골짜기, 아라시 고원, 슬픔의 늪'],
  [205,'화염꽃','타나리스, 이글거리는 협곡, 황야의 땅'],[210,'보라 연꽃','아즈샤라, 동부 내륙지, 타나리스'],[230,'태양풀','아즈샤라, 동부 내륙지, 페랄라스'],[250,'그롬의 피 · 유령버섯','악령의 숲, 잊혀진 땅, 동부 내륙지'],
  [260,'황금 산삼 · 꿈풀','운고로 분화구, 아즈샤라, 동부 역병지대'],[280,'은초롱이끼 · 얼음송이','여명의 설원, 운고로 분화구']],
  tips:['훈련비만 들어요. 75까지는 엘윈 숲·던 모로·텔드랏실, 300까지는 붉은마루 산맥·모단 호수·먼지진흙 습지대 훈련사','포에버 신규 캠프: 20 Incense Candle(지능 버프), 140 Greenhouse(씨앗으로 약초 재배), 300 Seed Hybridizer','약초 이름은 한글 클라이언트 표기와 조금 다를 수 있어요']},
 {id:'skin',ko:'무두질',en:'Skinning',k:'g',src:'https://timesaver.gg/tools/wow-forever/professions/skinning',gather:[
  [1,'몹 1~10레벨: 가벼운 가죽','던 모로, 엘윈 숲, 텔드랏실'],[50,'몹 11~20레벨: 가벼운·중간 가죽','어둠해안, 모단 호수, 잿빛 골짜기'],[100,'몹 21~30레벨: 중간·질긴 가죽','저습지, 잿빛 골짜기, 힐스브래드 구릉지'],
  [150,'몹 31~40레벨: 질긴·두꺼운 가죽, 거북 비늘','먼지진흙 습지대, 잊혀진 땅, 가시덤불 골짜기'],[200,'몹 41~50레벨: 두꺼운·튼튼한 가죽','타나리스, 페랄라스, 동부 내륙지'],[250,'몹 51~60레벨: 튼튼한 가죽','여명의 설원, 아즈샤라, 실리더스']],
  tips:['레벨업하면서 잡은 짐승을 계속 벗기면 저절로 올라요. 기술 100까지는 (기술÷10+10)레벨, 그 뒤로는 (기술÷5)레벨 몹까지 벗길 수 있어요(클래식 규칙)','포에버 신규 캠프: 20 Camp Chair(치명타 버프), 140 Field Guide, 300 Trapper\'s Workbench']},
 {id:'fish',ko:'낚시',en:'Fishing',k:'s',src:'https://timesaver.gg/tools/wow-forever/professions/fishing',gather:[
  [1,'시작 지역 (25부터 안 놓침)','던 모로, 엘윈 숲, 텔드랏실'],[75,'저레벨 지역','모단 호수, 어둠해안, 서부 몰락지대, 아이언포지, 스톰윈드'],[150,'중간 지역','잿빛 골짜기, 그늘숲, 힐스브래드 구릉지, 붉은마루 산맥, 저습지'],
  [225,'중상 지역','아라시 고원, 먼지진흙 습지대, 가시덤불 골짜기, 슬픔의 늪, 알터랙 산맥'],[300,'고레벨 지역','아즈샤라, 악령의 숲, 페랄라스, 타나리스, 동부 내륙지, 운고로 분화구']],
  tips:['미끼를 쓰면 빨라요: Shiny Bauble +25, Nightcrawlers +50, Aquadynamic Fish Attractor +100(기계공학)','낚싯대: Strong Fishing Pole +5, Big Iron Fishing Pole +20','포에버 신규: 140 Fishing Rack, 300 Fishing Hut (희귀 물고기)']}
];
const PROF_TIPS=['다음 단계는 상한보다 25 앞에서 배우세요: 기술 50에 숙련(레벨 10), 125에 전문(레벨 20), 200에 장인(레벨 35)','주황색 도안은 항상, 노란색은 대부분, 초록색은 가끔 기술이 올라요. 회색은 안 올라요','제작 횟수는 실패까지 포함한 대략적인 수예요. 재료를 먼저 다 모아 두면 한 번에 올릴 수 있어요','채집 전문기술은 레벨업하면서 같이 올리면 따로 시간 안 써요','metabot 제작 루트의 일부 도안 습득 기술은 사이트가 추정한 값이에요. 훈련사에 없으면 조금 뒤에 다시 가 보세요'];
