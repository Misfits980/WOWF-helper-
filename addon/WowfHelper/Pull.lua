-- 와포 도우미 · 던전 풀 따라가기 (v4.0)
-- 앱 「던전 → 풀 짜기」의 루트 메뉴 「와포 도우미 애드온으로」 코드(WFP1;…)를 넣으면
-- 화면에 지금 풀(몹 · 남은 수 · 표식)과 다음 풀을 띄우고, 풀 몹이 다 죽으면 저절로 다음 풀로 넘어가요.
-- 몹에 마우스를 올리거나 대상으로 잡으면 앱에서 정한 공격대 표식을 달아 줘요(혼자 · 파티 · 공격대장/부공대장일 때).
-- /wfh 풀          풀 창 켜기/끄기 (넣은 코드가 없으면 넣는 창)
-- /wfh 풀 넣기     앱 풀 코드 붙여 넣기 (/wfh 추천 창에 넣어도 돼요)
-- /wfh 풀 다음 · 이전 · 처음
-- /wfh 풀 표식     표식 달기 켜기/끄기
-- /wfh 풀 지우기   넣어 둔 풀 지우기
-- 코드: WFP1;N:던전 이름;P:풀/풀/…;M:키=이름,…
--   풀 = 몹.몹… · 몹 = 키*마리 수[*표식 숫자들][!(보스)] · 키 = NPC 번호(36진수), _번호 = 번호 없이 이름으로만 맞춤

local PRE = "|cffe8c06a[와포 도우미]|r "
local function say(msg) DEFAULT_CHAT_FRAME:AddMessage(PRE .. msg) end
local function DB() WowfHelperDB = WowfHelperDB or {}; return WowfHelperDB end
local RT = { "별", "동그라미", "다이아몬드", "세모", "달", "네모", "가위표", "해골" }
local function icon(n) return "|TInterface\\TargetingFrame\\UI-RaidTargetingIcon_" .. n .. ":0|t" end
local function norm(s) return ((s or ""):gsub("%s+", ""):lower()) end

