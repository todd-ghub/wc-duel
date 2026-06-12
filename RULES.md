# World Cup Draft — Scoring Rules

## Setup
- Split all 48 World Cup teams between 2 players (24 each).
- Every team scores points each match based on **Result + Attack + Defense**, then adjusted by a **rank-based multiplier**.

## The Formula

**Match Score = (Result + Attack + Defense) × Rank Multiplier**

Minimum score per match is **0** (a match can never go negative).

---

### 1. Result
| Outcome | Points |
|---|---|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |

### 2. Attack — goals scored (diminishing)
| Goal | Points |
|---|---|
| 1st goal | 0.50 |
| 2nd goal | 0.25 |
| 3rd goal | 0.15 |
| 4th+ goal | 0.10 each |

*Running totals: 1 goal = 0.50 · 2 = 0.75 · 3 = 0.90 · 4 = 1.00 · 5 = 1.10*

### 3. Defense — goals conceded
| Conceded | Points |
|---|---|
| 0 | 0.50 |
| 1 | 0.25 |
| 2 | 0.12 |
| 3+ | 0 |

### 4. Rank Multiplier
Use the FIFA rank difference between the two teams. The **lower-ranked** team is the underdog (boost); the **higher-ranked** team is the favorite (discount). Apply the multiplier to the full match total.

| Rank Difference | Underdog | Favorite |
|-----------------|---|----------|
| ≤ 10            | ×1.00 | ×1.00    |
| 11–20           | ×1.15 | ×0.95    |
| 21–35           | ×1.25 | ×0.85    |
| 36–55           | ×1.40 | ×0.75    |
| 56–75           | ×1.60 | ×0.65    |
| 75+             | ×1.80 | ×0.55    |

---

## Quick Reference Card
- **Win 3 / Draw 1 / Loss 0**
- **Goals:** 0.50, 0.25, 0.15, then 0.10 each
- **Clean sheet 0.50 / conceded 1 → 0.25 / 2 → 0.12 / 3+ → 0**
- **Multiply by rank table, floor at 0**

## Official Tournament Field & Rosters (Ordered by FIFA Rank)

| Rank | Country | Owner |
| :--- | :--- | :--- |
| **#1** | France | PLAYER2 |
| **#2** | Spain | PLAYER2 |
| **#3** | Argentina | PLAYER2 |
| **#4** | England | PLAYER2 |
| **#5** | Portugal | PLAYER1 |
| **#6** | Brazil | PLAYER1 |
| **#7** | Netherlands | PLAYER1 |
| **#8** | Morocco | PLAYER1 |
| **#9** | Belgium | PLAYER1 |
| **#10** | Germany | PLAYER1 |
| **#11** | Croatia | PLAYER1 |
| **#13** | Colombia | PLAYER1 |
| **#14** | Senegal | PLAYER2 |
| **#15** | Mexico | PLAYER2 |
| **#16** | United States | PLAYER1 |
| **#17** | Uruguay | PLAYER2 |
| **#18** | Japan | PLAYER1 |
| **#19** | Switzerland | PLAYER1 |
| **#21** | IR Iran | PLAYER1 |
| **#22** | Türkiye | PLAYER2 |
| **#23** | Ecuador | PLAYER1 |
| **#24** | Austria | PLAYER1 |
| **#25** | South Korea | PLAYER1 |
| **#27** | Australia | PLAYER2 |
| **#28** | Algeria | PLAYER2 |
| **#29** | Egypt | PLAYER2 |
| **#30** | Canada | PLAYER2 |
| **#31** | Norway | PLAYER2 |
| **#33** | Panama | PLAYER2 |
| **#34** | Côte d'Ivoire (Ivory Coast) | PLAYER1 |
| **#38** | Sweden | PLAYER1 |
| **#40** | Paraguay | PLAYER2 |
| **#41** | Czechia | PLAYER1 |
| **#43** | Scotland | PLAYER2 |
| **#44** | Tunisia | PLAYER2 |
| **#46** | DR Congo | PLAYER1 |
| **#50** | Uzbekistan | PLAYER2 |
| **#55** | Qatar | PLAYER2 |
| **#57** | Iraq | PLAYER2 |
| **#60** | South Africa | PLAYER2 |
| **#61** | Saudi Arabia | PLAYER1 |
| **#63** | Jordan | PLAYER2 |
| **#65** | Bosnia & Herzegovina | PLAYER1 |
| **#69** | Cabo Verde (Cape Verde) | PLAYER2 |
| **#74** | Ghana | PLAYER1 |
| **#82** | Curaçao | PLAYER2 |
| **#83** | Haiti | PLAYER1 |
| **#85** | New Zealand | PLAYER2 |
