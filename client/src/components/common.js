import { toPrice } from '../utility/conversions'
import { useMemo, useState } from 'react'

export const SadText = ({ children }) => (
  <p className="text-white opacity-40">{children}</p>
)

export const Spinner = ({ className }) => (
  <div
    className={`${className} m-auto animate-spin bg-white opacity-30 rounded-lg`}
  />
)

export const NewTabLink = ({ link, children, srHint }) => (
  <a className="" href={link} target="_blank" rel="noreferrer">
    {children}
    <p className="sr-only">{srHint}</p>
  </a>
)

export const DiscountTag = ({ discount }) => (
  <p className="bg-green-400 text-green-900 font-medium text-xs rounded-md px-1 py-0.5">
    {`-${Math.round(discount * 100)}%`}
  </p>
)

export const Discount = ({ price, discount, zeroText }) => {
  const original = price / (1 - discount)
  const hasDiscount = discount > 0

  return (
    <div className="flex flex-col items-center text-white">
      <p className="text-4xl">
        {zeroText && price === 0 ? zeroText : toPrice(price)}
      </p>

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
      <h6 className={`mt-0.5 tracking-wider text-sm text-center ${className}`}>
        {tag}
      </h6>
    </div>
  )
}

export const SearchBar = ({ value, onSearch }) => {
  const [term, setTerm] = useState(value)

  useMemo(() => setTerm(value), [value])

  const onSubmit = event => {
    event?.preventDefault()
    onSearch(term)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-row space-x-2">
      <input type="text" value={term} onChange={e => setTerm(e.target.value)} />
      <input type="submit" value="Go" />
    </form>
  )
}

export const Tag = ({ className, children }) => (
  <div
    className={`${className} rounded-full py-0.5 px-2 text-xs font-medium tracking-wider bg-opacity-90 shadow-md`}
  >
    {children}
  </div>
)
