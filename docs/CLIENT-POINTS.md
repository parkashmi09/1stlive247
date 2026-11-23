# 1stLive247: client points ka plan

Status: **2026-11-18 update.** Points 2, 4, 5, 7, 9 aur 10 frontend mein ban gaye hain. 2026-11-23 se app asli backend API par chalti hai; static snapshot data hata diya gaya. Points 1, 3, 6 aur 8 (logo, flags, image quality, 3D score card) user ke kehne par abhi skip hain. Backend items B1 se B4 pending hain.

Legend: 🟢 frontend se ho jayega · 🟡 frontend ho jayega, par poora result backend ya client par depend · 🔴 client ke bina start nahi hoga

## 1. Summary

| # | Client point | Status | Kis par depend |
|---|---|---|---|
| 1 | Logos to be change to 3D | 🔴 | Client: 3D logo file |
| 2 | Upcoming matches pictures to be highlighted | 🟢 | Client se meaning confirm (C3) |
| 3 | Match showing flags should be in 3D look | 🟢 | Client se sample approve |
| 4 | Rearrange: Cricket, Football, Tennis, Horse Racing, others | 🟡 | Order frontend, Horse Racing data backend (B1) |
| 5 | In Top Events add Finished | 🟡 | Section frontend, zyada results backend (B2) |
| 6 | Flags need to be in 3D and clear | 🟡 | 3D frontend, "clear" ke liye HD flags ka decision (D1) |
| 7 | Bat and ball icon with present batting | 🟢 | Kuch nahi |
| 8 | Score card should be shown in 3D | 🔴 | Client: image bhejega |
| 9 | Search bar on the top | 🟢 | Kuch nahi |
| 10 | Filter to filter the sports | 🟢 | Kuch nahi |

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

### Step 6: 3D flags aur logos (points 3 aur 6)
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

### Step 8: Final check aur deploy
- `npm test`, type check aur production build chalana hai.
- Snapshot refresh karna hai, kyunki site par abhi 11 Nov ka data hai.
- Deploy user ke OK ke baad hi hoga.

## 3. Backend par depend (baad mein)

| ID | Kaam | Abhi ki halat | Kya karna hai |
|---|---|---|---|
| B1 | Horse Racing data (point 4) | `backend/src/feed/store.ts:41` race events skip karta hai, kyunki unmein home/away nahi hota | Pehle check ki feed kya data deta hai, phir race data model, API aur race-card UI |
| B2 | Zyada Finished matches (point 5) | Finished match sirf 3 ghante memory mein rehta hai (`store.ts:154`), restart par khatam | Retention badhana aur database mein save karna. Purane results ke liye API docs check karne hain |
| B3 | Vercel par live data | Done (2026-11-23): browser ki calls Next rewrites se backend tak jaati hain (/api/v1, /sio) | Baad mein backend par HTTPS lagana, taaki proxy ki zaroorat na rahe |
| B4 | F1 aur Kabaddi | F1 bhi race format ki wajah se skip hota hai, Kabaddi ka abhi koi match nahi aa raha | B1 ke saath F1. Kabaddi feed check karni hai |

Backend flow: code change, user push karega, server deploy hoga, user batayega, phir testing.

## 4. Client se chahiye (baad mein)

| ID | Point | Kya chahiye |
|---|---|---|
| C1 | 1 | 3D logo: light aur dark theme ke liye, transparent PNG ya SVG, kam se kam 1600 px wide, ratio lagbhag 3.8:1 |
| C2 | 8 | 3D score card ki image, aur kis screen ke liye hai: Home match card, Match Centre header ya full scorecard |
| C3 | 2 | "Pictures" ka matlab: match card ke team logos ya banner images? Reference ho to bhejein |
| C4 | 1 | "Logos" ka matlab: sirf 1stLive247 ka logo, ya team logos bhi? |
| C5 | 3, 6 | 3D flag ka reference, ya hamara sample approve karein |
| C6 | 4 | Horse Racing ke baad "others" ka order. Default: Basketball, Kabaddi, F1 |
| C7 | 5 | Finished alag section mein chalega ya alag tab chahiye? Default: section |
| C8 | 10 | Filter sirf sports ka ho ya league aur date bhi? Default: sport aur status |

## 5. Decision pending

**D1: HD flags (points 3 aur 6).** Abhi flags Flashscore se aate hain aur low resolution ke hain.
- **Recommended:** country flags ke liye SVG set app mein bundle karna. Cricket national teams aur tennis players ke flags hamesha sharp dikhenge.
- **Limit:** football aur basketball club crests ka HD source nahi hai, wo 30 px hi rahenge.
- **Kyun poochna hai:** pehle tay hua tha ki remote Flashscore logos hi use karne hain, assets download nahi karne.
