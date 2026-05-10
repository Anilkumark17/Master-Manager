/** Methods the model should choose from (TAB 3 — mirror backend prompt). */
export const VALIDATION_METHOD_CATALOG = [
  "User interviews",
  "Fake door tests",
  "Landing page validation",
  "Waitlist testing",
  "Concierge MVP",
  "Manual workflow testing",
  "Prototype testing",
  "Beta groups",
  "Cold outreach",
  "Paid pilot programs",
  "Smoke tests",
  "Community validation",
  "Usability testing",
];

function legacyWateringToDiscovery(wh) {
  if (!wh || typeof wh !== "object") {
    return {};
  }
  const join = (v) =>
    Array.isArray(v) ? v.filter(Boolean).join("; ") : String(v || "");
  return {
    whereTargetUsersNaturallyGather: join(wh.onlineWateringHoles),
    communitiesThatDiscussTheProblem: join(wh.communitiesToObserve),
    platformsWithHighestIntentUsers: join(wh.highIntentUserSources),
    bestCommunitiesForValidation: join(wh.communitiesToEngage),
    spacesWithDecisionMakers: join(wh.validationChannels),
  };
}

/**
 * Normalize one feature plan (new TAB 3 shape + legacy keys from older AI runs).
 * @param {Record<string, unknown>} raw
 */
export function normalizeFeaturePlan(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  let whDisc =
    r.wateringHoleDiscovery && typeof r.wateringHoleDiscovery === "object"
      ? { ...r.wateringHoleDiscovery }
      : {};
  const legacyWh = legacyWateringToDiscovery(r.wateringHoles);
  for (const [k, v] of Object.entries(legacyWh)) {
    if (v && !String(whDisc[k] || "").trim()) {
      whDisc[k] = v;
    }
  }
  const methods = Array.isArray(r.testingMethods)
    ? r.testingMethods.map((x) => String(x))
    : typeof r.testingMethods === "string"
      ? r.testingMethods
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return {
    featureName: String(r.featureName || ""),
    validationExperiments: String(r.validationExperiments || ""),
    assumptionsNeedingProof: String(r.assumptionsNeedingProof || ""),
    testingMethods: methods,
    validationSuccessMetrics: String(
      r.validationSuccessMetrics || r.planSuccessMetrics || ""
    ),
    failureSignals: String(r.failureSignals || ""),
    validationWorkflows: String(r.validationWorkflows || ""),
    validationGoal: String(r.validationGoal || ""),
    coreAssumption: String(r.coreAssumption || ""),
    fastestExperiment: String(r.fastestExperiment || ""),
    recommendedValidationMethod: String(
      r.recommendedValidationMethod || r.recommendedMethod || ""
    ),
    successCriteria: String(r.successCriteria || ""),
    suggestedValidationChannels: Array.isArray(r.suggestedValidationChannels)
      ? r.suggestedValidationChannels.map(String)
      : Array.isArray(r.suggestedChannels)
        ? r.suggestedChannels.map(String)
        : [],
    wateringHoleDiscovery: {
      whereTargetUsersNaturallyGather: String(
        whDisc.whereTargetUsersNaturallyGather || ""
      ),
      communitiesThatDiscussTheProblem: String(
        whDisc.communitiesThatDiscussTheProblem || ""
      ),
      platformsWithHighestIntentUsers: String(
        whDisc.platformsWithHighestIntentUsers || ""
      ),
      bestCommunitiesForValidation: String(
        whDisc.bestCommunitiesForValidation || ""
      ),
      spacesWithDecisionMakers: String(whDisc.spacesWithDecisionMakers || ""),
    },
    validationGuidance:
      r.validationGuidance && typeof r.validationGuidance === "object"
        ? r.validationGuidance
        : {},
  };
}

export const WATERING_HOLE_LABELS = {
  whereTargetUsersNaturallyGather: "Where target users naturally gather",
  communitiesThatDiscussTheProblem: "Communities that discuss the problem",
  platformsWithHighestIntentUsers: "Platforms with highest-intent users",
  bestCommunitiesForValidation: "Best communities for validation",
  spacesWithDecisionMakers: "Spaces with decision-makers",
};
