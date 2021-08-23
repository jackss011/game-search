import { useJsonFetch } from '../network/hooks'
import { useMemo } from 'react'

const WishlistItem = ({
  name,
  priority,
  capsuleUrl,
  currentPrice,
  currentDiscount,
}) => (
  <li>
    <h3>{priority}</h3>
    <h2>{name}</h2>
    <img src={capsuleUrl} alt="thumbnail" />
    <div>
      <p>{currentPrice}</p>
      {currentDiscount > 0 && <p>{currentDiscount}</p>}
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
          />
        )),
    [wishlist]
  )

  if (pending) return <p>fetching...</p>

  return <ul>{renderedWishlistItems}</ul>
}
