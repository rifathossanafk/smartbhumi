/**
 * Faraiz-lite: Simplified Islamic inheritance share calculator.
 *
 * IMPORTANT DISCLAIMERS:
 *   - This is ILLUSTRATIVE ONLY, NOT LEGAL ADVICE.
 *   - Covers only: spouse, parents, sons, daughters.
 *   - Does NOT handle: awl (proportional reduction), radd (redistribution),
 *     Dayabhaga (Hindu law), grandchildren, siblings, uncles, etc.
 *   - Real inheritance must be determined by a qualified lawyer or court.
 *
 * WHY this exists:
 *   Bangladesh land records frequently involve inheritance. This module
 *   shows how shares MIGHT be distributed under simple cases of Muslim
 *   personal law, so users can see a rough breakdown. It must never be
 *   used as the sole basis for any legal decision.
 *
 * All calculations use micro-shotok (integer) to avoid float errors.
 */

export interface FaraizInput {
  /** Total estate area in micro-shotok */
  totalArea: number;
  /** Did the deceased have a surviving spouse? */
  hasSpouse: boolean;
  /** Gender of the deceased ('male' or 'female') */
  deceasedGender: 'male' | 'female';
  /** Is the spouse male or female? (opposite of deceased) */
  spouseGender?: 'male' | 'female';
  /** Does the deceased have a surviving mother? */
  hasMother: boolean;
  /** Does the deceased have a surviving father? */
  hasFather: boolean;
  /** Number of sons */
  numSons: number;
  /** Number of daughters */
  numDaughters: number;
}

export interface FaraizShare {
  heir: string;
  heirBn: string;
  share: number; // micro-shotok
  fraction: string; // human-readable fraction like "1/8"
  explanation: string;
}

export interface FaraizResult {
  shares: FaraizShare[];
  totalDistributed: number;
  remainder: number;
  disclaimer: string;
  disclaimerBn: string;
}

/**
 * Calculate Faraiz inheritance shares.
 *
 * Test case from spec:
 *   48.00 shotok estate, deceased male with wife, mother, father, 1 son, 1 daughter
 *   Expected: wife 6.00, mother 8.00, father 8.00, son 10.40 each (×2 of daughter), daughter 5.20
 *   Wait — let me recalculate with correct rules.
 *
 * Muslim male deceased with: wife, mother, father, 1 son, 1 daughter
 *   - Wife gets 1/8 (because deceased has children) = 48 × 1/8 = 6.00 shotok
 *   - Mother gets 1/6 (because deceased has children) = 48 × 1/6 = 8.00 shotok
 *   - Father gets 1/6 (because deceased has children) = 48 × 1/6 = 8.00 shotok
 *   - Remainder = 48 - 6 - 8 - 8 = 26.00 shotok
 *   - Son gets 2× daughter's share from remainder
 *   - Total parts = 2(son) + 1(daughter) = 3 parts
 *   - Daughter: 26/3 ≈ 8.67 shotok
 *   - Son: 52/3 ≈ 17.33 shotok
 *
 *   Hmm, the spec says son 10.40 and daughter 5.20. Let me recalculate:
 *   If wife 6 + mother 8 + father 8 + son 10.40×2 + daughter 5.20 = 48.4 ≠ 48
 *   Actually spec says "each son 10.40, daughter 5.20" with presumably 2 sons:
 *   6 + 8 + 8 + 10.40 + 10.40 + 5.20 = 48.00 ✓
 *   So: 2 sons + 1 daughter, remainder = 26, parts = 2+2+1 = 5
 *   Each son = 26 × 2/5 = 10.40, daughter = 26 × 1/5 = 5.20 ✓
 */
