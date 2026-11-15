-- 와포 도우미 · 게임 안 길 안내 (v3.7)
-- 앱 「레벨업」 탭의 단계(받기·하기·반납)를 /wfh 추천 코드로 넣으면
-- 화면에 다음 목적지 · 거리 · 방향 화살표를 띄우고, 퀘스트를 받거나 반납하면 저절로 다음 단계로 넘어가요.
-- /wfh 길        길 안내 창 켜기/끄기
-- /wfh 길 다음   다음 단계로 (건너뛰기)
-- /wfh 길 이전   앞 단계로
-- /wfh 길 처음   처음 단계부터 다시

local PRE = "|cffe8c06a[와포 도우미]|r "
local function say(msg) DEFAULT_CHAT_FRAME:AddMessage(PRE .. msg) end
local KIND = { g = { "받기", "ffd65a" }, d = { "하기", "ff9a4a" }, t = { "반납", "7ec8ff" } }

local function DB() WowfHelperDB = WowfHelperDB or {}; return WowfHelperDB end
local function steps() local r = DB().rec; return r and r.s end

-- ===== 지역 이름 → 지도 번호 (게임 지도 이름으로 찾음) =====
local ZMAP
local function norm(s) return ((s or ""):gsub("%s+", "")) end
local function zoneMap()
  if ZMAP then return ZMAP end
  ZMAP = {}
  if not (C_Map and C_Map.GetMapChildrenInfo) then return ZMAP end
  for _, root in ipairs({ 947, 1414, 1415 }) do
    local ok, kids = pcall(C_Map.GetMapChildrenInfo, root, nil, true)
    if ok and kids then
      for _, k in ipairs(kids) do
        local key = norm(k.name)
        if key ~= "" and (not ZMAP[key] or k.mapType == 3) then ZMAP[key] = k.mapID end
      end
    end
  end
  return ZMAP
end
local function mapIdOf(z)
  local M, k = zoneMap(), norm(z)
  if k == "" then return nil end
  if M[k] then return M[k] end
  for name, id in pairs(M) do
    if name:find(k, 1, true) or k:find(name, 1, true) then return id end
  end
end

-- ===== 세계 좌표 (첫째 값 = 북쪽, 둘째 값 = 서쪽) =====
local function worldPos(mapID, x, y)
  if not (mapID and C_Map and C_Map.GetWorldPosFromMapPos and CreateVector2D) then return end
  local ok, cont, wp = pcall(C_Map.GetWorldPosFromMapPos, mapID, CreateVector2D(x, y))
  if ok and wp then
    local a, b = wp:GetXY()
    return cont, a, b
  end
end
local function playerWorld()
  if not (C_Map and C_Map.GetBestMapForUnit) then return end
  local m = C_Map.GetBestMapForUnit("player")
  if not m then return end
  local p = C_Map.GetPlayerMapPosition(m, "player")
  if not p then return end
  local px, py = p:GetXY()
  if not px or (px == 0 and py == 0) then return end
  local cont, a, b = worldPos(m, px, py)
  return cont, a, b, m
end

-- ===== 퀘스트 상태 =====
local function qDone(id)
  if C_QuestLog and C_QuestLog.IsQuestFlaggedCompleted then return C_QuestLog.IsQuestFlaggedCompleted(id) and true or false end
  if IsQuestFlaggedCompleted then return IsQuestFlaggedCompleted(id) and true or false end
  return false
end
local function qLog(id)
  local idx = (GetQuestLogIndexByID and GetQuestLogIndexByID(id)) or (C_QuestLog and C_QuestLog.GetLogIndexForQuestID and C_QuestLog.GetLogIndexForQuestID(id))
  if idx and idx > 0 and GetQuestLogTitle then
    local title, _, _, _, _, isComplete = GetQuestLogTitle(idx)
    return true, (isComplete == 1 or isComplete == true), title
  end
  return false, false
end
local function stepDone(s)
  local ids = s[6] or {}
  if #ids == 0 then return false end
  for _, id in ipairs(ids) do
    local inLog, comp = qLog(id)
    local ok
    if s[1] == "g" then ok = inLog or qDone(id)
    elseif s[1] == "t" then ok = qDone(id)
    else ok = qDone(id) or (inLog and comp) end
    if not ok then return false end
  end
  return true
end
local function questLine(s)
  local ids, first, n = s[6] or {}, nil, 0
  for _, id in ipairs(ids) do
    n = n + 1
    if not first then
      local inLog, _, title = qLog(id)
      if inLog and title then first = title
      elseif C_QuestLog and C_QuestLog.GetQuestInfo then
        local ok, t = pcall(C_QuestLog.GetQuestInfo, id)
        if ok and t and t ~= "" then first = t end
      end
    end
  end
  if n == 0 then return "" end
  if first then return n > 1 and (first .. " 외 " .. (n - 1) .. "개") or first end
  return "퀘스트 " .. n .. "개"
