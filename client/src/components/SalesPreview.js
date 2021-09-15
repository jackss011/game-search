import { toDateFromNow } from '../utility/conversions'
import { Discount, SadText, Tagged } from './common'

function salientDiscounts(priceHistory) {
  const discounts = priceHistory.filter(
    ({ discount, price }) => discount > 0 && price > 0
  )

  if (!discounts || discounts.length <= 0) return {}

  const lowestPrice = discounts.reduce((a, b) => (a.price < b.price ? a : b))
  const latest = discounts[discounts.length - 1]

  return {
    lowestPrice,
    latest,
    same: latest.time === lowestPrice.time,
  }
}

export default function SalesPreview({ priceHistory }) {
  const { latest } = salientDiscounts(priceHistory)

  if (!latest) return <SadText>No Sales</SadText>

  return (
    <Tagged
      tag={toDateFromNow(latest.time)}
      className="text-gray-300 opacity-50 font-medium"
    >
      <Discount price={latest.price} discount={latest.discount / 100} />
    </Tagged>
  )
}

// const Price = ({ value, currency = 'EUR' }) => {
//   const formatter = useMemo(
//     () =>
//       new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency,
//       }),
//     [currency]
//   )

//   return formatter.format(value)
// }
