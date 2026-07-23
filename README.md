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

```
avgWeightPerRep   = totalVolumeKg / totalReps
relativeIntensity = avgWeightPerRep / bodyWeightKg
calories          = MET × bodyWeightKg × durationHours
```

`totalVolumeKg` is the sum of `weight × reps` across every set in the workout.

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