-- ===== 코드 읽기 =====
function WowfHelper_PullParse(txt)
  local i = (txt or ""):find("WFP1;", 1, true)
  if not i then return nil end
  txt = txt:sub(i + 5):gsub("[\r\n]", "")
  local S = {}
  for part in txt:gmatch("[^;]+") do
    local k, v = part:match("^(%a):(.*)$")
    if k then S[k] = v end
  end
  if not S.P or S.P == "" then return nil end
  local names = {}
  for kv in (S.M or ""):gmatch("[^,]+") do
    local k, v = kv:match("^([^=]+)=(.+)$")
    if k then names[k] = v end
  end
  local P = {}
  for ps in (S.P .. "/"):gmatch("([^/]*)/") do
    local pull = {}
    for e in ps:gmatch("[^.]+") do
      local boss = e:sub(-1) == "!"
      if boss then e = e:sub(1, -2) end
      local key, c, mk = e:match("^([%w_]+)%*(%d+)%*?(%d*)$")
      if key then
        local x = { k = key, c = tonumber(c) or 1, b = boss or nil, nm = names[key] or key }
        if key:sub(1, 1) ~= "_" then x.id = tonumber(key, 36) end
        if mk ~= "" then
          x.mk = {}
          for d in mk:gmatch("%d") do local n = tonumber(d); if n >= 1 and n <= 8 then x.mk[#x.mk + 1] = n end end
        end
        pull[#pull + 1] = x
      end
    end
    if #pull > 0 then P[#P + 1] = pull end
  end
  if #P == 0 then return nil end
  return { n = S.N or "", p = P }
end

-- ===== 상태 =====
-- D.pull = { n = 던전, p = 풀들, i = 지금 풀, k = { [풀] = { [몹 칸] = 죽은 수 } }, g = { [GUID] = 1 }, mk = { [GUID] = 표식 }, off = 표식 끔 }
local function PL() local d = DB().pull; if d and d.p and #d.p > 0 then return d end end
local frame, lines, render
-- GUID: Creature-0-서버-지도-인스턴스-NPC-스폰 → NPC 번호, 인스턴스 번호(던전 한 판마다 다름)
local function npcOf(guid)
  if not guid or (issecretvalue and issecretvalue(guid)) then return end
  local kind, z, id = guid:match("^(%a+)%-%d+%-%d+%-%d+%-(%d+)%-(%d+)%-")
  if kind == "Creature" or kind == "Vehicle" then return tonumber(id), z end
end
local fresh = true -- 접속·지역 이동 뒤 처음 센 몹이면 새 판인지 봄
local function left(d, pi)
  local pull, K = d.p[pi], d.k[pi] or {}
  local n = 0
  for j, x in ipairs(pull) do n = n + math.max(0, x.c - (K[j] or 0)) end
  return n
end
-- 한글이 반쯤 잘리지 않게 글자 경계에서 자르기
local function cut(s, n)
  if #s <= n then return s end
  local i = n
  while i > 0 do local c = s:byte(i + 1); if not c or c < 128 or c >= 192 then break end; i = i - 1 end
  return s:sub(1, i) .. "..."
end
local function pullText(pull, short)
  local o = {}
  for _, x in ipairs(pull) do o[#o + 1] = (x.b and "|cffff8040" or "") .. x.nm .. (x.c > 1 and (" x" .. x.c) or "") .. (x.b and "|r" or "") end
  local s = table.concat(o, ", ")
  if short then s = cut(s, 60) end
  return s
end

local function setPull(i, quiet)
  local d = PL(); if not d then return end
  i = math.max(1, math.min(i, #d.p))
  d.i = i; d.mk = {}; d.fin = nil
  if not quiet then say(("풀 |cffffd100%d|r / %d · %s"):format(i, #d.p, pullText(d.p[i]))) end
  if render then render() end
end

-- 몹이 죽으면: 지금 풀부터 두 풀 앞까지 자리가 있는 칸에 셈(같이 끌려 온 다음 풀 몹도 셈) → 지금 풀이 다 끝나면 다음 풀로
local function onDeath(guid, name)
  local d = PL(); if not d then return end
  d.g = d.g or {}; d.k = d.k or {}
  if not guid or d.g[guid] then return end
  local id, z = npcOf(guid)
  if not id and not name then return end
  local nn = norm(name)
  -- 같은 던전 새 판(인스턴스 번호가 바뀜): 지난 판 센 수를 비우고 1풀부터 — 예전엔 지난 판 수가 남아 풀이 엉뚱하게 넘어갔음
  if fresh and z then
    local inPlan = false
    for _, pull in ipairs(d.p) do for _, x in ipairs(pull) do if (x.id and x.id == id) or (not x.id and norm(x.nm) == nn) then inPlan = true end end end
    if inPlan then
      fresh = false
      if d.z and d.z ~= z and (next(d.k) or d.fin) then
        d.k = {}; d.g = {}; d.mk = {}; d.i = 1; d.fin = nil
        say("새 판이라 |cffffd1001풀|r부터 다시 셀게요. (/wfh 풀 다음 · 이전 으로 옮기기)")
      end
      d.z = z
    end
  end
  for pi = d.i or 1, math.min(#d.p, (d.i or 1) + 2) do
    local K = d.k[pi] or {}
    for j, x in ipairs(d.p[pi]) do
      local hit = (x.id and id and x.id == id) or (not x.id and nn ~= "" and norm(x.nm) == nn)
      if hit and (K[j] or 0) < x.c then
        K[j] = (K[j] or 0) + 1; d.k[pi] = K; d.g[guid] = 1
        local was = d.i or 1
        while (d.i or 1) <= #d.p and left(d, d.i or 1) == 0 do
          if d.i >= #d.p then
            if not d.fin then d.fin = 1; say("|cff40ff40마지막 풀까지 끝났어요!|r 수고했어요. (/wfh 풀 처음 = 다시)") end
            break
          end
          d.i = d.i + 1; d.mk = {}
        end
        if d.i ~= was then
          say(("풀 %d 끝 → |cffffd100풀 %d|r / %d · %s"):format(was, d.i, #d.p, pullText(d.p[d.i], true)))
          if PlaySound then pcall(PlaySound, 8959) end
        end
        if render then render() end
        return
      end
    end
  end
end

-- ===== 표식 =====
local function canMark()
  if not (SetRaidTarget and GetRaidTargetIndex) then return false end
  if IsInInstance then local inI = IsInInstance(); if not inI then return false end end
  if IsInRaid and IsInRaid() then
    return (UnitIsGroupLeader and UnitIsGroupLeader("player")) or (UnitIsGroupAssistant and UnitIsGroupAssistant("player")) or false
  end
  return true
end
local function tryMark(unit)
  local d = PL(); if not d or d.off then return end
  if not UnitExists(unit) or (UnitIsDead and UnitIsDead(unit)) then return end
  if UnitCanAttack and not UnitCanAttack("player", unit) then return end
  local guid = UnitGUID and UnitGUID(unit); local id = npcOf(guid)
  if not id then return end
  d.mk = d.mk or {}
  if d.mk[guid] or GetRaidTargetIndex(unit) then return end
  if not canMark() then return end
  local used = {}
  for _, m in pairs(d.mk) do used[m] = true end
  for _, x in ipairs(d.p[d.i or 1]) do
    if x.id == id and x.mk then
      for _, m in ipairs(x.mk) do
        if not used[m] then
          SetRaidTarget(unit, m); d.mk[guid] = m
          if render then render() end
          return
        end
      end
    end
  end
end

-- ===== 창 =====
local NL = 9
local function build()
  frame = CreateFrame("Frame", "WowfHelperPullFrame", UIParent)
  frame:SetSize(250, 60); frame:SetPoint("RIGHT", UIParent, "RIGHT", -60, 80)
  frame:SetFrameStrata("MEDIUM"); frame:EnableMouse(true); frame:SetMovable(true); frame:SetClampedToScreen(true)
  frame:RegisterForDrag("LeftButton")
  frame:SetScript("OnDragStart", frame.StartMoving)
  frame:SetScript("OnDragStop", function(f) f:StopMovingOrSizing(); if f.SetUserPlaced then f:SetUserPlaced(true) end end)
  local bg = frame:CreateTexture(nil, "BACKGROUND"); bg:SetAllPoints(); bg:SetColorTexture(0.06, 0.05, 0.04, 0.85)
  frame.title = frame:CreateFontString(nil, "OVERLAY", "GameFontNormal"); frame.title:SetPoint("TOPLEFT", 8, -7); frame.title:SetPoint("RIGHT", -62, 0); frame.title:SetJustifyH("LEFT")
  local function btn(txt, x, fn)
    local b = CreateFrame("Button", nil, frame, "UIPanelButtonTemplate"); b:SetSize(22, 18); b:SetPoint("TOPRIGHT", x, -4); b:SetText(txt); b:SetScript("OnClick", fn); return b
  end
  frame.close = btn("x", -4, function() frame:Hide(); DB().pullHide = true; DB().pullOpen = nil end)
  frame.nx = btn(">", -28, function() local d = PL(); if d then setPull((d.i or 1) + 1) end end)
  frame.pv = btn("<", -52, function() local d = PL(); if d then setPull((d.i or 1) - 1) end end)
  lines = {}
  for i = 1, NL do
    local t = frame:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall")
    t:SetPoint("TOPLEFT", 10, -10 - i * 15); t:SetPoint("RIGHT", -8, 0); t:SetJustifyH("LEFT")
    lines[i] = t
  end
  frame.lines = lines
  frame.next = frame:CreateFontString(nil, "OVERLAY", "GameFontDisableSmall"); frame.next:SetJustifyH("LEFT"); frame.next:SetPoint("RIGHT", -8, 0)
end

render = function()
  if not frame or not frame:IsShown() then return end
  local d = PL()
  if not d then frame:Hide(); return end
  local i = d.i or 1
  local pull, K = d.p[i], (d.k and d.k[i]) or {}
  frame.title:SetText(("풀 |cffffd100%d|r / %d%s"):format(i, #d.p, d.n ~= "" and (" · " .. d.n) or ""))
  local done = {}
  for _, m in pairs(d.mk or {}) do done[m] = true end
  local n = 0
  for j, x in ipairs(pull) do
    if n >= NL - 1 and j < #pull then
      n = n + 1; lines[n]:SetText(("|cff999999외 %d종|r"):format(#pull - j + 1)); break
    end
    n = n + 1
    local ic = ""
    for _, m in ipairs(x.mk or {}) do ic = ic .. icon(m) end
    local got = K[j] or 0
    local st = got >= x.c and "|cff40ff40끝|r" or ("|cffffffff%d|r/%d"):format(x.c - got, x.c)
    lines[n]:SetText(ic .. (ic ~= "" and " " or "") .. (x.b and "|cffff8040" or "") .. x.nm .. (x.b and "|r" or "") .. "  " .. st)
  end
  for j = n + 1, NL do lines[j]:SetText("") end
  local nx = d.p[i + 1]
  frame.next:ClearAllPoints(); frame.next:SetPoint("TOPLEFT", 10, -14 - (n + 1) * 15); frame.next:SetPoint("RIGHT", -8, 0)
  frame.next:SetText(nx and ("다음: " .. pullText(nx, true)) or "마지막 풀이에요")
  frame:SetHeight(36 + (n + 1) * 15)
end

local function show(on)
  if not frame then build() end
  if on then frame:Show(); DB().pullHide = nil; DB().pullOpen = true; render() else frame:Hide(); DB().pullOpen = nil end
end
function WowfHelper_PullShow(on) show(on) end

-- ===== 넣기 =====
function WowfHelper_PullLoad(txt, quiet)
  local p = WowfHelper_PullParse(txt)
  if not p then return false end
  local D = DB()
  D.pull = { n = p.n, p = p.p, i = 1, k = {}, g = {}, mk = {}, off = D.pull and D.pull.off or nil }
  local mobs, bs, mk = 0, 0, 0
  for _, pull in ipairs(p.p) do for _, x in ipairs(pull) do if x.b then bs = bs + 1 else mobs = mobs + x.c end; mk = mk + (x.mk and #x.mk or 0) end end
  if not quiet then
    say(("%s 풀 %d개(몹 %d마리%s%s)를 넣었어요. 몹이 다 죽으면 다음 풀로 넘어가요 · /wfh 풀 = 창 켜고 끄기"):format(p.n ~= "" and p.n or "던전", #p.p, mobs, bs > 0 and (" · 보스 " .. bs) or "", mk > 0 and (" · 표식 " .. mk) or ""))
  end
  show(true)
  return true
end

local box
local function pasteBox()
  if not box then
    box = CreateFrame("Frame", "WowfHelperPullBox", UIParent)
    box:SetSize(420, 150); box:SetPoint("CENTER", 0, 120); box:SetFrameStrata("DIALOG"); box:EnableMouse(true)
    local bg = box:CreateTexture(nil, "BACKGROUND"); bg:SetAllPoints(); bg:SetColorTexture(0.08, 0.07, 0.05, 0.95)
    local t = box:CreateFontString(nil, "OVERLAY", "GameFontNormal"); t:SetPoint("TOPLEFT", 12, -10)
    t:SetText("와포 도우미 · 던전 풀 코드 붙여 넣기 (Ctrl+V → 확인)")
    local close = CreateFrame("Button", nil, box, "UIPanelCloseButton"); close:SetPoint("TOPRIGHT", 2, 2)
    local eb = CreateFrame("EditBox", nil, box, "InputBoxTemplate"); eb:SetSize(380, 24); eb:SetPoint("TOPLEFT", 18, -40); eb:SetAutoFocus(true); eb:SetMaxLetters(0)
    box.eb = eb
    local info = box:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall"); info:SetPoint("TOPLEFT", 14, -76); info:SetPoint("RIGHT", -14, 0); info:SetJustifyH("LEFT")
    info:SetText("앱 「던전 → 풀 짜기」 루트 메뉴(⋯) → 「와포 도우미 애드온으로」의 코드예요.")
    box.info = info
    local ok = CreateFrame("Button", nil, box, "UIPanelButtonTemplate"); ok:SetSize(100, 24); ok:SetPoint("BOTTOMRIGHT", -14, 12); ok:SetText("확인")
    local function apply()
      if WowfHelper_PullLoad(eb:GetText() or "") then box:Hide()
      else info:SetText("|cffff6060WFP1; 로 시작하는 코드가 아니에요.|r 앱 「던전 → 풀 짜기」 루트 메뉴에서 복사해 주세요.") end
    end
    ok:SetScript("OnClick", apply); eb:SetScript("OnEnterPressed", apply); eb:SetScript("OnEscapePressed", function() box:Hide() end)
  end
  box.eb:SetText(""); box:Show(); box.eb:SetFocus()
end
WowfHelper_PullBox = pasteBox

-- ===== 명령 =====
function WowfHelper_PullCmd(arg)
  arg = (arg or ""):gsub("^%s+", ""):gsub("%s+$", "")
  local d = PL()
  if arg == "넣기" or arg == "load" then pasteBox(); return end
  if arg == "지우기" or arg == "clear" then DB().pull = nil; if frame then frame:Hide() end; say("넣어 둔 풀을 지웠어요."); return end
  if not d then say("넣은 풀이 없어요. 앱 「던전 → 풀 짜기」 루트 메뉴 → 「와포 도우미 애드온으로」 코드를 넣어 주세요."); pasteBox(); return end
  if arg == "다음" or arg == "next" then setPull((d.i or 1) + 1); show(true)
  elseif arg == "이전" or arg == "prev" then setPull((d.i or 1) - 1); show(true)
  elseif arg == "처음" or arg == "reset" then d.k = {}; d.g = {}; setPull(1); show(true)
  elseif arg == "표식" or arg == "mark" then
    d.off = not d.off
    say(d.off and "표식 달기를 껐어요." or "표식 달기를 켰어요. 몹에 마우스를 올리면 앱에서 정한 표식을 달아요(공격대에선 공격대장·부공대장만).")
  else show(not (frame and frame:IsShown())) end
end

-- ===== 이벤트 =====
local ev = CreateFrame("Frame")
ev:RegisterEvent("PLAYER_ENTERING_WORLD")
ev:RegisterEvent("COMBAT_LOG_EVENT_UNFILTERED")
ev:RegisterEvent("UPDATE_MOUSEOVER_UNIT")
ev:RegisterEvent("PLAYER_TARGET_CHANGED")
ev:SetScript("OnEvent", function(_, e)
  if e == "COMBAT_LOG_EVENT_UNFILTERED" then
    if not PL() or not CombatLogGetCurrentEventInfo then return end
    local _, sub, _, _, _, _, _, dg, dn = CombatLogGetCurrentEventInfo()
    if sub == "UNIT_DIED" or sub == "PARTY_KILL" then onDeath(dg, dn) end
  elseif e == "UPDATE_MOUSEOVER_UNIT" then tryMark("mouseover")
  elseif e == "PLAYER_TARGET_CHANGED" then tryMark("target")
  elseif e == "PLAYER_ENTERING_WORLD" then
    fresh = true
    local d = PL(); if not d or DB().pullHide then return end
    -- /reload 전에 켜 두었으면 그대로 다시 켬
    if DB().pullOpen then show(true); return end
    -- 넣은 루트의 던전에 들어오면 창을 저절로 띄움
    if GetInstanceInfo and IsInInstance and IsInInstance() then
      local name = GetInstanceInfo()
      local a, b = norm(name), norm(d.n)
      if a ~= "" and b ~= "" and (a == b or a:find(b, 1, true) or b:find(a, 1, true)) then show(true) end
    end
  end
end)
