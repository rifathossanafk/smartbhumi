/**
 * Risk assessment rules engine for SmartBhumi.
 *
 * Each rule is a pure function that takes deed/plot data and returns
 * a risk assessment. Rules are explainable: every result includes
 * a human-readable explanation in both Bangla and English.
 *
 * Rules work without legal section numbers. If a rule references
 * a legal concept, it uses a citationId that points to
 * src/shared/citations.ts. The citation is only displayed if
 * verified:true in that file.
 */

export interface RiskResult {
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  explanation_bn: string;
  explanation_en: string;
  citationId: string | null;
}

export interface DeedInput {
  deedType: string;
  transferArea: number; // micro-shotok
  plotTotalArea: number; // micro-shotok
  plotSoldArea: number;
  plotMortgagedArea: number;
  plotBainanama: number;
  plotMutationPending: number;
  isKhas: boolean;
  isFrozen: boolean;
  freezeReason?: string;
  sellerMatchesOwner: boolean;
  hasSurveyLineage: boolean;
  hasBrokenLineage: boolean;
}

/**
 * Run all risk rules against a deed input.
 * Returns all triggered rules, sorted by severity.
 */
export function assessRisks(input: DeedInput): RiskResult[] {
  const results: RiskResult[] = [];

  for (const rule of ALL_RULES) {
    const result = rule(input);
    if (result) results.push(result);
  }

  // Sort by severity: critical first
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return results;
}

// === Individual Rules ===

function ruleKhasLand(input: DeedInput): RiskResult | null {
  if (!input.isKhas) return null;
  return {
    code: 'KHAS_LAND',
    severity: 'critical',
    explanation_bn: 'এই জমি খাস জমি (সরকারি সম্পত্তি)। খাস জমি ব্যক্তিগতভাবে হস্তান্তর বা বিক্রয়যোগ্য নয়।',
    explanation_en: 'This plot is classified as Khas (government) land. Khas land cannot be privately transferred or sold.',
    citationId: 'KHAS_LAND',
  };
}

function ruleFrozenPlot(input: DeedInput): RiskResult | null {
  if (!input.isFrozen) return null;
  return {
    code: 'FROZEN_PLOT',
    severity: 'critical',
    explanation_bn: `এই দাগের রেকর্ড হিমায়িত (ফ্রোজেন) করা হয়েছে। কারণ: ${input.freezeReason || 'অনির্দিষ্ট'}। কোনো লেনদেন সম্ভব নয়।`,
    explanation_en: `This plot record is frozen. Reason: ${input.freezeReason || 'unspecified'}. No transactions are possible.`,
    citationId: null,
  };
}

function ruleInsufficientArea(input: DeedInput): RiskResult | null {
  const available = input.plotTotalArea - input.plotSoldArea - input.plotMortgagedArea
    - input.plotBainanama - input.plotMutationPending;
  if (input.transferArea <= available) return null;
  return {
    code: 'INSUFFICIENT_AREA',
    severity: 'critical',
    explanation_bn: 'হস্তান্তরের জন্য পর্যাপ্ত জমি নেই। ইতোমধ্যে বিক্রিত, বন্ধকী, বা প্রক্রিয়াধীন এলাকা বাদ দিলে পর্যাপ্ত জমি অবশিষ্ট থাকে না।',
    explanation_en: 'Insufficient available area for this transfer. After subtracting sold, mortgaged, bainanama, and mutation-pending area, not enough remains.',
    citationId: 'TPA_1882',
  };
}

function ruleSellerMismatch(input: DeedInput): RiskResult | null {
  if (input.sellerMatchesOwner) return null;
  if (input.deedType === 'inheritance') return null; // inheritance doesn't need seller match
  return {
    code: 'SELLER_OWNER_MISMATCH',
    severity: 'high',
    explanation_bn: 'বিক্রেতার তথ্য খতিয়ানে নিবন্ধিত মালিকের সাথে মিলছে না। এটি প্রতারণামূলক হস্তান্তরের ইঙ্গিত হতে পারে।',
    explanation_en: 'The seller does not match the registered owner in the khatian. This may indicate a fraudulent transfer attempt.',
    citationId: 'TPA_1882',
  };
}

function ruleMortgagedPlot(input: DeedInput): RiskResult | null {
  if (input.plotMortgagedArea <= 0) return null;
  return {
    code: 'MORTGAGED_PLOT',
    severity: 'high',
    explanation_bn: 'এই দাগের কিছু অংশ বন্ধক রয়েছে। বন্ধকমুক্ত না হওয়া পর্যন্ত সেই অংশ হস্তান্তরযোগ্য নয়।',
    explanation_en: 'Part of this plot is under mortgage. The mortgaged portion cannot be transferred until the mortgage is released.',
    citationId: 'TPA_1882',
  };
}

function ruleBrokenLineage(input: DeedInput): RiskResult | null {
  if (!input.hasBrokenLineage) return null;
  return {
    code: 'BROKEN_SURVEY_CHAIN',
    severity: 'high',
    explanation_bn: 'এই দাগের জরিপ ধারাবাহিকতা (CS→SA→RS→BS) ভাঙা। একটি বা একাধিক জরিপ রেকর্ড অনুপস্থিত।',
    explanation_en: 'This plot has a broken survey chain (CS→SA→RS→BS). One or more survey records are missing.',
    citationId: 'SURVEY_CHAIN',
  };
}

function ruleNoLineage(input: DeedInput): RiskResult | null {
  if (input.hasSurveyLineage) return null;
  return {
    code: 'NO_SURVEY_LINEAGE',
    severity: 'medium',
    explanation_bn: 'এই দাগের কোনো জরিপ ইতিহাস (lineage) পাওয়া যায়নি।',
    explanation_en: 'No survey lineage records found for this plot.',
    citationId: 'SURVEY_CHAIN',
  };
}

function ruleLargeTransfer(input: DeedInput): RiskResult | null {
  // Flag if transferring more than 80% of total area
  if (input.transferArea <= input.plotTotalArea * 0.8) return null;
  return {
    code: 'LARGE_TRANSFER',
    severity: 'low',
    explanation_bn: 'এই হস্তান্তরে মোট জমির ৮০% এর বেশি অংশ অন্তর্ভুক্ত। এটি স্বাভাবিক হলেও পর্যালোচনা প্রয়োজন।',
    explanation_en: 'This transfer involves more than 80% of the total plot area. While this may be normal, it warrants review.',
    citationId: null,
  };
}

/** All rules in evaluation order */
const ALL_RULES = [
  ruleKhasLand,
  ruleFrozenPlot,
  ruleInsufficientArea,
  ruleSellerMismatch,
  ruleMortgagedPlot,
  ruleBrokenLineage,
  ruleNoLineage,
  ruleLargeTransfer,
];

