/**
 * Estimates calories burned during a resistance-training session.
 *
 * This is a heuristic, not a clinical measurement — it uses the standard
 * MET (Metabolic Equivalent of Task) method from the Compendium of Physical
 * Activities, which rates resistance training at roughly:
 *   light effort    ~3.5 MET
 *   moderate effort  ~5.0 MET
 *   vigorous effort  ~6.0 MET
 *
 * The MET band is picked from the average weight moved per rep as a fraction
 * of the user's bodyweight — a simple proxy for how intense the session was
 * relative to that person (heavier relative loads => higher MET).
 *
 * Work time and rest time are tracked and weighted separately: less rest
 * between sets means a higher sustained effort level and more calories
 * burned, which a single flat duration (or a fixed assumption like "40
 * seconds per set") can't distinguish. `workSeconds` gets the intensity-based
 * MET above; `restSeconds` gets a flat, lower MET_REST (light/seated
 * activity). The two are summed. Callers without real timing data (backfilled
 * workouts, pre-migration history) fall back to treating an assumed duration
 * as pure work time with zero rest — see `estimateExerciseCalories` in
 * `src/db/workouts.ts`, which is where that fallback decision lives.
 *
 * calories = (workMET * bodyWeightKg * workHours) + (MET_REST * bodyWeightKg * restHours)
 */

const MET_LIGHT = 3.5;
const MET_MODERATE = 5.0;
const MET_VIGOROUS = 6.0;

const LIGHT_MODERATE_THRESHOLD = 0.25;
const MODERATE_VIGOROUS_THRESHOLD = 0.5;

export const ASSUMED_SECONDS_PER_SET = 40;
export const MET_REST = 2.0;

export type CalorieEstimateInput = {
    totalVolumeKg: number;
    totalReps: number;
    workSeconds: number;
    restSeconds: number;
    bodyWeightKg: number;
};

export const estimateWorkoutCalories = ({
    totalVolumeKg,
    totalReps,
    workSeconds,
    restSeconds,
    bodyWeightKg,
}: CalorieEstimateInput): number => {
    if ((workSeconds <= 0 && restSeconds <= 0) || bodyWeightKg <= 0) return 0;

    const avgWeightPerRep = totalReps > 0 ? totalVolumeKg / totalReps : 0;
    const relativeIntensity = avgWeightPerRep / bodyWeightKg;

    let workMet = MET_LIGHT;
    if (relativeIntensity >= MODERATE_VIGOROUS_THRESHOLD) workMet = MET_VIGOROUS;
    else if (relativeIntensity >= LIGHT_MODERATE_THRESHOLD) workMet = MET_MODERATE;

    const workCalories = workMet * bodyWeightKg * (workSeconds / 3600);
    const restCalories = MET_REST * bodyWeightKg * (restSeconds / 3600);
    return Math.round(workCalories + restCalories);
};
