export const toDate = timestamp => new Date(timestamp).toLocaleDateString()

export const toPrice = value =>
  (Math.round(value * 100) / 100)?.toLocaleString('en-US', {
    minimumFractionDigits: 2,
  }) || null
