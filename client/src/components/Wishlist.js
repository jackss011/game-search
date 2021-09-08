import { useMemo } from 'react'
import { useJsonFetch } from '../utility/hooks'
import IgPreview from './IgPreview'
import SteamPreview from './SteamPreview'
import SalesPreview from './SalesPreview'

const PriorityLabel = ({ num }) => (
  <h3 className="text-2xl font text-gray-300 bg-gray-700 rounded-md text-center self-start w-12">
    {num}
  </h3>
)

const Capsule = ({ src }) => (
  <div className="object-fill rounded-lg overflow-hidden ml-2 flex-shrink-0">
    <img src={src} alt="thumbnail" />
  </div>
)

const Title = ({ name }) => <h2 className="text-gray-300 text-xl">{name}</h2>

const Tag = ({ className, children }) => (
  <div
    className={`${className} rounded-full py-0.5 px-2 text-xs text-white font-medium tracking-wider bg-opacity-70`}
  >
    {children}
  </div>
)

const TitleWithTags = ({ name, prerelease, earlyAccess }) => (
  <div className="flex flex-row space-x-4 items-center">
    <Title name={name} />
    <div className="flex flex-row space-x-2">
      {prerelease && <Tag className="bg-yellow-500">Prerelease</Tag>}
      {earlyAccess && <Tag className="bg-blue-500">Early Access</Tag>}
    </div>
  </div>
)

const PreviewContainer = ({ children, title, className }) => (
  <div
    className={`${className} bg-opacity-20 rounded-lg flex flex-col items-center px-2 py-1`}
  >
    <h2
      className="text-white opacity-50 tracking-wider font-medium
     uppercase"
    >
      {title}
    </h2>
    <div className="mb-1">{children}</div>
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
  ig,
  priceHistory,
}) => (
  <li className="flex flex-row p-2 bg-gray-800 rounded-md shadow-lg flex-shrink-0">
    <PriorityLabel num={priority} />
    <Capsule src={capsuleUrl} />

    <div className="flex flex-col ml-3 items-start">
      {/* <TitleWithTags
        name={name}
        prerelease={prerelease}
        earlyAccess={earlyAccess}
      /> */}

      <div className="flex flex-row space-x-3 items-start">
        <PreviewContainer title="Steam" className="bg-black w-32">
          <SteamPreview current={currentPrice} discount={currentDiscount} />
        </PreviewContainer>

        <PreviewContainer title="Sales" className="bg-green-800 w-32">
          <SalesPreview priceHistory={priceHistory} />
        </PreviewContainer>

        <PreviewContainer title="IG" className="bg-yellow-700">
          <p className="text-white opacity-40">
            Some text presenting long IG data
          </p>
        </PreviewContainer>
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
            ig={item.ig}
            priceHistory={item.priceHistory}
          />
        )),
    [wishlist]
  )

  return (
    <ul className="flex flex-col space-y-2">
      {!pending ? renderedWishlistItems : <p>fetching...</p>}
    </ul>
  )
}
