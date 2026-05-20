# Security Specification for Entre-Marés

## Data Invariants
1. A Game must have a valid state and round configuration.
2. Players, Submissions, and Evaluations must be associated with a valid Game document.
3. Players can only modify their own profile and submissions.
4. Only the Professor (conceptually anybody for now since no role-based auth is implemented, but I'll restrict it to "any authenticated user" for prototype) can modify game-wide state.

## Dirty Dozen Payloads
1. **Identity Spoofing**: Student u1 trying to write to `games/game1/players/u2`.
2. **State Shortcutting**: Student trying to change `games/game1` state to `end`.
3. **Resource Poisoning**: Justification string > 1000 characters.
4. **Unauthorized Read**: Student trying to list all games.
5. **Score Manipulation**: Student trying to increment their own score directly.
6. **Evaluation Hijack**: Student trying to write/edit a doc in `evaluations`.
7. **Ghost Field**: Adding `isAdmin: true` to a player document.
8. **Orphaned Submission**: Creating a submission for `games/non-existent`.
9. **Update Gap**: Changing `createdAt` on an existing submission.
10. **Role Escalation**: Trying to delete the `games/game1` document.
11. **ID Poisoning**: Using a 2KB string as a gameId.
12. **PII Leak**: Accessing other players' private data (if any).

## Testing Logic
I will verify that all write attempts from unauthorized users or with invalid data shapes fail.
