# Plan: Check-in Feature

## 1. Goal
Add a "check-in" feature to the application as requested in `TODO.md`. The goal is to allow users to "Check in" after reading or listening to a Post, helping them build a habit, track their streak, and share their progress to create a sense of achievement.

## 2. Database Design

### `check_ins` Table
We will create a new `check_ins` table to record each check-in action.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `user_id` | uuid | Foreign Key to `users` |
| `post_id` | uuid | Foreign Key to `posts` |
| `content` | text | (Optional) User's notes or thoughts when checking in |
| `created_at` | datetime | Timestamp of the check-in |
| `updated_at` | datetime | |

**Indexes**:
- `[user_id, post_id]`: Unique index to prevent multiple check-ins for the same post by the same user.
- `[user_id, created_at]`: For fast querying of a user's chronological check-in history to calculate streaks.

### Avoiding Redundant Fields on `users` Table
To avoid adding `check_ins_count`, `current_streak`, or `longest_streak` to the `users` table, we will use **Dynamic Calculation + Caching**:

1.  **On-the-fly Calculation**: We can calculate the total check-ins via `user.check_ins.count`. The streak can be calculated using a fast SQL query or Ruby logic by ordering the user's `check_ins` by date.
2.  **Rails Cache (`Rails.cache`)**: To prevent expensive calculations on every page load, we will cache the user's stats:
    -   Key: `user/{id}/check_in_stats`
    -   Value: `{ total: 10, current_streak: 3, longest_streak: 5, last_check_in_date: '2026-03-02' }`
    -   **Invalidation**: Whenever a user creates a new `CheckIn`, we update or invalidate this cache.
3.  **Redis (Alternative)**: We can use Redis pure counters and bitmaps for even higher performance streak tracking if needed later.

## 3. Implementation Steps

- [ ] Generate `CheckIn` model and migration with the specified fields and indexes.
- [ ] Implement `CheckIn` model logic and validations (e.g., uniqueness per user/post).
- [ ] Implement User instance methods to dynamically calculate and cache streaks/counts.
- [ ] Create the `CheckInsController` with `create` and `destroy` (optional) actions.
- [ ] Build the UI:
  -   Update `Posts#show` with a "Check In" button.
  -   Create a "Check-in completed" state and a shareable Poster generation view.(Add some difference with check-in)
  -   Background use `canvas-confetti` show some congratulations and audio playing.

