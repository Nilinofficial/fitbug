# FitBug — Release Notes

## v1.0.0

### Google Play "What's new" (≤500 characters)

```
Welcome to FitBug 1.0! 🎉

• Track workouts with live set & rep logging
• Build custom workouts — trackable just like presets
• See your progress with 1RM & volume charts
• GitHub-style activity heatmap of your training
• Personalized daily calorie & protein targets based on your goal
• Daily gym reminders
• Light & dark themes
• Export/import your data anytime

Thanks for training with us!
```

### Full changelog

The first full release of FitBug — a gym workout tracker with live set/rep tracking, progress charts, a GitHub-style activity heatmap, and a personalized calorie/protein goal calculator.

### Onboarding
- One-time setup collects username, gender, age, gym time, height/weight, and a fitness goal + target weight — all used to personalize the rest of the app.
- Pick a daily gym time with a custom time picker; FitBug schedules a reminder 15 minutes beforehand.

### Home
- At-a-glance view: days trained this month, a "Start Workout" card, your current goal vs. target weight with today's calorie target, your top personal record, and calories burned today.
- A GitHub-style activity heatmap of the current month, with a "See all" link to the full activity history across every month you've trained.

### Workouts
- Pick from common exercises (Bench Press, Deadlift, Leg Press, Leg Curl, Incline/Decline Chest Press, and more) or your own custom workouts.
- Create custom workouts with a name, icon, and target muscle groups — they're trackable exactly like the built-in exercises, and deletable.
- Live tracking: tap any logged set to edit it (not just the most recent one), type weights/reps directly, add or repeat sets, and delete a set you added by mistake.
- Forgot to log a session? Tap any empty day on the activity heatmap to back-fill a past workout with its own date, start time, and duration.

### History & Workout Details
- Every past workout, grouped by month, with duration, calories, and volume at a glance.
- Tap into any workout for a full exercise-by-exercise, set-by-set breakdown.
- Delete a workout with a confirmation prompt.

### Progress
- Estimated one-rep max and total volume trends per exercise, viewable by week or month.
- Weekly workout frequency chart.
- Calories burned summary for today, this week, and this month.

### Goals & Nutrition
- Set a target weight and a goal — Lose Fat, Build Muscle, Lose Fat & Build Muscle, or Maintain.
- FitBug calculates your BMR, automatically detects your activity level from how often you actually train, and gives you a daily calorie and protein target tailored to your goal — plus an estimated timeline to reach it.
- Full breakdown and editing available any time from Home or Settings.

### Settings
- Edit your name, age, height, weight, and gender at any time.
- Light, dark, or system-matched theme, switchable instantly from Settings — or with a quick tap on the sun/moon icon in the header.
- Daily workout reminders, toggleable, with a permission-aware setup that tells you clearly if notifications are blocked.
- Export or import your full data — profile, workout history, and custom workouts — as a backup file.
- Contact Support: send feedback (bug report, feature request, or general) directly from the app, with your app version and device info attached automatically.

### Under the Hood
- All calorie, 1RM, and goal calculations run entirely on-device (MET-based calorie burn, Epley 1RM formula, Mifflin-St Jeor BMR) — no external service required. Full formulas documented in `README.md`.
- Local SQLite storage; your data never leaves your device except when you explicitly export it.
