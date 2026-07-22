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
 * calories = MET * bodyWeightKg * durationHours
 */

const MET_LIGHT = 3.5;
const MET_MODERATE = 5.0;
const MET_VIGOROUS = 6.0;

const LIGHT_MODERATE_THRESHOLD = 0.25;
const MODERATE_VIGOROUS_THRESHOLD = 0.5;

export type CalorieEstimateInput = {
    durationMinutes: number;
    totalVolumeKg: number;
    totalReps: number;
    bodyWeightKg: number;
};

export const estimateWorkoutCalories = ({
    durationMinutes,
    totalVolumeKg,
    totalReps,
    bodyWeightKg,
}: CalorieEstimateInput): number => {
    if (durationMinutes <= 0 || bodyWeightKg <= 0) return 0;

    const avgWeightPerRep = totalReps > 0 ? totalVolumeKg / totalReps : 0;
    const relativeIntensity = avgWeightPerRep / bodyWeightKg;

    let met = MET_LIGHT;
    if (relativeIntensity >= MODERATE_VIGOROUS_THRESHOLD) met = MET_VIGOROUS;
    else if (relativeIntensity >= LIGHT_MODERATE_THRESHOLD) met = MET_MODERATE;

    const durationHours = durationMinutes / 60;
    return Math.round(met * bodyWeightKg * durationHours);
};
