import { toDate, toDateFromNow, toPrice } from '../utility/conversions'

const DiscountTag = ({ discount }) => (
  <p className="bg-green-400 text-green-900 font-medium text-xs rounded-md px-1 py-0.5">
    {`-${Math.round(discount * 100)}%`}
  </p>
)

const Discount = ({ price, discount }) => {
  const original = price / (1 - discount)

  return (
    <div className="flex flex-col items-center text-white">
      <p className="text-4xl">{toPrice(price)}</p>

      <div className="flex flex-row justify-between items-center space-x-2">
        <p className="line-through text-lg opacity-80">{toPrice(original)}</p>
        <DiscountTag discount={discount} />
      </div>
    </div>
  )
}

const Tagged = ({ tag, children }) => (
  <div className="flex flex-col items-center">
    {children}
    <h6 className="mt-0.5 tracking-wider text-pink-300 text-sm text-center font-medium">
      {tag}
    </h6>
  </div>
)

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
  const { lowestPrice, latest, same } = salientDiscounts(priceHistory)

  if (!latest) return <p className="text-white opacity-40">No Sales</p>

  return (
    <Tagged tag={toDateFromNow(latest.time)}>
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
