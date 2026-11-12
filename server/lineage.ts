/**
 * Cadastral Survey Lineage service for SmartBhumi.
 *
 * Tracks the multi-generational survey evolution of plots across:
 * - CS (Cadastral Survey, ~1910-1940)
 * - SA (State Acquisition Survey, ~1956-1962)
 * - RS (Revisional Survey, ~1965-ongoing)
 * - BS (Bangladesh Survey / City Survey)
 *
 * Flags broken chains where a link between historical records is missing
 * or unverified, highlighting potential title tampering or document fraud.
 */

import { getDb } from './db.js';
import { fromMicroShotok } from '../src/shared/units.js';

export interface SurveyRecord {
  id: string;
  dagNumber: string;
  mouzaCode: string;
  surveyType: 'CS' | 'SA' | 'RS' | 'BS';
  khatianNumber: string;
  ownerName: string | null;
  areaMicroShotok: number | null;
  areaShotok: number | null;
  parentId: string | null;
  isBroken: boolean;
  breakReason: string | null;
  createdAt: string;
}

export interface LineageChainResult {
  dagNumber: string;
  mouzaCode?: string;
  isComplete: boolean;
  hasBrokenLinks: boolean;
  chain: SurveyRecord[];
  missingSurveys: string[];
  breakSummary?: string;
}

const SURVEY_ORDER: ('CS' | 'SA' | 'RS' | 'BS')[] = ['CS', 'SA', 'RS', 'BS'];

/**
 * Retrieve the cadastral survey lineage chain for a dagNumber or plotId.
 */
export function getPlotLineage(dagOrPlotId: string): LineageChainResult {
  const db = getDb();

  // If passed a plot_share id, resolve its dag number first
  let dagNumber = dagOrPlotId;
  const share = db.prepare('SELECT dag_number, mouza_code FROM plot_shares WHERE id = ?').get(dagOrPlotId) as any;
  if (share) {
    dagNumber = share.dag_number;
  }

  const rows = db.prepare(`
    SELECT * FROM survey_lineage
    WHERE dag_number = ?
    ORDER BY CASE survey_type
      WHEN 'CS' THEN 1
      WHEN 'SA' THEN 2
      WHEN 'RS' THEN 3
      WHEN 'BS' THEN 4
      ELSE 5
    END ASC
  `).all(dagNumber) as any[];

  if (rows.length === 0) {
    return {
      dagNumber,
      isComplete: false,
      hasBrokenLinks: true,
      chain: [],
      missingSurveys: [...SURVEY_ORDER],
      breakSummary: `No historical survey lineage found for dag ${dagNumber}`,
    };
  }

  const chain: SurveyRecord[] = rows.map(r => ({
    id: r.id,
    dagNumber: r.dag_number,
    mouzaCode: r.mouza_code,
    surveyType: r.survey_type,
    khatianNumber: r.khatian_number,
    ownerName: r.owner_name,
    areaMicroShotok: r.area_micro_shotok,
    areaShotok: r.area_micro_shotok ? fromMicroShotok(r.area_micro_shotok, 'shotok') : null,
    parentId: r.parent_id,
    isBroken: r.is_broken === 1,
    breakReason: r.break_reason,
    createdAt: r.created_at,
  }));

  const presentSurveys = new Set(chain.map(c => c.surveyType));
  
  // Check for internal gaps: e.g. CS and RS present, but SA missing in between
  let hasInternalGap = false;
  let gapReason: string | undefined = undefined;

  if (presentSurveys.has('CS') && presentSurveys.has('RS') && !presentSurveys.has('SA')) {
    hasInternalGap = true;
    gapReason = 'Survey lineage gap: SA survey record missing between CS and RS';
  } else if (presentSurveys.has('SA') && presentSurveys.has('BS') && !presentSurveys.has('RS')) {
    hasInternalGap = true;
    gapReason = 'Survey lineage gap: RS survey record missing between SA and BS';
  }

  const hasBrokenFlag = chain.some(c => c.isBroken);
  const brokenRecord = chain.find(c => c.isBroken);

  let breakSummary: string | undefined = undefined;
  if (brokenRecord && brokenRecord.breakReason) {
    breakSummary = brokenRecord.breakReason;
  } else if (hasInternalGap) {
    breakSummary = gapReason;
  }

  const hasBrokenLinks = hasBrokenFlag || hasInternalGap;

  return {
    dagNumber,
    mouzaCode: chain[0]?.mouzaCode,
    isComplete: !hasBrokenLinks && (presentSurveys.has('RS') || presentSurveys.has('BS')),
    hasBrokenLinks,
    chain,
    missingSurveys: SURVEY_ORDER.filter(s => !presentSurveys.has(s)),
    breakSummary,
  };
}
