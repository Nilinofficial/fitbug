# FitBug

A React Native (Expo) gym workout tracker — log workouts, track personal records and progress, and get a personalized daily calorie/protein target based on your goal.

## Calculations & Algorithms

This app doesn't call out to any external API or AI service for its numbers — every estimate below is computed on-device from your profile and logged workout data, using standard, well-established formulas. None of it is a substitute for medical or professional nutrition/training advice.

### 1. Calories Burned Per Workout

`src/algorithms/calorieAlgorithm.ts`

Uses the **MET (Metabolic Equivalent of Task)** method from the Compendium of Physical Activities. Resistance training is rated at one of three intensity bands depending on how heavy the weight moved was *relative to your own bodyweight* — a proxy for how hard that specific session was for that specific person:

| Intensity | MET  | Trigger (avg weight per rep ÷ bodyweight) |
| --------- | ---- | ------------------------------------------ |
| Light     | 3.5  | < 0.25                                      |
| Moderate  | 5.0  | ≥ 0.25                                      |
| Vigorous  | 6.0  | ≥ 0.5                                       |

**Work time and rest time are tracked and weighted separately.** Each exercise card on the live workout screen has its own independent Workout/Rest toggle, showing two separate running times side by side — tapping one starts (or resumes) accruing seconds into that exercise's own `workSeconds` or `restSeconds`. This exists because a single flat duration can't tell the difference between someone resting 30 seconds between sets and someone resting 2 minutes — less rest means a higher sustained effort level and more calories burned in reality, and only a real work/rest split can capture that. Each card's timers are independent of every other card's — there's no shared "which exercise am I doing right now" state to keep in sync, which was more complexity than it was worth; a card simply doesn't accrue anything until you interact with its own toggle:

```
avgWeightPerRep   = totalVolumeKg / totalReps
relativeIntensity = avgWeightPerRep / bodyWeightKg
workCalories      = workMET × bodyWeightKg × (workSeconds / 3600)
restCalories      = MET_REST × bodyWeightKg × (restSeconds / 3600)      // MET_REST = 2.0, light/seated activity
calories          = workCalories + restCalories
```

`totalVolumeKg` is the sum of `(weight + barWeightKg) × reps` across every set — see "Volume & Bar Weight" below. Calories are computed per exercise instance (own MET tier from its own volume/reps, own work/rest seconds) and summed for workout-level totals, so per-exercise and whole-workout numbers are always consistent with each other.

This does mean the toggle has to be used correctly to be accurate — if you forget to switch it while chatting mid-set, that time gets counted as work. That's a known, accepted tradeoff: a manually-toggled split can be wrong if mismanaged, but it's the only way to make "less rest = more calories" measurable at all, and it's still driven by something you control directly rather than a background clock that can run away unnoticed.

**Backfilled workouts** (logging a past calendar day) skip the live toggle entirely — there's no session happening, so instead you enter a total duration for that session, which gets distributed across the exercises you logged proportional to each one's set count and treated as work time. **Any exercise that predates this feature** (no work/rest data at all) falls back to the original fixed assumption: `totalSets × ASSUMED_SECONDS_PER_SET` (40 seconds/set) treated as pure work time — this fallback (`estimateExerciseCalories` in `src/db/workouts.ts`) is what makes the migration non-destructive; old data keeps producing the exact numbers it always did.

### Volume & Bar Weight

"Volume" (shown per exercise and per workout) is `Σ (weight + barWeightKg) × reps` — not simply the weights added together, but weight moved multiplied by how many times it was moved. Barbell and Smith-machine exercises carry a default 20kg bar weight that's added on top of the plates you log; custom workouts can opt into a bar weight (and a custom default value) via a toggle when creating them, and it's adjustable per-set from the live tracker too. Bar weight factors into volume, calorie, and 1RM calculations, but each set row shown in workout history still displays the raw weight you typed in — the bar is called out once per exercise card instead of being baked into every number.