end

-- ===== 창 =====
local F
local function makeFrame()
  if F then return F end
  F = CreateFrame("Frame", "WowfHelperNavFrame", UIParent)
  F:SetSize(290, 70); F:SetFrameStrata("MEDIUM"); F:SetClampedToScreen(true)
  local P = DB().navPos
  if P then F:SetPoint(P[1], UIParent, P[2], P[3], P[4]) else F:SetPoint("TOP", 0, -70) end
  F:EnableMouse(true); F:SetMovable(true); F:RegisterForDrag("LeftButton")
  F:SetScript("OnDragStart", F.StartMoving)
  F:SetScript("OnDragStop", function(s)
    s:StopMovingOrSizing()
    local p, _, rp, x, y = s:GetPoint()
    DB().navPos = { p, rp, x, y }
  end)
  local bg = F:CreateTexture(nil, "BACKGROUND"); bg:SetAllPoints(); bg:SetColorTexture(0.06, 0.05, 0.03, 0.84)
  local ln = F:CreateTexture(nil, "BORDER"); ln:SetPoint("TOPLEFT"); ln:SetPoint("TOPRIGHT"); ln:SetHeight(2); ln:SetColorTexture(0.78, 0.6, 0.23, 0.9)
  F.arrow = F:CreateTexture(nil, "ARTWORK"); F.arrow:SetSize(46, 46); F.arrow:SetPoint("LEFT", 8, -2)
  F.arrow:SetTexture("Interface\\Minimap\\MinimapArrow")
  F.t1 = F:CreateFontString(nil, "OVERLAY", "GameFontNormal"); F.t1:SetPoint("TOPLEFT", 60, -8); F.t1:SetPoint("RIGHT", -26, 0); F.t1:SetJustifyH("LEFT"); F.t1:SetWordWrap(false)
  F.t2 = F:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall"); F.t2:SetPoint("TOPLEFT", 60, -27); F.t2:SetPoint("RIGHT", -10, 0); F.t2:SetJustifyH("LEFT"); F.t2:SetWordWrap(false)
  F.t3 = F:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall"); F.t3:SetPoint("TOPLEFT", 60, -44); F.t3:SetPoint("RIGHT", -74, 0); F.t3:SetJustifyH("LEFT"); F.t3:SetWordWrap(false)
  local close = CreateFrame("Button", nil, F, "UIPanelCloseButton"); close:SetPoint("TOPRIGHT", 4, 4); close:SetScale(0.7)
  close:SetScript("OnClick", function() DB().navOff = true; F:Hide(); say("길 안내를 껐어요. 다시 켜기: /wfh 길") end)
  local function btn(txt, x, fn)
    local b = CreateFrame("Button", nil, F, "UIPanelButtonTemplate"); b:SetSize(32, 18); b:SetPoint("BOTTOMRIGHT", x, 6); b:SetText(txt)
    b:SetScript("OnClick", fn); return b
  end
  btn(">", -6, function() WowfHelper_NavCmd("다음") end)
  btn("<", -40, function() WowfHelper_NavCmd("이전") end)
  local acc = 0
  F:SetScript("OnUpdate", function(_, el)
    acc = acc + el
    if acc < 0.05 then return end
    acc = 0
    WowfHelper_NavTick()
  end)
  F:Hide()
  return F
end

local tgt = {}  -- 지금 단계의 목표 (지도 번호 · 세계 좌표)
local function setTarget()
  local S, i = steps(), DB().navI or 1
  local s = S and S[i]
  tgt = {}
  if not s then return end
  tgt.s = s
  local m = s[4] and s[5] and mapIdOf(s[3])
  if m then
    local cont, a, b = worldPos(m, s[4] / 100, s[5] / 100)
    if a then tgt.cont, tgt.a, tgt.b, tgt.map = cont, a, b, m end
  end
end

