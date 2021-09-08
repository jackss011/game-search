import { toPrice } from '../utility/conversions'

export const SadText = ({ children }) => (
  <p className="text-white opacity-40">{children}</p>
)

export const Spinner = ({ className }) => (
  <div
    className={`${className} m-auto animate-spin bg-white opacity-30 h-16 w-16 rounded-lg`}
  />
)

export const DiscountTag = ({ discount }) => (
  <p className="bg-green-400 text-green-900 font-medium text-xs rounded-md px-1 py-0.5">
    {`-${Math.round(discount * 100)}%`}
  </p>
)

export const Discount = ({ price, discount }) => {
  const original = price / (1 - discount)
  const hasDiscount = discount > 0

  return (
    <div className="flex flex-col items-center text-white">
      <p className="text-4xl">{toPrice(price)}</p>

      {hasDiscount && (
        <div className="flex flex-row justify-between items-center space-x-2">
          <p className="line-through text-lg opacity-80">{toPrice(original)}</p>
          <DiscountTag discount={discount} />
        </div>
      )}
    </div>
  )
}

export const Tagged = ({ tag, children, className }) => {
  if (!tag) return <>{children}</>

  return (
    <div className="flex flex-col items-center">
      {children}
      <h6 className="mt-0.5 tracking-wider text-pink-300 text-sm text-center font-medium">
        {tag}
      </h6>
    </div>
  )
}
