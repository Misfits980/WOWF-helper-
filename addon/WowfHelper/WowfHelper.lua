-- 와포 도우미 (WowfHelper) v3
-- 이 캐릭터 정보를 글자 코드로 만들어 줘요:
--   끝낸 퀘스트 · 지금 퀘스트 목록(+ 목표 진행도) · 끼고 있는 장비 · 전문기술 숙련도 · 특성 포인트 · 경험치
--   사냥 기록(시간당 경험치) · 가방·은행 아이템 · 골드 · 평판 · 이 컴퓨터의 부캐
-- 앱에서 만든 「추천 코드」를 /wfh 추천 으로 넣으면 아이템 툴팁에 앱 추천이 붙어요.
-- 보스를 대상으로 잡으면 앱의 보스 공략 요약이 작은 창으로 떠요. (/wfh 공략 으로 켜고 끄기)
-- 게임 안에서 /wfh 를 치면 창이 뜨고, Ctrl+C 로 복사해서 앱의
-- 「내 캐릭터 → 게임에서 불러오기」에 붙여 넣으면 돼요.
-- 인터넷으로 보내는 건 없어요. 게임 밖으로 나가는 건 직접 복사한 글자뿐이에요.
--
-- /wfh        코드 창 열기
-- /wfh 점검   (또는 /wfh test) 코드에 무엇이 몇 개 담겼는지 채팅창에 보여 주기
-- /wfh 추천   앱의 추천 코드 붙여 넣기 (아이템 툴팁에 표시)
-- /wfh 공략   보스 공략 창 켜기/끄기
-- /wfh 알림   레벨업·반납 알림과 접속 인사 켜기/끄기
-- /wfh 추천 지우기   넣어 둔 툴팁 추천 지우기
-- /wfh 설정   지금 켜고 끈 상태 보기

local B36 = "0123456789abcdefghijklmnopqrstuvwxyz"
local PRE = "|cffe8c06a[와포 도우미]|r "

local function b36(n)
  n = math.floor(tonumber(n) or 0)
  if n <= 0 then return "0" end
  local s = ""
  while n > 0 do
    local r = n % 36
    s = B36:sub(r + 1, r + 1) .. s
    n = math.floor(n / 36)
  end
  return s
end

local function say(msg) DEFAULT_CHAT_FRAME:AddMessage(PRE .. msg) end

