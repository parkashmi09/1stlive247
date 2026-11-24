# 1stLive247: client points ka plan

Status: **2026-11-24 update.** Points 2, 4, 5, 7, 9 aur 10 pehle ban chuke the (2026-11-18). 23–24 Nov mein points 3 aur 6 (team logos aur flags 3D) ban gaye, point 1 (3D brand logo) ke 8 samples ready hain, aur client ke kaafi extra points bhi ho gaye (neeche **section 6**). Point 8 (3D score card) ab bhi client ki image ka wait kar raha hai. Backend items B1, B2, B4 pending hain.

**Sab kaam local hai:** abhi tak na commit hua hai, na Vercel par deploy. Client ko dikhane se pehle commit + deploy karna hai (Step 8).

Legend: 🟢 frontend se ho jayega · 🟡 frontend ho jayega, par poora result backend ya client par depend · 🔴 client ke bina start nahi hoga

## 1. Summary

| # | Client point | Status | Kis par depend |
|---|---|---|---|
| 1 | Logos to be change to 3D | 🟡 8 samples ready | Hamari taraf se pick karna hai (`/prototype/logo-3d`), ya client ki 3D file |
| 2 | Upcoming matches pictures to be highlighted | ✅ Done | Client se meaning confirm (C3) |
| 3 | Match showing flags should be in 3D look | ✅ Done (24 Nov) | Banner slider ke flags abhi flat hain |
| 4 | Rearrange: Cricket, Football, Tennis, Horse Racing, others | ✅ Order done | Horse Racing data backend (B1) |
| 5 | In Top Events add Finished | ✅ Section done | Zyada results backend (B2) |
| 6 | Flags need to be in 3D and clear | 🟡 3D done | "Clear" ke liye HD flags ka decision (D1) |
| 7 | Bat and ball icon with present batting | ✅ Done | Kuch nahi |
| 8 | Score card should be shown in 3D | 🔴 Pending | Client: image bhejega (C2). Scoreboard ke team logos 3D ho gaye |
| 9 | Search bar on the top | ✅ Done | Kuch nahi |
| 10 | Filter to filter the sports | ✅ Done | Kuch nahi |

## 2. Frontend steps (is order mein karne hain)

Har step ke baad mobile, tablet aur desktop par browser mein check karna hai, light aur dark dono theme mein.

### Step 1: Sports ka order (point 4)
- `web/src/data/sports.ts:4` mein order: Cricket, Football, Tennis, Horse Racing, Basketball, Kabaddi, F1.
- Label "Racing" ko "Horse Racing" karna hai.
- Home aur Live dono isi list se chalte hain, isliye ek hi jagah change hoga.
- Horse Racing tab abhi khali rahega (B1). Wahan "Coming soon" message dikhana hai, "No events right now" nahi.

**Done jab:** Home aur Live par naya order dikhe, aur Horse Racing tab par Coming soon aaye.

### Step 2: Top Events mein Finished (point 5)
- `web/src/components/home/HomeBoard.tsx:25` par list 30 matches par kat jaati hai, isliye finished matches aksar dikhte hi nahi.
- Top Events ka order: Live, phir Upcoming, phir alag **Finished** section.
- Finished section ki apni limit hogi, taaki upar ki 30 matches ki limit use na kaate.
- Teen tabs (Top Events, Live, Upcoming) waise hi rahenge.

**Done jab:** jis sport mein finished match hai, uske Top Events ke neeche Finished section dikhe. Finished match na ho to section na dikhe.

### Step 3: Bat aur ball icon (point 7)
- Live cricket mein `detail` (overs) sirf batting team par aata hai (`backend/src/feed/cricbuzz.ts:61`), isliye backend change nahi chahiye.
- Batting team ke paas bat icon, bowling team ke paas ball icon.
- Lagana hai: Home card (`match-cards.tsx`), Live row (`LiveList.tsx`), Match Centre header (`match-centre.tsx:10`).
- "At the crease" card (`scorecard.tsx:122`) mein striker ke saath bat aur bowler ke saath ball.
- Demo India v NZ match mein dono teams par `detail` hai, use snapshot mein theek karna hai, warna dono par bat dikhega.

**Done jab:** live cricket match mein sirf batting team par bat dikhe. Upcoming, finished aur doosre sports mein icon na dikhe.

### Step 4: Search bar (point 9)
- Home ke header ke neeche full-width search bar. Desktop par `DesktopNav` (`BottomNav.tsx:61`) mein.
- Naya `/search` page: team name, team code aur league se matches dhundhega, saath mein news titles bhi.
- `chrome.tsx:25` ka search icon abhi galti se `/news` par jaata hai, use `/search` par bhejna hai.
- Khali result par "No matches found" message.

**Limit:** search sirf loaded matches mein hoga. Player ya team pages nahi hain.