export function calculateFaraiz(input: FaraizInput): FaraizResult {
  const shares: FaraizShare[] = [];
  let distributed = 0;

  const total = input.totalArea;
  const hasChildren = input.numSons > 0 || input.numDaughters > 0;

  // === SPOUSE SHARE ===
  if (input.hasSpouse) {
    let spouseFraction: number;
    let fractionStr: string;

    if (input.deceasedGender === 'male') {
      // Deceased is male → spouse is wife
      // Wife gets 1/8 if children exist, 1/4 if no children
      spouseFraction = hasChildren ? 1 / 8 : 1 / 4;
      fractionStr = hasChildren ? '1/8' : '1/4';
      const share = Math.round(total * spouseFraction);
      shares.push({
        heir: 'Wife',
        heirBn: 'স্ত্রী',
        share,
        fraction: fractionStr,
        explanation: hasChildren
          ? 'Wife receives 1/8 when the deceased has children'
          : 'Wife receives 1/4 when the deceased has no children',
      });
      distributed += share;
    } else {
      // Deceased is female → spouse is husband
      // Husband gets 1/4 if children exist, 1/2 if no children
      spouseFraction = hasChildren ? 1 / 4 : 1 / 2;
      fractionStr = hasChildren ? '1/4' : '1/2';
      const share = Math.round(total * spouseFraction);
      shares.push({
        heir: 'Husband',
        heirBn: 'স্বামী',
        share,
        fraction: fractionStr,
        explanation: hasChildren
          ? 'Husband receives 1/4 when the deceased has children'
          : 'Husband receives 1/2 when the deceased has no children',
      });
      distributed += share;
    }
  }

  // === MOTHER SHARE ===
  if (input.hasMother) {
    // Mother gets 1/6 if children exist, 1/3 if no children
    const fraction = hasChildren ? 1 / 6 : 1 / 3;
    const fractionStr = hasChildren ? '1/6' : '1/3';
    const share = Math.round(total * fraction);
    shares.push({
      heir: 'Mother',
      heirBn: 'মা',
      share,
      fraction: fractionStr,
      explanation: hasChildren
        ? 'Mother receives 1/6 when the deceased has children'
        : 'Mother receives 1/3 when the deceased has no children',
    });
    distributed += share;
  }

  // === FATHER SHARE ===
  if (input.hasFather) {
    // Father gets 1/6 if children exist (as a fixed share)
    // If no children, father takes remainder as residuary
    if (hasChildren) {
      const share = Math.round(total * (1 / 6));
      shares.push({
        heir: 'Father',
        heirBn: 'বাবা',
        share,
        fraction: '1/6',
        explanation: 'Father receives 1/6 as a fixed share when the deceased has children',
      });
      distributed += share;
    }
    // If no children, father is handled in remainder below
  }

  // === CHILDREN (residuary) ===
  const remainder = total - distributed;

  if (input.numSons > 0 || input.numDaughters > 0) {
    // Sons get 2× daughter's share (2:1 ratio)
    const totalParts = (input.numSons * 2) + input.numDaughters;

    if (totalParts > 0) {
      const perPart = remainder / totalParts;

      for (let i = 0; i < input.numSons; i++) {
        const share = Math.round(perPart * 2);
        shares.push({
          heir: input.numSons > 1 ? `Son ${i + 1}` : 'Son',
          heirBn: input.numSons > 1 ? `পুত্র ${i + 1}` : 'পুত্র',
          share,
          fraction: `2/${totalParts} of remainder`,
          explanation: 'Each son receives twice the share of each daughter from the remainder',
        });
        distributed += share;
      }

      for (let i = 0; i < input.numDaughters; i++) {
        const share = Math.round(perPart);
        shares.push({
          heir: input.numDaughters > 1 ? `Daughter ${i + 1}` : 'Daughter',
          heirBn: input.numDaughters > 1 ? `কন্যা ${i + 1}` : 'কন্যা',
          share,
          fraction: `1/${totalParts} of remainder`,
          explanation: 'Each daughter receives half the share of each son from the remainder',
        });
        distributed += share;
      }
    }
  } else if (input.hasFather && !hasChildren) {
    // Father takes remainder as residuary when no children exist
    shares.push({
      heir: 'Father',
      heirBn: 'বাবা',
      share: remainder,
      fraction: 'residuary',
      explanation: 'Father receives the remainder as residuary heir when there are no children',
    });
    distributed += remainder;
  }

  return {
    shares,
    totalDistributed: distributed,
    remainder: total - distributed,
    disclaimer: 'ILLUSTRATIVE ONLY: This is a simplified calculation covering only spouse, parents, sons, and daughters. It does not handle awl, radd, Dayabhaga, or complex cases. Not legal advice. Consult a qualified lawyer.',
    disclaimerBn: 'শুধুমাত্র উদাহরণমূলক: এটি একটি সরলীকৃত হিসাব যা শুধুমাত্র স্ত্রী/স্বামী, পিতামাতা, পুত্র ও কন্যাকে অন্তর্ভুক্ত করে। আউল, রাদ্দ, দায়ভাগ বা জটিল ক্ষেত্রে প্রযোজ্য নয়। আইনি পরামর্শ নয়। যোগ্য আইনজীবীর সাথে পরামর্শ করুন।',
  };
}

