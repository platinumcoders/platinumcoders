// backend/engine/reasonCodes.js
// Catalog of 16 reason codes and canonical sorting per Appendix A §1.7 & §2.4.

const REASON_CODES = {
  'INCOME-LEVEL': {
    positive: {
      code: 'INCOME-LEVEL-POS',
      label: 'Income level supports repayment capacity',
      polarity: 'positive'
    },
    risk: {
      code: 'INCOME-LEVEL-RISK',
      label: 'Income level is low',
      polarity: 'risk'
    }
  },
  'INCOME-STABILITY': {
    positive: {
      code: 'INCOME-STABILITY-POS',
      label: 'Established income history',
      polarity: 'positive'
    },
    risk: {
      code: 'INCOME-STABILITY-RISK',
      label: 'Short income history',
      polarity: 'risk'
    }
  },
  'INCOME-VOLATILITY': {
    positive: {
      code: 'INCOME-VOLATILITY-POS',
      label: 'Steady month-to-month income',
      polarity: 'positive'
    },
    risk: {
      code: 'INCOME-VOLATILITY-RISK',
      label: 'Irregular month-to-month income',
      polarity: 'risk'
    }
  },
  'CASHFLOW-SURPLUS': {
    positive: {
      code: 'CASHFLOW-SURPLUS-POS',
      label: 'Healthy monthly cash-flow surplus',
      polarity: 'positive'
    },
    risk: {
      code: 'CASHFLOW-SURPLUS-RISK',
      label: 'Little or no monthly cash-flow surplus',
      polarity: 'risk'
    }
  },
  'RENT-CONSISTENCY': {
    positive: {
      code: 'RENT-CONSISTENCY-POS',
      label: 'Consistent on-time rent payments',
      polarity: 'positive'
    },
    risk: {
      code: 'RENT-CONSISTENCY-RISK',
      label: 'Missed or late rent payments',
      polarity: 'risk'
    }
  },
  'UTILITY-CONSISTENCY': {
    positive: {
      code: 'UTILITY-CONSISTENCY-POS',
      label: 'Consistent on-time utility payments',
      polarity: 'positive'
    },
    risk: {
      code: 'UTILITY-CONSISTENCY-RISK',
      label: 'Missed or late utility payments',
      polarity: 'risk'
    }
  },
  'SAVINGS-BUFFER': {
    positive: {
      code: 'SAVINGS-BUFFER-POS',
      label: 'Adequate savings buffer',
      polarity: 'positive'
    },
    risk: {
      code: 'SAVINGS-BUFFER-RISK',
      label: 'Low savings buffer',
      polarity: 'risk'
    }
  },
  'DEBT-BURDEN': {
    positive: {
      code: 'DEBT-BURDEN-POS',
      label: 'Existing obligations are manageable',
      polarity: 'positive'
    },
    risk: {
      code: 'DEBT-BURDEN-RISK',
      label: 'High existing obligation burden',
      polarity: 'risk'
    }
  }
};

function getReasonCode(factor, polarity, points) {
  const normPolarity = polarity.toLowerCase();
  const definition = REASON_CODES[factor]?.[normPolarity];
  if (!definition) {
    throw new Error(`Invalid factor '${factor}' or polarity '${polarity}'.`);
  }
  return {
    code: definition.code,
    label: definition.label,
    polarity: definition.polarity,
    points
  };
}

function sortReasonCodes(reasonCodes) {
  const risks = reasonCodes.filter(rc => rc.polarity === 'risk');
  const positives = reasonCodes.filter(rc => rc.polarity === 'positive');

  // Risks: points ascending, tie-break code ascending
  risks.sort((a, b) => {
    if (a.points !== b.points) {
      return a.points - b.points;
    }
    return a.code.localeCompare(b.code);
  });

  // Positives: points descending, tie-break code ascending
  positives.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return a.code.localeCompare(b.code);
  });

  return [...risks, ...positives];
}

module.exports = {
  REASON_CODES,
  getReasonCode,
  sortReasonCodes
};
