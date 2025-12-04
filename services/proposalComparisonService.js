const { parseVendorResponse } = require("./aiService.js");

const compareProposals = async (rfpId) => {
  try {
    // Validate input
    if (!rfpId || rfpId === "undefined" || rfpId === "null") {
      throw new Error("Invalid RFP ID provided");
    }

    const Proposal = require("../model/Proposal.model");
    const Rfp = require("../model/Rfp.model");
    const Vendor = require("../model/Vendor.model");

    // Get RFP details
    const rfp = await Rfp.findById(rfpId);
    if (!rfp) {
      throw new Error("RFP not found");
    }

    // Get all proposals for this RFP with vendor details
    const proposals = await Proposal.find({ rfp: rfpId })
      .populate("vendor", "name email contact")
      .sort({ createdAt: -1 });

    if (proposals.length === 0) {
      return {
        rfp: {
          title: rfp.title,
          description: rfp.description,
          requirements: rfp.structured
        },
        comparison: {
          totalProposals: 0,
          vendors: [],
          aiRecommendation: "No proposals received yet for comparison."
        }
      };
    }

    // Prepare comparison data
    const comparisonData = {
      rfp: {
        title: rfp.title,
        description: rfp.description,
        requirements: rfp.structured,
        budget: rfp.structured?.budget,
        deliveryDays: rfp.structured?.deliveryDays,
        paymentTerms: rfp.structured?.paymentTerms,
        warranty: rfp.structured?.warranty
      },
      proposals: proposals.map(proposal => ({
        vendor: proposal.vendor,
        totalPrice: proposal.parsed?.totalPrice || 0,
        deliveryDays: proposal.parsed?.deliveryDays || 0,
        paymentTerms: proposal.parsed?.paymentTerms || "Not specified",
        warranty: proposal.parsed?.warranty || "Not specified",
        lineItems: proposal.parsed?.lineItems || [],
        additionalNotes: proposal.aiSummary || "",
        completeness: proposal.completeness || 0,
        score: proposal.score || 0,
        submittedAt: proposal.createdAt
      }))
    };

    // Generate AI comparison and recommendation
    const aiAnalysis = await generateAIComparison(comparisonData);

    // Calculate scoring metrics
    const scoredProposals = await calculateProposalScores(comparisonData);

    return {
      rfp: comparisonData.rfp,
      comparison: {
        totalProposals: proposals.length,
        vendors: scoredProposals,
        aiRecommendation: aiAnalysis.recommendation,
        aiSummary: aiAnalysis.summary,
        keyFactors: aiAnalysis.keyFactors,
        riskAnalysis: aiAnalysis.riskAnalysis
      }
    };

  } catch (error) {
    console.error("Error in proposal comparison:", error);
    throw error;
  }
};

const generateAIComparison = async (comparisonData) => {
  try {
    // Create comparison prompt for AI
    const prompt = `
Compare the following vendor proposals for an RFP and provide a recommendation:

RFP Details:
- Title: ${comparisonData.rfp.title}
- Budget: $${comparisonData.rfp.budget || 'Not specified'}
- Required Delivery: ${comparisonData.rfp.deliveryDays || 'Not specified'} days
- Payment Terms: ${comparisonData.rfp.paymentTerms || 'Not specified'}
- Warranty: ${comparisonData.rfp.warranty || 'Not specified'}

Vendor Proposals:
${comparisonData.proposals.map((proposal, index) => `
Vendor ${index + 1}: ${proposal.vendor.name}
- Total Price: $${proposal.totalPrice}
- Delivery: ${proposal.deliveryDays} days
- Payment Terms: ${proposal.paymentTerms}
- Warranty: ${proposal.warranty}
- Items: ${proposal.lineItems.length} items proposed
- Completeness Score: ${proposal.completeness}%
- Current Score: ${proposal.score}/100
- Notes: ${proposal.additionalNotes}
`).join('\n')}

Please provide:
1. A summary comparison of all proposals
2. Key factors to consider (price, delivery, terms, completeness)
3. Risk analysis for each vendor
4. A clear recommendation on which vendor to choose and why
5. Any concerns or red flags

Format your response as JSON with keys: summary, keyFactors, riskAnalysis, recommendation
`;

    // Use existing AI service to analyze
    const aiResponse = await parseVendorResponse(prompt, [], comparisonData.rfp.requirements);
    
    // Parse the AI response
    let analysis = {
      summary: "AI analysis not available",
      keyFactors: ["Price", "Delivery Time", "Payment Terms", "Completeness"],
      riskAnalysis: "Risk analysis not available",
      recommendation: "Manual review recommended"
    };

    try {
      // Try to parse AI response as JSON
      if (aiResponse.summary) {
        analysis.summary = aiResponse.summary;
      }
      if (aiResponse.keyFactors) {
        analysis.keyFactors = Array.isArray(aiResponse.keyFactors) ? aiResponse.keyFactors : [aiResponse.keyFactors];
      }
      if (aiResponse.riskAnalysis) {
        analysis.riskAnalysis = aiResponse.riskAnalysis;
      }
      if (aiResponse.recommendation) {
        analysis.recommendation = aiResponse.recommendation;
      }
    } catch (parseError) {
      console.log("Could not parse AI response, using defaults");
    }

    return analysis;

  } catch (error) {
    console.error("Error generating AI comparison:", error);
    return {
      summary: "AI comparison not available",
      keyFactors: ["Price", "Delivery Time", "Payment Terms", "Completeness"],
      riskAnalysis: "Manual risk assessment recommended",
      recommendation: "Review all proposals manually"
    };
  }
};

const calculateProposalScores = (comparisonData) => {
  const budget = comparisonData.rfp.budget || Number.MAX_SAFE_INTEGER;
  const requiredDelivery = comparisonData.rfp.deliveryDays || Number.MAX_SAFE_INTEGER;

  return comparisonData.proposals.map(proposal => {
    let score = 0;
    let maxScore = 100;

    // Price scoring (40% weight)
    const priceScore = proposal.totalPrice <= budget ? 40 : Math.max(0, 40 - ((proposal.totalPrice - budget) / budget) * 40);
    score += priceScore;

    // Delivery scoring (25% weight)
    const deliveryScore = proposal.deliveryDays <= requiredDelivery ? 25 : Math.max(0, 25 - ((proposal.deliveryDays - requiredDelivery) / requiredDelivery) * 25);
    score += deliveryScore;

    // Completeness scoring (20% weight)
    const completenessScore = (proposal.completeness / 100) * 20;
    score += completenessScore;

    // Terms matching (15% weight)
    let termsScore = 15;
    if (comparisonData.rfp.paymentTerms && proposal.paymentTerms !== comparisonData.rfp.paymentTerms) {
      termsScore -= 5;
    }
    if (comparisonData.rfp.warranty && proposal.warranty !== comparisonData.rfp.warranty) {
      termsScore -= 5;
    }
    score += Math.max(0, termsScore);

    return {
      ...proposal,
      calculatedScore: Math.round(score),
      priceScore: Math.round(priceScore),
      deliveryScore: Math.round(deliveryScore),
      completenessScore: Math.round(completenessScore),
      termsScore: Math.round(termsScore),
      rank: 0 // Will be set after sorting
    };
  }).sort((a, b) => b.calculatedScore - a.calculatedScore)
    .map((proposal, index) => ({
      ...proposal,
      rank: index + 1
    }));
};

module.exports = { compareProposals };