**Done jab:** "India" likhne par India ke matches aur news aayein, aur result par tap karne se sahi page khule.

### Step 5: Sports filter (point 10)
- Search bar ke saath filter button. Tap karne par bottom sheet khulegi (desktop par dropdown).
- Sheet mein har sport ke saath match count, aur status (All, Live, Upcoming, Finished).
- Jis sport mein data nahi, wo disabled dikhega.
- Selected filter Home ke sport selector aur tabs ke saath sync rahega.

**Done jab:** filter lagane par list turant badle, aur reset karne par default (Cricket, Top Events) wapas aaye.

### Step 6: 3D flags aur logos (points 3 aur 6) — ✅ done 2026-11-24
- **Jo bana:** 7 samples (`/prototype/team-logo-3d`) mein se "Interactive tilt" chuna gaya. Har team logo/flag ke neeche mota edge + parchhai, halka jhukav, aur ungli/mouse ke saath 3D mein ghoomta hai (`web/src/components/Tilt3D.tsx`).
- **Kahan laga:** `TeamBadge`, `TeamMark`, Match Centre scoreboard — yaani home cards, live card, Live list, scoreboard, H2H, form tables. Scroll block nahi hota.
- **Bacha:** banner slider ke chhote flags (`FeaturedSlider.tsx` ka `Flag`) abhi flat hain. "Clear" wala hissa D1 par atka hai.

Purana plan:
- Ek shared 3D style banana hai: gol glossy shape, upar highlight, andar shading, halka shadow.
- Lagana hai: `TeamBadge` (`ui.tsx:24`), `TeamMark` (`match-cards.tsx:32`), banner ka `Flag` (`FeaturedSlider.tsx:52`).
- Pehle ek sample client ko dikhana hai, approval ke baad sab jagah lagana hai.
- 12 Nov ko cards se shadows hataye the. Shadow sirf flag par rahega, card par nahi.
- **Clear ke liye CSS kaafi nahi hai:** feed ke flags sirf 30×30 px (tennis 48×32 px) ke hain aur 44 px par dikhte hain. Dekhein D1.

**Done jab:** sab screens par flags ek jaise 3D dikhein aur phone par blur na hon.

### Step 7: Upcoming highlight (point 2)
- Default samajh: upcoming match card mein team pictures bade, glow ring ke saath, aur time gold pill mein.
- Change sirf `MatchCard` (`match-cards.tsx:43`) ki upcoming state mein hoga.
- Client ka matlab alag nikla to sirf yahi step badlega (C3).

**Done jab:** Upcoming tab ke cards live aur finished cards se alag aur highlighted dikhein.

### Step 8: Final check aur deploy — ⏳ pending
- `npm test`, type check aur production build chalana hai.
- Snapshot ab nahi hai; site live backend se chalti hai. Vercel Production env mein purana `NEXT_PUBLIC_DATA_SOURCE` hatana hai.
- `web/src/app/prototype/*` (sport-tabs, logo-3d, team-logo-3d) deploy se pehle delete karne hain.
- Deploy user ke OK ke baad hi hoga.

## 3. Backend par depend (baad mein)

| ID | Kaam | Abhi ki halat | Kya karna hai |
|---|---|---|---|
| B1 | Horse Racing data (point 4) | Feed check kiya (2026-11-23): `/upcoming/horse-racing` par ~1,800 events hain, 0 live. Har event ek ghoda hai (sirf `home`, `away` nahi), race ka naam `league` mein. `store.ts:41` inhe skip karta hai | Ghodon ko `league` + start time se group karke "race" banana, phir race-card UI. Result/position fields abhi dekhe nahi (koi finished race nahi thi) |
| B2 | Zyada Finished matches (point 5) | Finished match sirf 3 ghante memory mein rehta hai (`store.ts:154`), restart par khatam | Retention badhana aur database mein save karna. Purane results ke liye API docs check karne hain |
| B3 | Vercel par live data | Done (2026-11-23): browser ki calls Next rewrites se backend tak jaati hain (/api/v1, /sio) | Baad mein backend par HTTPS lagana, taaki proxy ki zaroorat na rahe |
| B4 | F1 aur Kabaddi | Feed check kiya (2026-11-23): `motorsport` aur `kabaddi` dono par 0 live, 0 upcoming | B1 ke saath F1. Data aane par dobara check |

Backend flow: code change, user push karega, server deploy hoga, user batayega, phir testing.

## 4. Client se chahiye (baad mein)