### 2. Estimated One-Rep Max (1RM) & Progress Charts

`src/algorithms/progressAlgorithm.ts`

Estimated 1RM uses the **Epley formula** — a standard approximation, not a tested max:

```
estimated1RM = weightKg × (1 + reps / 30)   // reps > 1
estimated1RM = weightKg                      // reps === 1
```

For the Progress screen's weekly/monthly charts, sets are bucketed into fixed calendar periods (last 6 weeks or months, zero-filled if empty), and each bucket shows:
- the **best** estimated 1RM achieved in that period, and
- the **total volume** (`Σ weight × reps`) moved in that period.

### 3. Goal: Daily Calorie & Protein Targets

`src/algorithms/goalAlgorithm.ts` — powers the Home "Goal" card and the `/goal` screen.

**Step 1 — BMR (Basal Metabolic Rate)**, via the **Mifflin-St Jeor equation**, from age/height/weight/gender:

```
base = 10 × weightKg + 6.25 × heightCm − 5 × age
BMR  = base + 5      // male
BMR  = base − 161    // female
```

**Step 2 — Activity Level**, derived automatically from your actual logged workout frequency (average sessions/week over the last 4 weeks) — not self-reported:

| Avg workouts/week | Level            | Multiplier |
| ------------------ | ---------------- | ---------- |
| 0                   | Sedentary         | 1.2        |
| 1–2                 | Lightly Active    | 1.375      |
| 3–4                 | Moderately Active | 1.55       |
| 5–6                 | Active            | 1.725      |
| 7+                  | Very Active       | 1.9        |

**Step 3 — TDEE (Total Daily Energy Expenditure)**, i.e. maintenance calories:

```
TDEE = BMR × activity multiplier
```

**Step 4 — Daily calorie target**, TDEE adjusted by a fixed delta per goal (not user-tunable), with a 1200 kcal/day safety floor:

| Goal                        | Daily delta | Rationale |
| ---------------------------- | ----------- | --------- |
| Lose Fat                     | −500 kcal   | ≈ 0.45kg/week loss, a widely-cited safe pace |
| Build Muscle                 | +350 kcal   | Modest surplus to support growth without excess fat gain |
| Lose Fat & Build Muscle (recomp) | −250 kcal | Smaller deficit than a pure cut — a large deficit works against the muscle-building half of this goal |
| Maintain                     | 0           | No change from TDEE |

```
dailyCalorieTarget = max(1200, TDEE + goalDelta)
```

**Step 5 — Protein target**, at 1.8g per kg of current bodyweight — the middle of the commonly-cited 1.6–2.2g/kg range for preserving/building muscle in a deficit or surplus:

```
proteinTargetG = weightKg × 1.8
```

**Step 6 — Estimated timeline**, using the standard approximation that ~7700 kcal ≈ 1kg of body fat. Not shown for "Maintain" (no deficit/surplus driving change) or when current weight is already at target:

```
weightGapKg = |targetWeightKg − currentWeightKg|
weeks       = ceil((weightGapKg × 7700) / (|goalDelta| × 7))
```

**Honest framing note**: the daily calorie target is a *nutrition* number — diet is what drives most of it. The Goal screen also shows how many workout sessions/week (at your own recent average kcal/workout) it would take to close the same gap through exercise alone, explicitly framed as one lever on top of the calorie target rather than a replacement for it.

### 4. Recent Improvements (Personal Records)

`src/db/workouts.ts` (`getExerciseImprovements`)

Rather than ranking by heaviest weight ever lifted for an exercise (which unfairly favors big compound lifts over lighter accessory work), each logged instance of an exercise is compared against the *previous* time that same exercise was logged. If its estimated calories (using the formula above) increased — weight and/or reps went up enough to raise the estimate — it's surfaced as an "improvement." Home shows the most recent one or two; tapping through opens a dedicated page listing all of them, newest first.
