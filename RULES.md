# WC Duel 2026 — Rules

Two players split the entire 48-team field into two ownership groups and earn points based on how their teams perform. (Who drafts which team is configured in `src/config.ts`.)

The field is divided between the two "owners".

## Points System
### 1. Standard Points
- 1 point for each team draw.
- 3 points for each team win.
- 0.15 points for each goal scored.
- -0.10 points for each goal conceded.
- 0.5 points for each clean sheet.

### 2. Bonus by multiplier
Bonus multiplier is determined by FIFA World rank differential, calculated as **your team's FIFA rank number − the opponent's FIFA rank number**. Because a smaller number is a better team, only the lower-ranked underdog gets a positive differential and can earn a bonus. A favorite (the higher-ranked team) gets a zero or negative differential and receives no multiplier (Base).

| Rank Difference   | Point Multiplier |
|:------------------| :--- |
| **<= 10**         | **Base (0%)** |
| **11 to 18**      | **+15%** |
| **19 to 26**      | **+25%** |
| **27 to 34**      | **+40%** |
| **35 to 42**      | **+60%** |
| **43 to 50**      | **+80%** |
| **51 or Greater** | **+100% (Cap)** |

### 3. The Final Score Formula
$$\text{Base Score} = \text{Result Pts} + \text{Clean Sheet Pts} + \text{Goals Scored Pts} - \text{Goals Conceded Pts}$$

*   **If Base Score is greater than 0:**  
    $$\text{Final Game Points} = \text{Base Score} + (\text{Multiplier} \times \text{Base Score})$$
*   **If Base Score is 0 or less:**  
    $$\text{Final Game Points} = 0.00$$ *(Game score is capped at zero; no negative points can be earned)*

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
