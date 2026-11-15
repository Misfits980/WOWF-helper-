-- 와포 도우미 v3.6 · /wfh 아이템
-- 앱 장비 목록(ItemList.lua)의 아이템을 게임에서 하나씩 천천히 읽어 둬요.
-- 읽는 것: 한글 이름 · 등급 · 아이템 레벨 · 착용 레벨 · 게임이 읽은 능력치 · 툴팁 글줄(착용 효과 · 무기 공격력 · 속도 등)
-- 읽은 건 이 컴퓨터의 저장 파일(WTF\Account\...\SavedVariables\WowfHelper.lua)에만 남아요. 인터넷으로 보내는 건 없어요.
-- 전투 중에는 쉬고, 접속이 끊겨도 다음 접속 때 이어서 읽어요. 다 읽으면 /reload (또는 접속 종료) 해야 파일에 저장돼요.
--
-- /wfh 아이템          읽기 시작 (읽는 중이면 진행 상황)
-- /wfh 아이템 멈춤     잠깐 멈추기 (다시 /wfh 아이템 하면 이어서)
-- /wfh 아이템 처음     못 찾은 것까지 처음부터 다시
-- /wfh 아이템 다시     이미 읽은 것을 한 번 더 읽기 (착용·사용 효과 글이 늦게 떠서 빠진 것 채우기, 2~3분)
-- /wfh 아이템 지우기   읽어 둔 것 모두 지우기

local PRE = "|cffe8c06a[와포 도우미]|r "
local function say(m) DEFAULT_CHAT_FRAME:AddMessage(PRE .. m) end

local MAXP = 4      -- 한 번에 서버에 물어보는 아이템 수
local TIMEOUT = 8   -- 이 초가 지나도 답이 없으면 못 찾은 것으로
local CACHED = 12   -- 한 번(0.1초)에 이미 받아 둔 아이템을 읽는 최대 수
-- 툴팁의 효과 글(주문 설명)은 조금 늦게 불러와져 처음 읽을 때 빠질 수 있음 → 1.5초 · 4초 뒤에 다시 읽어 줄이 더 많은 쪽을 남김
local RECHECK = { 1.5, 4 }

-- 이 게임(1.15 클라이언트)은 GetItemInfo·GetItemStats가 C_Item 안으로 옮겨져 있음 → 둘 다 찾아 씀
local GII = GetItemInfo or (C_Item and C_Item.GetItemInfo)
local GIS = GetItemStats or (C_Item and C_Item.GetItemStats)

