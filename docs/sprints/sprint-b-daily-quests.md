# Sprint B — Daily Quest System (COMPLETED)

> **Goal**: Give users a reason to open the app every day. AI generates recurring
> daily tasks alongside milestone nodes. Dashboard shows today's quests with
> checkboxes. Tree view shows a quest log overlay. Completing dailies awards XP,
> feeds streaks, and progresses the hero.

## Summary
- 6 tasks (B1–B6), all DONE
- DB tables: daily_quests, daily_quest_completions (unique per quest/user/day)
- AI prompt updated to generate 3-5 daily quests per tree
- Backend: GET /quests/today, POST /{id}/complete (awards XP + streak + level-up), DELETE /{id}/complete
- Frontend types: DailyQuest, DailyQuestCompletionResult
- Vow Chamber: quest checklist below each tree card with optimistic toggle + reset timer
- Tree View: collapsible QuestLogPanel overlay (260px, upper-left)

## Completed
| Task | Description | Date |
|------|-------------|------|
| B1 | DB Migration — Daily Quest Tables | 2026-04-10 |
| B2 | AI Prompt — Generate Daily Quests with Trees | 2026-04-10 |
| B3 | Backend — Daily Quest API Endpoints | 2026-04-10 |
| B4 | Frontend Types & API Client for Daily Quests | 2026-04-10 |
| B5 | Vow Chamber — Daily Quests Below Tree Cards | 2026-04-10 |
| B6 | Tree View — Quest Log Overlay | 2026-04-10 |
