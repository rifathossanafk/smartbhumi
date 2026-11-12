/**
 * Legal citations registry.
 *
 * All legal references live here. Rules and explanations work
 * without section numbers. A citation is only shown in the UI
 * when verified:true (the team checks on bdlaws.minlaw.gov.bd).
 *
 * IMPORTANT: Do not display any citation with verified:false
 * in any user-facing output. They are here for reference only.
 */

export interface LegalCitation {
  /** Unique identifier for referencing from rules */
  id: string;
  /** The citation text */
  text: string;
  /** Source document name */
  source: string;
  /**
   * Has this citation been manually verified on bdlaws.minlaw.gov.bd?
   * Only show in UI if true.
   */
  verified: false;
}

export const CITATIONS: LegalCitation[] = [
  {
    id: 'TPA_1882',
    text: 'Transfer of Property Act, 1882 — governs transfer of immovable property including sale, mortgage, gift, exchange, and lease.',
    source: 'Transfer of Property Act, 1882',
    verified: false,
  },
  {
    id: 'REG_ACT_1908',
    text: 'Registration Act, 1908 — requires registration of documents affecting immovable property exceeding a certain value.',
    source: 'Registration Act, 1908',
    verified: false,
  },
  {
    id: 'SAT_ACT_1950',
    text: 'State Acquisition and Tenancy Act, 1950 — abolished zamindari system, established direct relationship between state and raiyat (tenant).',
    source: 'State Acquisition and Tenancy Act, 1950',
    verified: false,
  },
  {
    id: 'MUTATION_RULES',
    text: 'Land mutation is an administrative record update in the khatian (Record of Rights). It does not create or prove title — it updates revenue records to reflect a reported change in possession.',
    source: 'Revenue administration practice',
    verified: false,
  },
  {
    id: 'MUSLIM_INHERITANCE',
    text: 'Muslim personal law of inheritance (Faraiz) governs distribution of a deceased Muslim\'s estate among legal heirs. Shares are fixed by law for spouse, parents, sons, and daughters.',
    source: 'Muslim Personal Law (Shariat) Application Act, 1937',
    verified: false,
  },
  {
    id: 'KHAS_LAND',
    text: 'Khas land (খাস জমি) is government-owned land. It cannot be privately sold or transferred. Unauthorized occupation is an offense.',
    source: 'Government land management rules',
    verified: false,
  },
  {
    id: 'DIGITAL_SIGNATURE',
    text: 'A digital signature on a deed record shows it was registered in this system and has not been altered since registration. It does not prove title, identity, or legal authority. Deed execution still requires physical presence before the Sub-Registrar.',
    source: 'SmartBhumi system documentation',
    verified: false,
  },
  {
    id: 'SURVEY_CHAIN',
    text: 'Bangladesh cadastral surveys: CS (Cadastral Survey, ~1910-1940), SA (State Acquisition Survey, ~1956-1962), RS (Revisional Survey, ~1965-ongoing), BS (Bangladesh Survey / City Survey). Each survey records the state of land at that time.',
    source: 'DLRS survey documentation',
    verified: false,
  },
];

/**
 * Look up a citation by id. Returns undefined if not found.
 */
export function getCitation(id: string): LegalCitation | undefined {
  return CITATIONS.find(c => c.id === id);
}