local LIST
local function list()
  if not LIST then
    LIST = {}
    for tok in (WowfHelper_ItemList or ""):gmatch("[^,]+") do LIST[#LIST + 1] = tonumber(tok, 36) end
  end
  return LIST
end

local function state()
  WowfHelperAcc = WowfHelperAcc or {}
  local A = WowfHelperAcc
  A.it = A.it or {}
  A.itMiss = A.itMiss or {}
  local s = A.scan
  if type(s) ~= "table" or s.v ~= WowfHelper_ItemListVer then
    -- 목록이 바뀌면(새 애드온) 처음부터 훑되, 이미 읽은 건 건너뜀
    s = { v = WowfHelper_ItemListVer, pos = 1, run = s and s.run or false }
    A.scan = s
  end
  return s, A.it, A.itMiss
end

local tip
local function scanTip()
  if not tip then
    tip = CreateFrame("GameTooltip", "WowfHelperScanTip", nil, "GameTooltipTemplate")
  end
  return tip
end

-- 글자 색 → 한 글자 표시 (g 초록: 착용·사용 효과 · y 노랑 · r 빨강: 못 씀 · h 회색 · w 흰색 · o 그 밖)
local function colorTag(fs)
  local ok, r, g, b = pcall(fs.GetTextColor, fs)
  if not ok or not r then return "w" end
  if g > .9 and r < .2 and b < .2 then return "g" end
  if r > .9 and g > .7 and b < .2 then return "y" end
  if r > .9 and g < .3 and b < .3 then return "r" end
  if r > .9 and g > .9 and b > .9 then return "w" end
  if r > .4 and r < .7 and math.abs(r - g) < .06 and math.abs(g - b) < .06 then return "h" end
  return "o"
end

-- 게임이 이미 알고 있으면 읽어서 표로, 아직 모르면 nil
local function readItem(id)
  local name, link, q, ilvl, req, _, _, _, loc, icon = GII(id)
  if not name then return nil end
  local rec = { name, q or -1, ilvl or 0, req or 0, loc or "", icon or 0, "" }
  local okS, st = pcall(GIS, link or ("item:" .. id))
  if okS and type(st) == "table" then
    local s = {}
    for k, v in pairs(st) do s[#s + 1] = tostring(k):gsub("^ITEM_MOD_", ""):gsub("_SHORT$", "") .. "=" .. tostring(v) end
    table.sort(s)
    rec[7] = table.concat(s, ",")
  end
  local t = scanTip()
  t:SetOwner(UIParent or WorldFrame, "ANCHOR_NONE")
  t:ClearLines()
  local okT = pcall(t.SetHyperlink, t, "item:" .. id)
  if okT then
    local n = t:NumLines() or 0
    for i = 2, n do -- 1번 줄은 이름
      local L, R = _G["WowfHelperScanTipTextLeft" .. i], _G["WowfHelperScanTipTextRight" .. i]
      local lt = L and L:GetText()
      local rt = R and R:IsShown() and R:GetText()
      if lt and lt ~= "" then
        rec[#rec + 1] = colorTag(L) .. lt .. ((rt and rt ~= "") and ("\t" .. rt) or "")
      end
    end
  end
  t:Hide()
  return rec
end

local run, pend, npend, lastSay, ticker = false, {}, 0, 0, nil
local again = {} -- { id, 다시 읽을 때, 몇 번째 }
local function counts()
  local s, IT, MS = state()
  local L, got, miss = list(), 0, 0
  for _, id in ipairs(L) do
    if IT[id] then got = got + 1 elseif MS[id] then miss = miss + 1 end
  end
  return got, miss, #L
end

local function finish()
  run = false
  local s = state(); s.run = false; s.redo = nil; s.done = time and time() or 0
  local got, miss, n = counts()
  say(("아이템 읽기 끝! |cff40ff40%d개|r 읽음 · 못 찾음 %d개 (전체 %d개)"):format(got, miss, n))
  say("|cffffd100/reload|r 를 치거나 접속을 끝내야 파일에 저장돼요. 그다음 Claude에게 「다 했어」라고 알려 주세요.")
end

local function tick()
  if not run then return end
  if (InCombatLockdown and InCombatLockdown()) or (UnitAffectingCombat and UnitAffectingCombat("player")) then return end
  local s, IT, MS = state()
  local L = list()
  local now = GetTime and GetTime() or 0
  -- 효과 글 다시 읽기
  if #again > 0 then
    local keep, done = {}, 0
    for _, a in ipairs(again) do
      if a[2] <= now and done < 30 then
        done = done + 1
        local rec = readItem(a[1])
        if rec and (not IT[a[1]] or #rec > #IT[a[1]]) then IT[a[1]] = rec end
        if RECHECK[a[3] + 1] then keep[#keep + 1] = { a[1], now + RECHECK[a[3] + 1] - RECHECK[a[3]], a[3] + 1 } end
      else keep[#keep + 1] = a end
    end
    again = keep
  end
  local function got(id, rec)
    if not IT[id] or #rec >= #IT[id] then IT[id] = rec end
    again[#again + 1] = { id, now + RECHECK[1], 1 }
  end
  for id, t0 in pairs(pend) do
    local rec = readItem(id)
    if rec then got(id, rec); pend[id] = nil; npend = npend - 1
    elseif now - t0 > TIMEOUT then MS[id] = true; pend[id] = nil; npend = npend - 1 end
  end
  local cached = 0
  while npend < MAXP and cached < CACHED and s.pos <= #L do
    local id = L[s.pos]
    s.pos = s.pos + 1
    if not MS[id] and (not IT[id] or s.redo) then
      local rec = readItem(id)
      if rec then got(id, rec); cached = cached + 1
      else
        if C_Item and C_Item.RequestLoadItemDataByID then pcall(C_Item.RequestLoadItemDataByID, id) end
        pend[id] = now; npend = npend + 1
      end
    end
  end
  if s.pos > #L and npend == 0 and #again == 0 then
    -- 멈췄다 켜는 사이 답을 못 받고 지나간 아이템이 있으면 한 번 더 훑음
    if not s.again then
      local got, miss, n = counts()
      if got + miss < n then s.again = true; s.redo = nil; s.pos = 1; return end
    end
    finish(); return
  end
  if now - lastSay > 60 then
    lastSay = now
    say(("아이템 읽는 중 · %d / %d (전투 중엔 쉬어요 · 멈추기: /wfh 아이템 멈춤)"):format(math.min(s.pos - 1, #L), #L))
  end
end

local function start(fromLogin)
  local s = state()
  if not GII then say("이 게임에서 아이템 정보를 읽는 기능(GetItemInfo)을 못 찾았어요. Claude에게 알려 주세요."); return end
  if #list() == 0 then say("읽을 아이템 목록이 없어요. 애드온 파일(ItemList.lua)이 빠졌는지 확인해 주세요."); return end
  if s.pos > #list() then s.pos = 1 end
  run = true; s.run = true; s.again = nil; lastSay = GetTime and GetTime() or 0
  pend, npend = {}, 0
  if not ticker and C_Timer and C_Timer.NewTicker then ticker = C_Timer.NewTicker(0.1, function() local ok, e = pcall(tick); if not ok then run = false; say("아이템 읽기 오류로 멈췄어요: " .. tostring(e)) end end) end
  local got, _, n = counts()
  say(("아이템 읽기%s · 이미 읽은 것 %d / %d · 약 %d분 걸려요. 전투 중엔 쉬어요."):format(fromLogin and "를 이어서 해요" or " 시작", got, n, math.max(1, math.floor((n - got) / 8 / 60 + 0.5))))
  say("|cff999999도시·여관처럼 조용한 곳에서 켜 두면 좋아요. 멈추기: /wfh 아이템 멈춤|r")
end

function WowfHelper_ItemScan(arg)
  arg = (arg or ""):gsub("^%s+", ""):gsub("%s+$", "")
  local s, IT, MS = state()
  if arg == "멈춤" or arg == "stop" or arg == "pause" then
    run = false; s.run = false
    local got, _, n = counts()
    say(("아이템 읽기를 멈췄어요 (%d / %d). 이어서 하려면 /wfh 아이템"):format(got, n))
  elseif arg == "처음" or arg == "restart" then
    s.pos = 1; WowfHelperAcc.itMiss = {}
    start()
  elseif arg == "다시" or arg == "again" then
    s.pos = 1; s.redo = true
    say("이미 읽은 아이템을 한 번 더 읽어요 (착용·사용 효과 글 채우기). 2~3분이면 끝나요.")
    start()
  elseif arg == "지우기" or arg == "clear" then
    run = false
    WowfHelperAcc.it, WowfHelperAcc.itMiss, WowfHelperAcc.scan = {}, {}, nil
    say("읽어 둔 아이템을 모두 지웠어요.")
  elseif run then
    local got, miss, n = counts()
    say(("아이템 읽는 중 · 읽음 %d · 못 찾음 %d · 전체 %d"):format(got, miss, n))
  else
    start()
  end
end

-- 접속이 끊겼다 다시 들어오면 이어서 (들어오고 20초 뒤)
local f = CreateFrame("Frame")
f:RegisterEvent("PLAYER_LOGIN")
f:SetScript("OnEvent", function()
  local ok, s = pcall(state)
  if ok and s and s.run and C_Timer and C_Timer.After then
    C_Timer.After(20, function() if not run then start(true) end end)
  end
end)