-- 1) 끝낸 퀘스트 번호 (새 방식 → 옛 방식 순서로 시도)
local function completedIDs()
  local ids = {}
  if C_QuestLog and C_QuestLog.GetAllCompletedQuestIDs then
    local ok, list = pcall(C_QuestLog.GetAllCompletedQuestIDs)
    if ok and type(list) == "table" then
      for _, id in ipairs(list) do ids[#ids + 1] = id end
    end
  end
  if #ids == 0 and GetQuestsCompleted then
    local t = {}
    local ok = pcall(GetQuestsCompleted, t)
    if ok then
      if next(t) == nil then
        local ok2, r = pcall(GetQuestsCompleted)
        if ok2 and type(r) == "table" then t = r end
      end
      for id in pairs(t) do ids[#ids + 1] = id end
    end
  end
  table.sort(ids)
  return ids
end

-- 목표 진행도 "3/8" → {3, 8}
local function objFromText(text)
  local a, b = tostring(text or ""):match("(%d+)%s*/%s*(%d+)")
  if a then return tonumber(a), tonumber(b) end
  return nil
end

local function objectivesByID(questID)
  local out = {}
  if C_QuestLog and C_QuestLog.GetQuestObjectives then
    local ok, objs = pcall(C_QuestLog.GetQuestObjectives, questID)
    if ok and type(objs) == "table" then
      for _, o in ipairs(objs) do
        local have, need = o.numFulfilled, o.numRequired
        if not need or need == 0 then have, need = objFromText(o.text) end
        if need and need > 0 then out[#out + 1] = { have or 0, need }
        elseif o.finished ~= nil then out[#out + 1] = { o.finished and 1 or 0, 1 } end
      end
    end
  end
  return out
end

local function objectivesByIndex(logIndex)
  local out = {}
  if GetNumQuestLeaderBoards and GetQuestLogLeaderBoard then
    local n = GetNumQuestLeaderBoards(logIndex) or 0
    for j = 1, n do
      local text, _, finished = GetQuestLogLeaderBoard(j, logIndex)
      local have, need = objFromText(text)
      if need then out[#out + 1] = { have, need }
      else out[#out + 1] = { finished and 1 or 0, 1 } end
    end
  end
  return out
end

-- 2) 지금 퀘스트 목록: 번호 · 다 했는지 · 목표 진행도
local function questLog()
  local out = {}
  if C_QuestLog and C_QuestLog.GetNumQuestLogEntries and C_QuestLog.GetInfo then
    local n = C_QuestLog.GetNumQuestLogEntries()
    for i = 1, n do
      local info = C_QuestLog.GetInfo(i)
      if info and not info.isHeader and info.questID and info.questID > 0 then
        local done = C_QuestLog.IsComplete and C_QuestLog.IsComplete(info.questID)
        local objs = objectivesByID(info.questID)
        if #objs == 0 then objs = objectivesByIndex(i) end
        out[#out + 1] = { info.questID, done and true or false, objs }
      end
    end
  elseif GetNumQuestLogEntries and GetQuestLogTitle then
    local n = GetNumQuestLogEntries()
    for i = 1, n do
      local _, _, _, isHeader, _, isComplete, _, questID = GetQuestLogTitle(i)
      if not isHeader and questID and questID > 0 then
        out[#out + 1] = { questID, isComplete == 1 or isComplete == true, objectivesByIndex(i) }
      end
    end
  end
  return out
end

-- 3) 끼고 있는 장비 (슬롯 번호 → 아이템 번호). 셔츠(4)·휘장(19)은 빼요.
local function equipment()
  local out = {}
  if not GetInventoryItemID then return out end
  for slot = 1, 18 do
    if slot ~= 4 then
      local ok, id = pcall(GetInventoryItemID, "player", slot)
      if ok and id and id > 0 then out[#out + 1] = { slot, id } end
    end
  end
  return out
end

-- 4) 전문기술 숙련도 (한국어·영어 게임 모두)
local PROF = {
  ["연금술"] = "연금술", ["대장기술"] = "대장기술", ["마법부여"] = "마법부여", ["기계공학"] = "기계공학",
  ["가죽세공"] = "가죽세공", ["재봉술"] = "재봉술", ["약초채집"] = "약초채집", ["채광"] = "채광",
  ["무두질"] = "무두질", ["요리"] = "요리", ["응급치료"] = "응급치료", ["낚시"] = "낚시",
  ["Alchemy"] = "연금술", ["Blacksmithing"] = "대장기술", ["Enchanting"] = "마법부여", ["Engineering"] = "기계공학",
  ["Leatherworking"] = "가죽세공", ["Tailoring"] = "재봉술", ["Herbalism"] = "약초채집", ["Mining"] = "채광",
  ["Skinning"] = "무두질", ["Cooking"] = "요리", ["First Aid"] = "응급치료", ["Fishing"] = "낚시",
}
local function professions()
  local out = {}
  if not (GetNumSkillLines and GetSkillLineInfo) then return out end
  local n = GetNumSkillLines() or 0
  for i = 1, n do
    local name, isHeader, _, rank, _, _, maxRank = GetSkillLineInfo(i)
    if not isHeader and name and PROF[name] and rank then
      out[#out + 1] = { PROF[name], rank, maxRank or 0 }
    end
  end
  return out
end

-- 4-1) 무기 숙련: 「무기 기술」 칸 아래 이름-숙련도-최대 (포에버: 도적 한손 도끼 등 배운 것만 나와요)
local function weaponSkills()
  local out = {}
  if not (GetNumSkillLines and GetSkillLineInfo) then return out end
  local inW = false
  for i = 1, (GetNumSkillLines() or 0) do
    local name, isHeader, _, rank, _, _, maxRank = GetSkillLineInfo(i)
    if isHeader then
      inW = (name and (name:find("무기") or name:find("Weapon"))) and true or false
    elseif inW and name and rank then
      out[#out + 1] = { (name:gsub("[,:;%.]", "")), rank, maxRank or 0 }
    end
  end
  return out
end

-- 5) 특성 포인트 (특성 칸 순서대로)
local function talents()
  local out = {}
  if not (GetNumTalentTabs and GetTalentTabInfo) then return out end
  local n = GetNumTalentTabs() or 0
  for i = 1, n do
    local r = { GetTalentTabInfo(i) }
    local pts
    -- 클래식: 이름, 아이콘, 찍은 포인트, ... / 다른 버전: 번호, 이름, 설명, 아이콘, 찍은 포인트
    if type(r[3]) == "number" then pts = r[3] elseif type(r[5]) == "number" then pts = r[5] end
    out[#out + 1] = pts or 0
  end
  return out
end

-- 6) 사냥 기록: 이번 접속에서 얻은 경험치 · 시간 (+ 최근 접속 5번 합)
local sess = { xp = 0, t0 = 0, last = 0, lastMax = 0 }
local function xpTick()
  local cur, mx = UnitXP("player") or 0, UnitXPMax("player") or 0
  if sess.lastMax > 0 then
    if cur >= sess.last then sess.xp = sess.xp + (cur - sess.last)
    else sess.xp = sess.xp + (sess.lastMax - sess.last) + cur end
  end
  sess.last, sess.lastMax = cur, mx
end
local function sessNow()
  local secs = (time and time() or 0) - (sess.t0 or 0)
  local hx, hs = sess.xp, secs
  for _, h in ipairs((WowfHelperDB and WowfHelperDB.hist) or {}) do hx = hx + (h[1] or 0); hs = hs + (h[2] or 0) end
  return sess.xp, secs, hx, hs
end

-- 7) 가방 · 은행 (아이템 번호 → 개수)
local function bagSlots(bag)
  if C_Container and C_Container.GetContainerNumSlots then return C_Container.GetContainerNumSlots(bag) or 0 end
  if GetContainerNumSlots then return GetContainerNumSlots(bag) or 0 end
  return 0
end
local function bagItem(bag, slot)
  if C_Container and C_Container.GetContainerItemInfo then
    local info = C_Container.GetContainerItemInfo(bag, slot)
    if info then return info.itemID, info.stackCount end
    return nil
  end
  if GetContainerItemID and GetContainerItemInfo then
    local id = GetContainerItemID(bag, slot)
    local _, count = GetContainerItemInfo(bag, slot)
    return id, count
  end
end
local function scanBags(list)
  local t = {}
  for _, bag in ipairs(list) do
    for slot = 1, bagSlots(bag) do
      local id, n = bagItem(bag, slot)
      if id and id > 0 then t[id] = (t[id] or 0) + (n or 1) end
    end
  end
  return t
end
local function bagsNow() return scanBags({ 0, 1, 2, 3, 4 }) end
local function scanBank()
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.bank = scanBags({ -1, 5, 6, 7, 8, 9, 10 })
  WowfHelperDB.bankAt = time and time() or 0
end

-- 8) 평판 (번호 · 등급 · 값 · 이름)
local function reps()
  local out = {}
  if not (GetNumFactions and GetFactionInfo) then return out end
  for i = 1, GetNumFactions() or 0 do
    local name, _, standing, _, _, value, _, _, isHeader, _, hasRep, _, _, fid = GetFactionInfo(i)
    if name and (not isHeader or hasRep) and standing then
      local nm = name:gsub("[%s]", "_"):gsub("[;%.:,~%-%*]", "")
      out[#out + 1] = (fid or 0) .. "-" .. standing .. "-" .. (value or 0) .. "-" .. nm
    end
  end
  return out
end

-- 9) 이 컴퓨터의 부캐 (같은 서버, 접속할 때마다 기록)
local function rememberMe()
  WowfHelperAcc = WowfHelperAcc or {}
  local realm = GetRealmName and GetRealmName() or "?"
  WowfHelperAcc[realm] = WowfHelperAcc[realm] or {}
  local _, cls = UnitClass("player")
  local _, race = UnitRace("player")
  WowfHelperAcc[realm][UnitName("player") or "?"] = { cls = cls, lv = UnitLevel("player"), race = race, t = time and time() or 0 }
end
local function alts()
  local out = {}
  local realm = GetRealmName and GetRealmName() or "?"
  local me = UnitName("player")
  for name, a in pairs((WowfHelperAcc and WowfHelperAcc[realm]) or {}) do
    if name ~= me and a.cls then out[#out + 1] = name .. "-" .. a.cls .. "-" .. (a.lv or 1) .. "-" .. (a.race or "") end
  end
  return out
end

-- 코드 만들기
-- WFH2;이름;서버;직업;레벨;종족;진영;D:끝낸 퀘스트;L:퀘스트 목록;E:장비;P:전문기술;T:특성;X:경험치
local function makeCode()
  local name = UnitName("player") or ""
  local realm = GetRealmName and GetRealmName() or ""
  local _, cls = UnitClass("player")
  local _, race = UnitRace("player")
  local faction = UnitFactionGroup and UnitFactionGroup("player") or ""
  local lv = UnitLevel("player") or 0

  -- 끝낸 퀘스트: 작은 번호부터, 앞 번호와의 차이를 36진수로. 차이 1이 이어지면 ~개수 로 줄임
  local ids, parts, prev, ones = completedIDs(), {}, 0, 0
  local function flush()
    if ones == 1 then parts[#parts + 1] = "1" elseif ones > 1 then parts[#parts + 1] = "~" .. b36(ones) end
    ones = 0
  end
  for _, id in ipairs(ids) do
    local d = id - prev
    if d == 1 then ones = ones + 1 else flush(); parts[#parts + 1] = b36(d) end
    prev = id
  end
  flush()

  -- 퀘스트 목록: 번호[*다 함][:가진수-필요수,가진수-필요수]
  local log, nObj = {}, 0
  for _, q in ipairs(questLog()) do
    local s = b36(q[1]) .. (q[2] and "*" or "")
    if q[3] and #q[3] > 0 then
      local o = {}
      for _, x in ipairs(q[3]) do o[#o + 1] = (x[1] or 0) .. "-" .. (x[2] or 0); nObj = nObj + 1 end
      s = s .. ":" .. table.concat(o, ",")
    end
    log[#log + 1] = s
  end

  local eq = {}
  for _, e in ipairs(equipment()) do eq[#eq + 1] = e[1] .. "-" .. b36(e[2]) end
  local pf = {}
  for _, p in ipairs(professions()) do pf[#pf + 1] = p[1] .. "-" .. p[2] .. "-" .. p[3] end
  local ws = {}
  for _, w in ipairs(weaponSkills()) do ws[#ws + 1] = w[1] .. ":" .. w[2] .. ":" .. w[3] end
  local tl = talents()
  local xp, xpMax, rest = UnitXP and UnitXP("player") or 0, UnitXPMax and UnitXPMax("player") or 0, GetXPExhaustion and GetXPExhaustion() or 0

  local sx, ss, hx, hs = sessNow()
  local bag, nb = {}, 0
  for id, c in pairs(bagsNow()) do bag[#bag + 1] = b36(id) .. "-" .. c; nb = nb + 1 end
  local bank, nk = {}, 0
  for id, c in pairs((WowfHelperDB and WowfHelperDB.bank) or {}) do bank[#bank + 1] = b36(id) .. "-" .. c; nk = nk + 1 end
  local rp, al = reps(), alts()
  local code = table.concat({ "WFH2", name, realm, cls or "", tostring(lv), race or "", faction,
    "D:" .. table.concat(parts, "."), "L:" .. table.concat(log, "."),
    "E:" .. table.concat(eq, "."), "P:" .. table.concat(pf, "."),
    "T:" .. table.concat(tl, "-"), "X:" .. xp .. "-" .. xpMax .. "-" .. (rest or 0),
    "S:" .. sx .. "-" .. ss .. "-" .. hx .. "-" .. hs, "G:" .. (GetMoney and GetMoney() or 0),
    "B:" .. table.concat(bag, "."), "K:" .. table.concat(bank, "."),
    "R:" .. table.concat(rp, "."), "A:" .. table.concat(al, "."), "W:" .. table.concat(ws, ",") }, ";")
  return code, { done = #ids, log = #log, obj = nObj, eq = #eq, prof = #pf, tal = table.concat(tl, "/"), xp = xp, xpMax = xpMax,
    bag = nb, bank = nk, rep = #rp, alt = #al, sxp = sx, ssec = ss, wsk = #ws }
end

-- 창
local frame
local function showFrame()
  local code, n = makeCode()
  if not frame then
    frame = CreateFrame("Frame", "WowfHelperFrame", UIParent)
    frame:SetSize(480, 300)
    frame:SetPoint("CENTER")
    frame:SetFrameStrata("DIALOG")
    frame:EnableMouse(true)
    frame:SetMovable(true)
    frame:RegisterForDrag("LeftButton")
    frame:SetScript("OnDragStart", frame.StartMoving)
    frame:SetScript("OnDragStop", frame.StopMovingOrSizing)
    local bg = frame:CreateTexture(nil, "BACKGROUND")
    bg:SetAllPoints()
    bg:SetColorTexture(0.08, 0.07, 0.05, 0.95)
    local edge = frame:CreateTexture(nil, "BORDER")
    edge:SetPoint("TOPLEFT", -2, 2); edge:SetPoint("BOTTOMRIGHT", 2, -2)
    edge:SetColorTexture(0.72, 0.57, 0.24, 1)
    edge:SetDrawLayer("BACKGROUND", -1)

    frame.title = frame:CreateFontString(nil, "OVERLAY", "GameFontNormalLarge")
    frame.title:SetPoint("TOPLEFT", 14, -12)
    frame.title:SetText("와포 도우미 · 앱으로 옮기기")

    frame.info = frame:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    frame.info:SetPoint("TOPLEFT", 14, -36)
    frame.info:SetPoint("RIGHT", -30, 0)
    frame.info:SetJustifyH("LEFT")

    local close = CreateFrame("Button", nil, frame, "UIPanelCloseButton")
    close:SetPoint("TOPRIGHT", 2, 2)

    local scroll = CreateFrame("ScrollFrame", "WowfHelperScroll", frame, "UIPanelScrollFrameTemplate")
    scroll:SetPoint("TOPLEFT", 14, -72)
    scroll:SetPoint("BOTTOMRIGHT", -32, 58)
    local box = CreateFrame("EditBox", nil, scroll)
    box:SetMultiLine(true)
    box:SetFontObject(ChatFontNormal)
    box:SetWidth(420)
    box:SetAutoFocus(false)
    box:SetScript("OnEscapePressed", function() frame:Hide() end)
    -- 글자를 고치지 못하게: 바뀌면 다시 코드로
    box:SetScript("OnTextChanged", function(self, user) if user then self:SetText(frame.code or ""); self:HighlightText() end end)
    box:SetScript("OnMouseUp", function(self) self:HighlightText() end)
    scroll:SetScrollChild(box)
    frame.box = box

    frame.help = frame:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
    frame.help:SetPoint("BOTTOMLEFT", 14, 32)
    frame.help:SetText("Ctrl+C 로 복사 → 앱 「내 캐릭터 → 게임에서 불러오기」에 붙여 넣기")
    frame.off = frame:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall")
    frame.off:SetPoint("BOTTOMLEFT", 14, 12)
    frame.off:SetText("끄기: /wfh 공략 (보스 창) · /wfh 알림 · /wfh 추천 지우기 · /wfh 설정 (상태 보기)")
  end
  frame.code = code
  frame.info:SetText(("끝낸 퀘스트 %d · 목록 %d(목표 %d) · 장비 %d칸 · 전문기술 %d · 특성 %s\n가방 %d종 · 은행 %d종 · 평판 %d · 부캐 %d · 무기 숙련 %d · 이번 접속 경험치 %d"):format(n.done, n.log, n.obj, n.eq, n.prof, n.tal ~= "" and n.tal or "-", n.bag, n.bank, n.rep, n.alt, n.wsk or 0, n.sxp or 0))
  frame.box:SetText(code)
  frame:Show()
  frame.box:SetFocus()
  frame.box:HighlightText()
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.last = code
  WowfHelperDB.changed = false
end

-- /wfh 점검: 코드에 담긴 것 개수를 채팅창에 (친구가 테스트할 때 이 줄만 캡처해 주면 돼요)
local function selfTest()
  local ok, code, n = pcall(makeCode)
  if not ok then say("|cffff6060코드를 만들다 오류가 났어요:|r " .. tostring(code)); return end
  say(("점검 · 끝낸 퀘스트 %d · 목록 %d · 목표 %d · 장비 %d · 전문기술 %d · 특성 %s · 경험치 %d/%d"):format(
    n.done, n.log, n.obj, n.eq, n.prof, n.tal ~= "" and n.tal or "-", n.xp or 0, n.xpMax or 0))
  say(("점검 · 가방 %d종 · 은행 %d종%s · 평판 %d · 부캐 %d · 이번 접속 %d분 경험치 %d · 추천 %d개 · 보스 공략 %s · 글자 %d자"):format(
    n.bag, n.bank, (WowfHelperDB and WowfHelperDB.bankAt) and "" or "(은행을 한 번 열어 주세요)", n.rep, n.alt, math.floor((n.ssec or 0) / 60), n.sxp or 0,
    (WowfHelperDB and WowfHelperDB.recN) or 0, WowfHelperBoss and "있음" or "없음", #code))
  local apis = {}
  if not (C_QuestLog and C_QuestLog.GetQuestObjectives) and not GetQuestLogLeaderBoard then apis[#apis + 1] = "목표 진행도" end
  if not GetInventoryItemID then apis[#apis + 1] = "장비" end
  if not GetSkillLineInfo then apis[#apis + 1] = "전문기술" end
  if not GetTalentTabInfo then apis[#apis + 1] = "특성" end
  if not (C_Container or GetContainerNumSlots) then apis[#apis + 1] = "가방" end
  if not GetFactionInfo then apis[#apis + 1] = "평판" end
  if #apis > 0 then say("이 게임에서 못 읽는 것: " .. table.concat(apis, ", ")) end
end

SLASH_WOWFHELPER1 = "/wfh"
SLASH_WOWFHELPER2 = "/와포"
SlashCmdList["WOWFHELPER"] = function(msg)
  msg = (msg or ""):lower():gsub("^%s+", ""):gsub("%s+$", "")
  WowfHelperDB = WowfHelperDB or {}
  local D = WowfHelperDB
  if msg == "점검" or msg == "test" or msg == "check" then selfTest()
  elseif msg == "추천 지우기" or msg == "추천끄기" or msg == "추천 끄기" or msg == "rec off" then
    D.rec = nil; D.recN = 0; say("툴팁 추천을 지웠어요. (다시 넣으려면 /wfh 추천)")
  elseif msg == "알림" or msg == "note" then
    D.noteOff = not D.noteOff
    say(D.noteOff and "레벨업·반납 알림과 접속 인사를 껐어요. (/wfh 알림 으로 다시 켜기)" or "알림을 켰어요.")
  elseif msg == "설정" or msg == "status" then
    say(("설정 · 보스 공략 창 %s · 알림 %s · 툴팁 추천 %s"):format(D.bossOff and "|cffff6060꺼짐|r" or "|cff40ff40켜짐|r",
      D.noteOff and "|cffff6060꺼짐|r" or "|cff40ff40켜짐|r", (D.recN or 0) > 0 and ("|cff40ff40" .. D.recN .. "개|r") or "없음"))
    say("끄고 켜기: /wfh 공략 · /wfh 알림 · /wfh 추천 지우기 · 애드온 전체는 캐릭터 고르는 화면의 「애드온」에서")
  elseif msg == "추천" or msg == "rec" then WowfHelper_RecBox()
  elseif msg == "공략" or msg == "boss" then WowfHelper_BossToggle()
  else showFrame() end
end

-- 레벨업 · 퀘스트 반납 · 장비 바뀜 → 「앱 코드가 바뀌었어요」 알림 (2분에 한 번만)
local lastNote = 0
local function note(why)
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.changed = true
  if WowfHelperDB.noteOff then return end
  local t = GetTime and GetTime() or 0
  if t - lastNote < 120 then return end
  lastNote = t
  say(why .. " · 앱도 맞추려면 |cffffffff/wfh|r")
end

local ev = CreateFrame("Frame")
ev:RegisterEvent("PLAYER_LOGIN")
ev:RegisterEvent("PLAYER_LEVEL_UP")
ev:RegisterEvent("QUEST_TURNED_IN")
ev:RegisterEvent("PLAYER_XP_UPDATE")
ev:RegisterEvent("BANKFRAME_OPENED")
ev:RegisterEvent("PLAYERBANKSLOTS_CHANGED")
ev:RegisterEvent("PLAYER_LOGOUT")
ev:RegisterEvent("PLAYER_TARGET_CHANGED")
ev:RegisterEvent("PLAYER_REGEN_ENABLED")
local bankOpen = false
ev:SetScript("OnEvent", function(_, e, a1)
  if e == "PLAYER_XP_UPDATE" then xpTick(); return end
  if e == "BANKFRAME_OPENED" then bankOpen = true; scanBank(); return end
  if e == "PLAYERBANKSLOTS_CHANGED" then if bankOpen then scanBank() end; return end
  if e == "PLAYER_TARGET_CHANGED" then WowfHelper_BossCheck(); return end
  if e == "PLAYER_REGEN_ENABLED" then WowfHelper_BossCheck(true); return end
  if e == "PLAYER_LOGOUT" then
    -- 이번 접속 기록을 남기고 최근 5번만 보관
    WowfHelperDB = WowfHelperDB or {}
    local h = WowfHelperDB.hist or {}
    local secs = (time and time() or 0) - (sess.t0 or 0)
    if secs > 300 then table.insert(h, 1, { sess.xp, secs }) end
    while #h > 5 do table.remove(h) end
    WowfHelperDB.hist = h
    rememberMe()
    return
  end
  if e == "PLAYER_LOGIN" then
    sess.t0 = time and time() or 0; sess.xp = 0; sess.last = UnitXP("player") or 0; sess.lastMax = UnitXPMax("player") or 0
    rememberMe()
    if not (WowfHelperDB and WowfHelperDB.noteOff) then say("/wfh 를 치면 앱으로 옮길 코드가 나와요. (/wfh 설정 = 켜고 끄기)") end
  elseif e == "PLAYER_LEVEL_UP" then
    rememberMe()
    note((a1 and (a1 .. "레벨 달성!") or "레벨업!") .. " 앱 코드가 바뀌었어요")
  elseif e == "QUEST_TURNED_IN" then
    note("퀘스트를 반납했어요. 앱 코드가 바뀌었어요")
  end
end)

-- ===== 아이템 툴팁에 앱 추천 (/wfh 추천 으로 넣은 코드) =====
-- 코드: WFR1;U:번호-점수×10-칸.…;W:번호.번호 (번호는 36진수)
local SLOTKO = { head = "머리", neck = "목", shoulder = "어깨", back = "등", chest = "가슴", wrist = "손목", hands = "손", waist = "허리", legs = "다리", feet = "발",
  ring1 = "반지", ring2 = "반지", trink1 = "장신구", trink2 = "장신구", main = "주무기", off = "보조", ranged = "원거리" }
local function parseRec(txt)
  local i = txt:find("WFR1;", 1, true)
  if not i then return nil end
  local rec = { u = {}, w = {} }
  local n = 0
  for sec in txt:sub(i + 5):gmatch("[^;]+") do
    local k, v = sec:match("^(%u):(.*)$")
    if k == "U" then
      for part in v:gmatch("[^%.]+") do
        local id, g, sl = part:match("^(%w+)%-(%d+)%-(%a+%d?)$")
        if id then rec.u[tonumber(id, 36)] = { tonumber(g) / 10, sl }; n = n + 1 end
      end
    elseif k == "W" then
      for id in v:gmatch("[^%.]+") do local x = tonumber(id, 36); if x then rec.w[x] = true end end
    end
  end
  return rec, n
end

local recBox
function WowfHelper_RecBox()
  if not recBox then
    recBox = CreateFrame("Frame", "WowfHelperRecFrame", UIParent)
    recBox:SetSize(420, 170); recBox:SetPoint("CENTER", 0, 120); recBox:SetFrameStrata("DIALOG")
    recBox:EnableMouse(true); recBox:SetMovable(true); recBox:RegisterForDrag("LeftButton")
    recBox:SetScript("OnDragStart", recBox.StartMoving); recBox:SetScript("OnDragStop", recBox.StopMovingOrSizing)
    local bg = recBox:CreateTexture(nil, "BACKGROUND"); bg:SetAllPoints(); bg:SetColorTexture(0.08, 0.07, 0.05, 0.95)
    local t = recBox:CreateFontString(nil, "OVERLAY", "GameFontNormal"); t:SetPoint("TOPLEFT", 12, -10)
    t:SetText("와포 도우미 · 앱 추천 코드 붙여 넣기 (Ctrl+V → 확인)")
    local close = CreateFrame("Button", nil, recBox, "UIPanelCloseButton"); close:SetPoint("TOPRIGHT", 2, 2)
    local eb = CreateFrame("EditBox", nil, recBox, "InputBoxTemplate")
    eb:SetSize(380, 24); eb:SetPoint("TOPLEFT", 18, -40); eb:SetAutoFocus(true); eb:SetMaxLetters(0)
    recBox.eb = eb
    local info = recBox:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall"); info:SetPoint("TOPLEFT", 14, -76); info:SetPoint("RIGHT", -14, 0); info:SetJustifyH("LEFT")
    recBox.info = info
    local ok = CreateFrame("Button", nil, recBox, "UIPanelButtonTemplate"); ok:SetSize(100, 24); ok:SetPoint("BOTTOMRIGHT", -14, 12); ok:SetText("확인")
    local function apply()
      local rec, n = parseRec(eb:GetText() or "")
      if not rec then info:SetText("|cffff6060WFR1; 로 시작하는 코드가 아니에요.|r 앱 장비 탭 → 「게임 툴팁에 추천 넣기」에서 복사해 주세요."); return end
      WowfHelperDB = WowfHelperDB or {}
      WowfHelperDB.rec = rec; WowfHelperDB.recN = n
      say(("추천 %d개를 넣었어요. 아이템에 마우스를 올리면 보여요."):format(n))
      recBox:Hide()
    end
    ok:SetScript("OnClick", apply); eb:SetScript("OnEnterPressed", apply); eb:SetScript("OnEscapePressed", function() recBox:Hide() end)
  end
  local n = (WowfHelperDB and WowfHelperDB.recN) or 0
  recBox.info:SetText(n > 0 and ("지금 들어 있는 추천: %d개 · 새 코드를 넣으면 바뀌어요"):format(n) or "앱 「장비 → 게임 툴팁에 추천 넣기」의 코드를 붙여 넣어요.")
  recBox.eb:SetText(""); recBox:Show(); recBox.eb:SetFocus()
end

local function tipHook(tt)
  if not tt or not tt.GetItem then return end
  local _, link = tt:GetItem()
  if not link then return end
  local id = tonumber(link:match("item:(%d+)"))
  local rec = WowfHelperDB and WowfHelperDB.rec
  if not id or not rec then return end
  -- 같은 툴팁에 두 번 붙지 않게
  local nm = tt.GetName and tt:GetName()
  if nm then
    for i = 1, tt:NumLines() or 0 do
      local l = _G[nm .. "TextLeft" .. i]
      local tx = l and l:GetText()
      if tx and (tx:find("와포 추천", 1, true) or tx:find("앱에서 찜한 템", 1, true)) then return end
    end
  end
  local u = rec.u and rec.u[id]
  if u then tt:AddLine(("|cffe8c06a와포 추천|r · %s 지금보다 |cff40ff40+%.1f|r"):format(SLOTKO[u[2]] or u[2] or "", u[1] or 0)) end
  if rec.w and rec.w[id] then tt:AddLine("|cffffd100⭐ 앱에서 찜한 템|r") end
  if u or (rec.w and rec.w[id]) then tt:Show() end
end
if GameTooltip and GameTooltip.HookScript then
  pcall(function() GameTooltip:HookScript("OnTooltipSetItem", tipHook) end)
  if ItemRefTooltip then pcall(function() ItemRefTooltip:HookScript("OnTooltipSetItem", tipHook) end) end
end
if TooltipDataProcessor and TooltipDataProcessor.AddTooltipPostCall and Enum and Enum.TooltipDataType then
  pcall(function() TooltipDataProcessor.AddTooltipPostCall(Enum.TooltipDataType.Item, function(tt) tipHook(tt) end) end)
end

-- ===== 보스 공략 창: 보스를 대상으로 잡으면 앱 공략 요약 =====
local COL = { dz = "ff6060", int = "ffd040", dis = "60c0ff", av = "ff9a40", add = "c0c0c0", tk = "a0a0ff", hl = "60ff80", info = "cccccc" }
local bossF
local function bossFrame()
  if bossF then return bossF end
  bossF = CreateFrame("Frame", "WowfHelperBossFrame", UIParent)
  bossF:SetSize(330, 40); bossF:SetPoint("TOP", 0, -140); bossF:SetFrameStrata("MEDIUM")
  bossF:EnableMouse(true); bossF:SetMovable(true); bossF:RegisterForDrag("LeftButton"); bossF:SetClampedToScreen(true)
  bossF:SetScript("OnDragStart", bossF.StartMoving); bossF:SetScript("OnDragStop", bossF.StopMovingOrSizing)
  local bg = bossF:CreateTexture(nil, "BACKGROUND"); bg:SetAllPoints(); bg:SetColorTexture(0.05, 0.04, 0.03, 0.85)
  bossF.title = bossF:CreateFontString(nil, "OVERLAY", "GameFontNormal"); bossF.title:SetPoint("TOPLEFT", 10, -8)
  local close = CreateFrame("Button", nil, bossF, "UIPanelCloseButton"); close:SetPoint("TOPRIGHT", 2, 2); close:SetScale(0.8)
  close:SetScript("OnClick", function() bossF:Hide(); bossF.hiddenFor = UnitName("target"); say("이 보스 공략 창을 닫았어요. 아예 끄려면 /wfh 공략") end)
  bossF.lines = {}
  for i = 1, 7 do
    local l = bossF:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    l:SetPoint("TOPLEFT", 10, -10 - 16 * i); l:SetPoint("RIGHT", -10, 0); l:SetJustifyH("LEFT"); l:SetWordWrap(false)
    bossF.lines[i] = l
  end
  bossF:Hide()
  return bossF
end
function WowfHelper_BossCheck(leftCombat)
  WowfHelperDB = WowfHelperDB or {}
  if WowfHelperDB.bossOff or not WowfHelperBoss then return end
  local f = bossFrame()
  local name = UnitExists("target") and UnitName("target")
  local tips = name and WowfHelperBoss[name]
  if tips and f.hiddenFor == name then return end
  if not tips then
    if leftCombat or not UnitExists("target") then f:Hide() end
    return
  end
  f.title:SetText("|cffe8c06a와포 공략|r · " .. name)
  local n = 0
  for i, raw in ipairs(tips) do
    if i > 7 then break end
    local t, lab, txt = raw:match("^([^|]+)|([^|]+)|(.*)$")
    n = i
    f.lines[i]:SetText(("|cff%s%s|r %s"):format(COL[t] or "cccccc", lab or "", txt or raw))
    f.lines[i]:Show()
  end
  for i = n + 1, 7 do f.lines[i]:Hide() end
  if not f.foot then f.foot = f:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall"); f.foot:SetText("/wfh 공략 = 이 창 끄기") end
  f.foot:ClearAllPoints(); f.foot:SetPoint("TOPLEFT", 10, -12 - 16 * (n + 1))
  f:SetHeight(48 + 16 * n)
  f:Show()
end
function WowfHelper_BossToggle()
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.bossOff = not WowfHelperDB.bossOff
  if WowfHelperDB.bossOff and bossF then bossF:Hide() end
  say(WowfHelperDB.bossOff and "보스 공략 창을 껐어요. (/wfh 공략 으로 다시 켜기)" or "보스 공략 창을 켰어요. 보스를 대상으로 잡으면 떠요.")
end
