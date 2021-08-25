import { useJsonFetch } from '../network/hooks'
import { useMemo } from 'react'

const PriorityLabel = ({ num }) => (
  <h3 className="text-2xl font text-gray-300 bg-gray-700 rounded-md text-center self-start w-12">
    {num}
  </h3>
)

const Tag = ({ className, children }) => (
  <div
    className={`${className} rounded-full py-0.5 px-2 text-xs text-white font-medium tracking-wider bg-opacity-70`}
  >
    {children}
  </div>
)

const WishlistItem = ({
  name,
  priority,
  capsuleUrl,
  currentPrice,
  currentDiscount,
  prerelease,
  earlyAccess,
}) => (
  <li className="flex flex-row p-2 bg-gray-800 rounded-md shadow-lg">
    <PriorityLabel num={priority} />

    <div className="object-fill rounded-lg overflow-hidden ml-2">
      <img src={capsuleUrl} alt="thumbnail" />
    </div>

    <div className="flex flex-col ml-4">
      <div className="flex flex-row space-x-4 items-center self-start">
        <h2 className="text-gray-300 text-xl">{name}</h2>

        <div className="flex flex-row space-x-2">
          {prerelease && <Tag className="bg-yellow-500">Prerelease</Tag>}
          {earlyAccess && <Tag className="bg-blue-500">Early Access</Tag>}
        </div>
      </div>

      <div className="h-full w-10 bg-pink-50 mt-2 opacity-10">
        {/* <p>{currentPrice}</p>
        {currentDiscount > 0 && <p>{currentDiscount}</p>} */}
      </div>
    </div>
  </li>
)

export default function Wishlist() {
  const user = 'jackss14'
  const [pending, wishlist] = useJsonFetch(`wishlist/${user}`)

  const renderedWishlistItems = useMemo(
    () =>
      wishlist?.items
        ?.filter(item => item.priority > 0)
        .map(item => (
          <WishlistItem
            key={item.appId}
            name={item.name}
            priority={item.priority}
            capsuleUrl={item.images.capsule}
            currentPrice={item.price}
            currentDiscount={item.discount}
            prerelease={item.prerelease}
            earlyAccess={item.earlyAccess}
          />
        )),
    [wishlist]
  )

  if (pending) return <p>fetching...</p>

  return (
    <ul className="flex flex-col space-y-2 px-10 py-5">
      {renderedWishlistItems}
    </ul>
  )
}
