const Proposal= require ("../model/Proposal.model");

/**
 * Weighted scoring:
 * - priceWeight: 0.6 (lower is better)
 * - deliveryWeight: 0.25 (lower days better)
 * - warrantyWeight: 0.15 (longer better)
 */
 const computeScore = (parsed, rfpStructured) => {
  // normalized values
  const price = parsed.totalPrice || Number.POSITIVE_INFINITY;
  const delivery = parsed.deliveryDays ?? 365;
  const warrantyStr = parsed.warranty || "";
  let warrantyYears = 0;
  const m = warrantyStr.match(/(\d+)\s*year/);
  if (m) warrantyYears = Number(m[1]);

  // naive normalizers; in real use compare across proposals
  const priceScore = price === Number.POSITIVE_INFINITY ? 0 : 1 / (1 + Math.log1p(price));
  const deliveryScore = 1 / (1 + Math.log1p(delivery));
  const warrantyScore = Math.tanh(warrantyYears / 2);

  // weights
  const priceW = 0.6, deliveryW = 0.25, warrantyW = 0.15;
  const raw = priceScore * priceW + deliveryScore * deliveryW + warrantyScore * warrantyW;
  const scaled = Math.round(raw * 100); // 0-100
  return scaled;
};

/**
 * Recompute scores for all proposals of a given RFP id
 */
const computeScoresForProposals = async (rfpId) => {
  const proposals = await Proposal.find({ rfp: rfpId });
  for (const p of proposals) {
    const score = computeScore(p.parsed || {}, {});
    p.score = score;
    await p.save();
  }
  return true;
};

module.exports = { computeScoresForProposals };
