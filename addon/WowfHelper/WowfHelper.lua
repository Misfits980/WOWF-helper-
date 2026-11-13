-- 와포 도우미 (WowfHelper) v2
-- 이 캐릭터 정보를 글자 코드로 만들어 줘요:
--   끝낸 퀘스트 · 지금 퀘스트 목록(+ 목표 진행도) · 끼고 있는 장비 · 전문기술 숙련도 · 특성 포인트 · 경험치
-- 게임 안에서 /wfh 를 치면 창이 뜨고, Ctrl+C 로 복사해서 앱의
-- 「내 캐릭터 → 게임에서 불러오기」에 붙여 넣으면 돼요.
-- 인터넷으로 보내는 건 없어요. 게임 밖으로 나가는 건 직접 복사한 글자뿐이에요.
--
-- /wfh        코드 창 열기
-- /wfh 점검   (또는 /wfh test) 코드에 무엇이 몇 개 담겼는지 채팅창에 보여 주기

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
  local tl = talents()
  local xp, xpMax, rest = UnitXP and UnitXP("player") or 0, UnitXPMax and UnitXPMax("player") or 0, GetXPExhaustion and GetXPExhaustion() or 0

  local code = table.concat({ "WFH2", name, realm, cls or "", tostring(lv), race or "", faction,
    "D:" .. table.concat(parts, "."), "L:" .. table.concat(log, "."),
    "E:" .. table.concat(eq, "."), "P:" .. table.concat(pf, "."),
    "T:" .. table.concat(tl, "-"), "X:" .. xp .. "-" .. xpMax .. "-" .. (rest or 0) }, ";")
  return code, { done = #ids, log = #log, obj = nObj, eq = #eq, prof = #pf, tal = table.concat(tl, "/"), xp = xp, xpMax = xpMax }
end

-- 창
local frame
local function showFrame()
  local code, n = makeCode()
  if not frame then
    frame = CreateFrame("Frame", "WowfHelperFrame", UIParent)
    frame:SetSize(480, 270)
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
    scroll:SetPoint("BOTTOMRIGHT", -32, 40)
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
    frame.help:SetPoint("BOTTOMLEFT", 14, 14)
    frame.help:SetText("Ctrl+C 로 복사 → 앱 「내 캐릭터 → 게임에서 불러오기」에 붙여 넣기")
  end
  frame.code = code
  frame.info:SetText(("끝낸 퀘스트 %d개 · 퀘스트 목록 %d개(목표 %d개)\n장비 %d칸 · 전문기술 %d개 · 특성 %s"):format(n.done, n.log, n.obj, n.eq, n.prof, n.tal ~= "" and n.tal or "-"))
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
  say(("점검 · 끝낸 퀘스트 %d · 목록 %d · 목표 %d · 장비 %d · 전문기술 %d · 특성 %s · 경험치 %d/%d · 글자 %d자"):format(
    n.done, n.log, n.obj, n.eq, n.prof, n.tal ~= "" and n.tal or "-", n.xp or 0, n.xpMax or 0, #code))
  local apis = {}
  if not (C_QuestLog and C_QuestLog.GetQuestObjectives) and not GetQuestLogLeaderBoard then apis[#apis + 1] = "목표 진행도" end
  if not GetInventoryItemID then apis[#apis + 1] = "장비" end
  if not GetSkillLineInfo then apis[#apis + 1] = "전문기술" end
  if not GetTalentTabInfo then apis[#apis + 1] = "특성" end
  if #apis > 0 then say("이 게임에서 못 읽는 것: " .. table.concat(apis, ", ")) end
end

SLASH_WOWFHELPER1 = "/wfh"
SLASH_WOWFHELPER2 = "/와포"
SlashCmdList["WOWFHELPER"] = function(msg)
  msg = (msg or ""):lower():gsub("^%s+", ""):gsub("%s+$", "")
  if msg == "점검" or msg == "test" or msg == "check" then selfTest() else showFrame() end
end

-- 레벨업 · 퀘스트 반납 · 장비 바뀜 → 「앱 코드가 바뀌었어요」 알림 (2분에 한 번만)
local lastNote = 0
local function note(why)
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.changed = true
  local t = GetTime and GetTime() or 0
  if t - lastNote < 120 then return end
  lastNote = t
  say(why .. " · 앱도 맞추려면 |cffffffff/wfh|r")
end

local ev = CreateFrame("Frame")
ev:RegisterEvent("PLAYER_LOGIN")
ev:RegisterEvent("PLAYER_LEVEL_UP")
ev:RegisterEvent("QUEST_TURNED_IN")
ev:SetScript("OnEvent", function(_, e, a1)
  if e == "PLAYER_LOGIN" then
    say("/wfh 를 치면 앱으로 옮길 코드가 나와요. (/wfh 점검 = 담긴 것 확인)")
  elseif e == "PLAYER_LEVEL_UP" then
    note((a1 and (a1 .. "레벨 달성!") or "레벨업!") .. " 앱 코드가 바뀌었어요")
  elseif e == "QUEST_TURNED_IN" then
    note("퀘스트를 반납했어요. 앱 코드가 바뀌었어요")
  end
end)