function WowfHelper_NavTick()
  if not F or not F:IsShown() then return end
  local S, i = steps(), DB().navI or 1
  if not S or #S == 0 then F:Hide(); return end  -- /wfh 추천 지우기 등으로 단계가 없어지면 창도 닫음
  local s = S[i]
  if not s then
    F.arrow:Hide()
    F.t1:SetText("|cff40ff40모든 단계를 끝냈어요!|r")
    F.t2:SetText("앱 레벨업 탭에서 새 코드를 넣어 주세요 (/wfh 추천)")
    F.t3:SetText("")
    return
  end
  if tgt.s ~= s then setTarget() end
  local K = KIND[s[1]] or KIND.d
  F.t1:SetText(("%d/%d · |cff%s%s|r · %s"):format(i, #S, K[2], K[1], s[2] ~= "" and s[2] or s[3]))
  F.t3:SetText(questLine(s))
  local where = s[3] .. ((s[4] and s[5]) and (" %d, %d"):format(math.floor(s[4] + 0.5), math.floor(s[5] + 0.5)) or "")
  local cont, pa, pb = playerWorld()
  if not (tgt.a and pa) then
    F.arrow:Hide()
    F.t2:SetText(where .. (tgt.a and " · 던전 안에서는 방향을 못 보여 줘요" or ""))
    return
  end
  if cont ~= tgt.cont then
    F.arrow:Hide()
    F.t2:SetText(where .. " · 다른 대륙이에요 (배·비행)")
    return
  end
  local dN, dW = tgt.a - pa, tgt.b - pb
  local dist = math.sqrt(dN * dN + dW * dW)
  local near = dist < (s[1] == "d" and 60 or 20)
  if near then
    F.arrow:Hide()
    F.t2:SetText("|cff40ff40도착했어요|r · " .. (s[1] == "g" and "퀘스트를 받아요" or s[1] == "t" and "퀘스트를 반납해요" or "이 근처에서 할 일을 해요"))
    return
  end
  local face = GetPlayerFacing and GetPlayerFacing()
  if face then
    F.arrow:Show()
    F.arrow:SetRotation(math.atan2(dW, dN) - face)
  else F.arrow:Hide() end
  F.t2:SetText(("%s · |cffffffff%d야드|r"):format(where, math.floor(dist + 0.5)))
end

local function skipDone(announce)
  local S = steps()
  if not S then return end
  local D = DB()
  local i0 = D.navI or 1
  local i = i0
  while S[i] and stepDone(S[i]) do i = i + 1 end
  if i ~= i0 then
    D.navI = i
    setTarget()
    if announce then
      local s = S[i]
      if s then
        local K = KIND[s[1]] or KIND.d
        say(("✓ %d단계 끝 → 다음 |cff%s%s|r · %s (%s)"):format(i - 1, K[2], K[1], s[2] ~= "" and s[2] or s[3], s[3]))
      else
        say("✓ 길 안내 단계를 모두 끝냈어요! 앱에서 새 코드를 넣어 주세요.")
      end
    end
  end
end

function WowfHelper_NavShow()
  local S = steps()
  if not S or #S == 0 or DB().navOff then if F then F:Hide() end return end
  makeFrame():Show()
  setTarget()
  WowfHelper_NavTick()
end

function WowfHelper_NavReset()
  local D = DB()
  D.navI = 1; D.navOff = nil
  skipDone(false)
  WowfHelper_NavShow()
end

function WowfHelper_NavCmd(arg)
  arg = (arg or ""):gsub("^%s+", ""):gsub("%s+$", "")
  local D, S = DB(), steps()
  if not S or #S == 0 then
    say("길 안내 단계가 없어요. 앱 레벨업 탭의 「게임 화면에 길 안내 띄우기」 코드를 /wfh 추천 으로 넣어 주세요.")
    return
  end
  if arg == "" then
    D.navOff = not D.navOff
    if D.navOff then if F then F:Hide() end say("길 안내를 껐어요. (/wfh 길 로 다시 켜기)")
    else WowfHelper_NavShow(); say("길 안내를 켰어요. 창은 끌어서 옮길 수 있어요 · /wfh 길 다음 · /wfh 길 이전") end
    return
  end
  if arg == "다음" or arg == "next" then D.navI = math.min(#S + 1, (D.navI or 1) + 1)
  elseif arg == "이전" or arg == "prev" then D.navI = math.max(1, (D.navI or 1) - 1)
  elseif arg == "처음" or arg == "reset" then D.navI = 1
  else say("/wfh 길 · /wfh 길 다음 · /wfh 길 이전 · /wfh 길 처음"); return end
  D.navOff = nil
  WowfHelper_NavShow()
end

-- ===== 퀘스트를 받거나 반납하면 다음 단계로 =====
local pend = false
local function later()
  if pend then return end
  pend = true
  local function run() pend = false; skipDone(true); if F and F:IsShown() then WowfHelper_NavTick() end end
  if C_Timer and C_Timer.After then C_Timer.After(0.4, run) else run() end
end
local ev = CreateFrame("Frame")
ev:RegisterEvent("PLAYER_ENTERING_WORLD")
ev:RegisterEvent("QUEST_ACCEPTED")
ev:RegisterEvent("QUEST_TURNED_IN")
ev:RegisterEvent("QUEST_LOG_UPDATE")
ev:RegisterEvent("ZONE_CHANGED_NEW_AREA")
ev:SetScript("OnEvent", function(_, e)
  if e == "PLAYER_ENTERING_WORLD" then
    if C_Timer and C_Timer.After then C_Timer.After(2, function() skipDone(false); WowfHelper_NavShow() end)
    else skipDone(false); WowfHelper_NavShow() end
  elseif e == "ZONE_CHANGED_NEW_AREA" then
    tgt = {}
  elseif steps() then
    later()
  end
end)
