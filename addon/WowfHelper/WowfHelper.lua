-- 와포 도우미 (WowfHelper)
-- 이 캐릭터가 끝낸 퀘스트와 지금 퀘스트 목록을 글자 코드로 만들어 줘요.
-- 게임 안에서 /wfh 를 치면 창이 뜨고, Ctrl+C 로 복사해서 앱의
-- 「내 캐릭터 → 게임에서 불러오기」에 붙여 넣으면 돼요.
-- 인터넷으로 보내는 건 없어요. 게임 밖으로 나가는 건 직접 복사한 글자뿐이에요.

local ADDON = "WowfHelper"
local B36 = "0123456789abcdefghijklmnopqrstuvwxyz"

local function b36(n)
  if n <= 0 then return "0" end
  local s = ""
  while n > 0 do
    local r = n % 36
    s = B36:sub(r + 1, r + 1) .. s
    n = math.floor(n / 36)
  end
  return s
end

-- 끝낸 퀘스트 번호 (새 방식 → 옛 방식 순서로 시도)
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

-- 지금 퀘스트 목록: 번호와 다 했는지
local function questLog()
  local out = {}
  if C_QuestLog and C_QuestLog.GetNumQuestLogEntries and C_QuestLog.GetInfo then
    local n = C_QuestLog.GetNumQuestLogEntries()
    for i = 1, n do
      local info = C_QuestLog.GetInfo(i)
      if info and not info.isHeader and info.questID and info.questID > 0 then
        local done = C_QuestLog.IsComplete and C_QuestLog.IsComplete(info.questID)
        out[#out + 1] = { info.questID, done and true or false }
      end
    end
  elseif GetNumQuestLogEntries and GetQuestLogTitle then
    local n = GetNumQuestLogEntries()
    for i = 1, n do
      local _, _, _, isHeader, _, isComplete, _, questID = GetQuestLogTitle(i)
      if not isHeader and questID and questID > 0 then
        out[#out + 1] = { questID, isComplete == 1 or isComplete == true }
      end
    end
  end
  return out
end

-- 코드 만들기: WFH1;이름;서버;직업;레벨;종족;진영;D:번호들;L:목록
local function makeCode()
  local name = UnitName("player") or ""
  local realm = GetRealmName and GetRealmName() or ""
  local _, cls = UnitClass("player")
  local _, race = UnitRace("player")
  local faction = UnitFactionGroup and UnitFactionGroup("player") or ""
  local lv = UnitLevel("player") or 0

  -- 끝낸 퀘스트: 작은 번호부터, 앞 번호와의 차이를 36진수로 (짧게)
  local ids, parts, prev = completedIDs(), {}, 0
  for _, id in ipairs(ids) do
    parts[#parts + 1] = b36(id - prev)
    prev = id
  end
  local log = {}
  for _, q in ipairs(questLog()) do
    log[#log + 1] = b36(q[1]) .. (q[2] and "*" or "")
  end
  local code = table.concat({ "WFH1", name, realm, cls or "", tostring(lv), race or "", faction,
    "D:" .. table.concat(parts, "."), "L:" .. table.concat(log, ".") }, ";")
  return code, #ids, #log
end

-- 창
local frame
local function showFrame()
  local code, nDone, nLog = makeCode()
  if not frame then
    frame = CreateFrame("Frame", "WowfHelperFrame", UIParent)
    frame:SetSize(460, 250)
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
    frame.info:SetJustifyH("LEFT")

    local close = CreateFrame("Button", nil, frame, "UIPanelCloseButton")
    close:SetPoint("TOPRIGHT", 2, 2)

    local scroll = CreateFrame("ScrollFrame", "WowfHelperScroll", frame, "UIPanelScrollFrameTemplate")
    scroll:SetPoint("TOPLEFT", 14, -58)
    scroll:SetPoint("BOTTOMRIGHT", -32, 40)
    local box = CreateFrame("EditBox", nil, scroll)
    box:SetMultiLine(true)
    box:SetFontObject(ChatFontNormal)
    box:SetWidth(400)
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
  frame.info:SetText(("끝낸 퀘스트 %d개 · 지금 퀘스트 목록 %d개"):format(nDone, nLog))
  frame.box:SetText(code)
  frame:Show()
  frame.box:SetFocus()
  frame.box:HighlightText()
  WowfHelperDB = WowfHelperDB or {}
  WowfHelperDB.last = code
end

SLASH_WOWFHELPER1 = "/wfh"
SLASH_WOWFHELPER2 = "/와포"
SlashCmdList["WOWFHELPER"] = showFrame

local ev = CreateFrame("Frame")
ev:RegisterEvent("PLAYER_LOGIN")
ev:SetScript("OnEvent", function()
  DEFAULT_CHAT_FRAME:AddMessage("|cffe8c06a[와포 도우미]|r /wfh 를 치면 앱으로 옮길 코드가 나와요.")
end)
