/**
 * Registry to e-Mutation pipeline for SmartBhumi.
 *
 * Implements administrative workflow:
 * 1. Upon deed sealing, a mock e-Mutation case is auto-created.
 * 2. Transferred area is placed under `mutation_pending` in the seller's plot share.
 * 3. AC Land (Assistant Commissioner Land) reviews and approves via server-gated authorization.
 * 4. Approval executes an atomic transaction:
 *    - Clears `mutation_pending` and commits to `sold_area`.
 *    - Creates a new Khatian (Record of Rights) for the buyer.
 *    - Creates a new plot_share for the buyer with the mutated area.
 *    - Emits a tamper-evident audit log event.
 */

import { getDb } from './db.js';
import { toMicroShotok, fromMicroShotok } from '../src/shared/units.js';

export interface MutationCase {
  id: string;
  deedId: string;
  deedNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  newKhatianId?: string | null;
  newKhatianNumber?: string | null;
  mutationAreaMicroShotok: number;
  mutationAreaShotok: number;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  casePayload: Record<string, any>;
  createdAt: string;
}

/**
 * Automatically create an e-Mutation case when a deed is sealed.
 * Sets mutation_pending area in the seller's plot share.
 */
export function createMutationCaseForDeed(deedId: string): string {
  const db = getDb();

  const deed = db.prepare('SELECT * FROM deeds WHERE id = ?').get(deedId) as any;
  if (!deed) throw new Error(`Deed not found: ${deedId}`);

  const caseId = `mut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const payload = {
    system: 'SmartBhumi-eMutation-Bridge',
    version: '1.0',
    deedId: deed.id,
    deedNumber: deed.deed_number,
    dagNumber: deed.dag_number,
    mouzaCode: deed.mouza_code,
    sellerKhatian: deed.khatian_number,
    transferAreaMicroShotok: deed.transfer_area,
    transferAreaShotok: fromMicroShotok(deed.transfer_area, 'shotok'),
    buyerNameEn: deed.buyer_name_en,
    buyerNameBn: deed.buyer_name_bn,
    buyerNidMasked: deed.buyer_nid_masked,
    submissionTimestamp: new Date().toISOString(),
    status: 'pending_acland_hearing',
  };

  db.prepare(`
    INSERT INTO mutation_cases (
      id, deed_id, status, mutation_area, case_payload, created_at, updated_at
    ) VALUES (?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))
  `).run(caseId, deedId, deed.transfer_area, JSON.stringify(payload));

  // Place the area in mutation_pending on the plot share
  if (deed.plot_share_id) {
    db.prepare(`
      UPDATE plot_shares
      SET mutation_pending = mutation_pending + ?
      WHERE id = ?
    `).run(deed.transfer_area, deed.plot_share_id);
  }

  // Record audit log
  db.prepare(`
    INSERT INTO audit_log (action, actor_role, actor_id, target_type, target_id, details)
    VALUES ('mutation_case_created', 'system', 'sub_registrar_seal', 'mutation_case', ?, ?)
  `).run(caseId, `e-Mutation case initiated for deed ${deed.deed_number}`);

  return caseId;
}

/**
 * List all mutation cases with optional status filter.
 */
export function listMutationCases(statusFilter?: string): MutationCase[] {
  const db = getDb();
  let query = `
    SELECT m.*, d.deed_number, k.khatian_number as new_khatian_number
    FROM mutation_cases m
    JOIN deeds d ON m.deed_id = d.id
    LEFT JOIN khatians k ON m.new_khatian_id = k.id
  `;
  const params: any[] = [];

  if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
    query += ' WHERE m.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY m.created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(r => ({
    id: r.id,
    deedId: r.deed_id,
    deedNumber: r.deed_number,
    status: r.status,
    newKhatianId: r.new_khatian_id,
    newKhatianNumber: r.new_khatian_number,
    mutationAreaMicroShotok: r.mutation_area,
    mutationAreaShotok: fromMicroShotok(r.mutation_area, 'shotok'),
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    rejectionReason: r.rejection_reason,
    casePayload: JSON.parse(r.case_payload),
    createdAt: r.created_at,
  }));
}

/**
 * Approve a mutation case (AC Land role only).
 * Atomically creates a new Khatian and updates plot shares.
 */
export function approveMutationCase(caseId: string, officerName: string): {
  success: boolean;
  newKhatianNumber: string;
  buyerName: string;
  mutatedAreaShotok: number;
} {
  const db = getDb();

  db.exec('BEGIN IMMEDIATE;');
  try {
    const mCase = db.prepare('SELECT * FROM mutation_cases WHERE id = ?').get(caseId) as any;
    if (!mCase) throw new Error(`Mutation case not found: ${caseId}`);
    if (mCase.status !== 'pending') throw new Error(`Case ${caseId} is already ${mCase.status}`);

    const deed = db.prepare('SELECT * FROM deeds WHERE id = ?').get(mCase.deed_id) as any;
    if (!deed) throw new Error(`Linked deed ${mCase.deed_id} not found`);

    const sellerShare = db.prepare('SELECT * FROM plot_shares WHERE id = ?').get(deed.plot_share_id) as any;
    const sellerKhatian = db.prepare('SELECT * FROM khatians WHERE id = ?').get(sellerShare?.khatian_id) as any;

    // 1. Create a brand new Khatian for the buyer
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newKhatianNumber = `KH-MUT-2026-${randomSuffix}`;
    const newKhatianId = `kh-mut-${Date.now()}`;

    db.prepare(`
      INSERT INTO khatians (
        id, khatian_number, mouza_code, mouza_name_en, mouza_name_bn,
        upazila, district, division, survey_type, owner_name_en, owner_name_bn,
        owner_nid_masked, is_khas, is_frozen, freeze_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'BS', ?, ?, ?, 0, 0, null)
    `).run(
      newKhatianId,
      newKhatianNumber,
      deed.mouza_code,
      sellerKhatian?.mouza_name_en || 'Demo Mouza',
      sellerKhatian?.mouza_name_bn || 'ডেমো মৌজা',
      deed.upazila,
      deed.district,
      deed.division,
      deed.buyer_name_en,
      deed.buyer_name_bn,
      deed.buyer_nid_masked
    );

    // 2. Create plot share for the buyer's new khatian
    const newShareId = `ps-mut-${Date.now()}`;
    db.prepare(`
      INSERT INTO plot_shares (
        id, khatian_id, dag_number, mouza_code,
        total_area, sold_area, mortgaged_area, bainanama_area, mutation_pending
      ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0)
    `).run(
      newShareId,
      newKhatianId,
      deed.dag_number,
      deed.mouza_code,
      mCase.mutation_area
    );

    // 3. Clear mutation_pending on seller's plot share and move to sold_area
    if (sellerShare) {
      db.prepare(`
        UPDATE plot_shares
        SET mutation_pending = mutation_pending - ?,
            sold_area = sold_area + ?
        WHERE id = ?
      `).run(mCase.mutation_area, mCase.mutation_area, sellerShare.id);
    }

    // 4. Mark mutation case approved
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE mutation_cases
      SET status = 'approved', new_khatian_id = ?, approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(newKhatianId, officerName, now, now, caseId);

    // 5. Emit audit trail
    db.prepare(`
      INSERT INTO audit_log (action, actor_role, actor_id, target_type, target_id, details)
      VALUES ('mutation_approved', 'reviewer', ?, 'mutation_case', ?, ?)
    `).run(
      officerName,
      caseId,
      `e-Mutation approved by AC Land. New khatian ${newKhatianNumber} created with ${fromMicroShotok(mCase.mutation_area, 'shotok')} shotok.`
    );

    db.exec('COMMIT;');

    return {
      success: true,
      newKhatianNumber,
      buyerName: deed.buyer_name_en,
      mutatedAreaShotok: fromMicroShotok(mCase.mutation_area, 'shotok'),
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Reject a mutation case (AC Land role only).
 * Releases the mutation_pending area back to the seller.
 */
export function rejectMutationCase(caseId: string, officerName: string, reason: string): { success: boolean } {
  const db = getDb();

  db.exec('BEGIN IMMEDIATE;');
  try {
    const mCase = db.prepare('SELECT * FROM mutation_cases WHERE id = ?').get(caseId) as any;
    if (!mCase) throw new Error(`Mutation case not found: ${caseId}`);
    if (mCase.status !== 'pending') throw new Error(`Case ${caseId} is already ${mCase.status}`);

    const deed = db.prepare('SELECT * FROM deeds WHERE id = ?').get(mCase.deed_id) as any;

    // Release mutation_pending back on seller's share
    if (deed && deed.plot_share_id) {
      db.prepare(`
        UPDATE plot_shares
        SET mutation_pending = mutation_pending - ?
        WHERE id = ?
      `).run(mCase.mutation_area, deed.plot_share_id);
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE mutation_cases
      SET status = 'rejected', rejection_reason = ?, approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(reason, officerName, now, now, caseId);

    db.prepare(`
      INSERT INTO audit_log (action, actor_role, actor_id, target_type, target_id, details)
      VALUES ('mutation_rejected', 'reviewer', ?, 'mutation_case', ?, ?)
    `).run(officerName, caseId, `Mutation rejected by AC Land. Reason: ${reason}`);

    db.exec('COMMIT;');
    return { success: true };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

