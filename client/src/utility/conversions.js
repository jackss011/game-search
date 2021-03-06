import moment from 'moment'

export const toDate = timestamp =>
  new Date(Number(timestamp)).toLocaleDateString()

export const toPrice = value =>
  (Math.round(value * 100) / 100)?.toLocaleString('en-US', {
    minimumFractionDigits: 2,
  }) || null

export const toDateFromNow = timestamp => moment(Number(timestamp)).fromNow()