| ID | Point | Kya chahiye |
|---|---|---|
| C1 | 1 | 3D logo: light aur dark theme ke liye, transparent PNG ya SVG, kam se kam 1600 px wide, ratio lagbhag 3.8:1 |
| C2 | 8 | 3D score card ki image, aur kis screen ke liye hai: Home match card, Match Centre header ya full scorecard |
| C3 | 2 | "Pictures" ka matlab: match card ke team logos ya banner images? Reference ho to bhejein |
| C4 | 1 | ~~"Logos" ka matlab~~ — tay ho gaya: point 1 = 1stLive247 brand logo; team logos points 3/6 mein 3D ho gaye |
| C5 | 3, 6 | ~~3D flag ka reference~~ — hamari taraf se "Interactive tilt" chuna; client ko dikha ke confirm karna |
| C6 | 4 | Horse Racing ke baad "others" ka order. Default: Basketball, Kabaddi, F1 |
| C7 | 5 | Finished alag section mein chalega ya alag tab chahiye? Default: section |
| C8 | 10 | Filter sirf sports ka ho ya league aur date bhi? Default: sport aur status |

## 5. Decision pending

**D1: HD flags (points 3 aur 6).** Abhi flags Flashscore se aate hain aur low resolution ke hain.
- **Recommended:** country flags ke liye SVG set app mein bundle karna. Cricket national teams aur tennis players ke flags hamesha sharp dikhenge.
- **Limit:** football aur basketball club crests ka HD source nahi hai, wo 30 px hi rahenge.
- **Kyun poochna hai:** pehle tay hua tha ki remote Flashscore logos hi use karne hain, assets download nahi karne.

## 6. 23–24 Nov mein hamari side se aur kya hua (list se bahar ke client points)

Sab local hai, verify CDP Chrome (402 px mobile) par kiya. Commit/deploy nahi hua.

**Home**
- Sport tabs mein ab har tab ka naam hamesha dikhta hai (pehle sirf selected ka).
- Sport tabs 3D "Gel pill" style mein (10 samples mein se B chuna). Selected tab light theme mein bell wala blue `#1060a0`, dark theme mein cyan. Dark theme mein baaki tabs smoked-glass.
- Gradient gold text poore app se hata diya, ab simple yellow. Finished cards ka "FINAL / RESULT" label light mein kaala, dark mein safed.

**Bottom nav**
- Selected tab ka gradient hata ke flat bell-blue `#1060a0` (dark mein cyan), icon white, icons 24 → 30 px.

**Language switcher + onboarding**
- 6 languages: English, Español, Português, Français, Deutsch, हिन्दी. Saare app ke text (menu, tabs, headings, buttons) translate hote hain. Feed ka data (teams, leagues, news) English mein hi rehta hai.
- Pehli visit par 3-step onboarding (progress bar ke saath): 1) language, 2) sports chuno, 3) default sport. Home hamesha us default sport par khulta hai, aur chune hue sports tabs mein sabse aage aate hain.
- Signup/login abhi nahi hai, isliye ye sab browser (localStorage) mein save hota hai.

**More page (design C chuna)**
- Upar stadium banner, phir profile card, phir Preferences aur Favourites, phir App (Share, About, Privacy & terms).
- Profile: `/more/profile` par photo add/change/remove, naam, email, favourite team. Guest ke liye default avatar.
- Preferences: `/more/preferences` par sports follow/unfollow + "Opens first", language, Light/Dark/Auto theme, notifications switch.
- Share app asli share sheet kholta hai (desktop par link copy).

**Prototypes ready, client/hamara pick baaki**
- `/prototype/logo-3d` — brand logo ke 8 3D looks (point 1). Hamari salah: header ke liye A (Extruded).
- Fall of wickets: 5 designs mein se **B (Run chart)** chuna aur scorecard mein laga diya (24 Nov). Runs ka graph, har wicket pe red ball; tap karne par batsman, over aur partnership.

**Data / feed check**
- Feed mein Sofascore jaisi lagbhag saari categories hain (hockey, volleyball, handball, snooker, darts, baseball, esports…). Sirf Padel aur Minifootball nahi hain. App abhi sirf cricket, football, tennis, basketball dikhata hai. Home-vs-away wale sports jodna aasaan hai (`API_SPORT` + icon + tab).

## 7. Abhi ke khule kaam

| # | Kaam | Kiske paas |
|---|---|---|
| 1 | Brand logo 3D ka letter chunna (point 1) | Hum / client |
| 3 | 3D score card ki image (point 8, C2) | Client |
| 4 | HD flags ka decision (D1) | Hum / client |
| 5 | Horse Racing race-card (B1), zyada finished results (B2) | Backend |
| 6 | Notifications switch asli push se jodna; profile/preferences backend par save (signup ke baad) | Backend |
| 7 | Commit, prototype routes hatana, Vercel deploy | Hum (user ke OK ke baad) |
| 8 | Local dev: `backend/.env` ka `DATABASE_URL` role `score247` Mac par nahi hai (abhi `score247_local` override se chal raha); Mac ka public IP badalne par feed API 403 deti hai — naya IP dono admin panels mein add karna padta hai | Hum / user |
| 9 | News ke kuch articles mein image nahi dikhti (blue box) — check karna baaki | Hum |
