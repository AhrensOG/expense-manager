export const formatAmount = (amount) => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${formatted} CHF` : `+${formatted} CHF`;
};

export const formatAmountSimple = (amount) => {
  return `${Math.abs(amount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} CHF`;
};

export const formatAmountCompact = (amount) => {
  const absAmount = Math.abs(amount);
  return `${amount < 0 ? '-' : ''}${absAmount.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatAmountValue = (amount) => {
  return amount.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
