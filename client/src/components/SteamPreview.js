import { Discount, NewTabLink, SadText } from './common'

const SteamPreview = ({ current, discount, appId }) => {
  return (
    <NewTabLink link={`https://store.steampowered.com/app/${appId}`}>
      {current === null || isNaN(current) ? (
        <SadText>Not Available</SadText>
      ) : (
        <Discount price={current} discount={discount} />
      )}
    </NewTabLink>
  )
}

export default SteamPreview

// const original = current / (1 - discount)

// return (
//   <div className="flex flex-col space-y-1">
//     {/* <Price
//       className={discount > 0 ? 'text-green-300' : 'text-white'}
//       price={current}
//     />
//     {discount > 0 && <DiscountTag discount={discount} />} */}
//     {/* {discount > 0 && (
//       <Price price={original} className="text-gray-500 line-through" />
//     )} */}
//   </div>
// )
// }

// const DiscountTag = ({ discount }) => (
//   <p className="bg-green-400 text-green-900 font-medium text-center text-md rounded-md">
//     {`-${Math.round(discount * 100)}%`}
//   </p>
// )

// const Price = ({ price, className }) => (
//   <p className={`text-white text-4xl tracking-wide ${className}`}>
//     {toPrice(price)}
//   </p>
// )
