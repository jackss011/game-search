import { Discount, NewTabLink, SadText, Tagged } from './common'
import React from 'react'

const romanNumbers = ['i', 'ii', 'iii', 'iv', 'v']
// const romanNumbersReplacer = romanNumbers.map(r => new RegExp(`${r}`))

function replaceRomanNumbers(text) {
  let splits = text.split(' ')

  splits = splits.map(s => {
    const index = romanNumbers.findIndex(roman => roman === s)
    return index >= 0 ? index + 1 : s
  })

  return splits.join(' ')
}

const normalize = name => {
  let res = name
    // eslint-disable-next-line no-useless-escape
    .replaceAll(/[^\w\s]/g, '')
    .toLowerCase()
    .split(/\s/)
    .filter(s => s.length > 0)
    .join(' ')

  return replaceRomanNumbers(res)
}

function isSequel(variant) {
  return !isNaN(Number(variant.split(' ')[0]))
}

//
function organizeIgResults(steamName, results) {
  const steamNameNorm = normalize(steamName)

  const exact = results.find(({ name }) => normalize(name) === steamNameNorm)

  const variants = results
    .map(({ name, ...others }) => {
      const igNameNorm = normalize(name)

      if (igNameNorm !== steamNameNorm && igNameNorm.includes(steamNameNorm)) {
        const variant = igNameNorm.replace(steamNameNorm, '').trim()

        if (variant.length === 0) console.error('Variant error for', steamName)

        if (!isSequel(variant)) {
          return { name, ...others, variant }
        }
      }

      return null
    })
    .filter(i => i !== null)

  return { exact, variants, list: [exact, ...variants] }
}

const Variant = ({ children, className, link }) => (
  <div
    className={`relative p-1 bg-black bg-opacity-10 rounded-lg ${className}`}
  >
    <NewTabLink link={link} srHint="Buy on ig">
      {children}
    </NewTabLink>
  </div>
)

const NUM_VARIANTS = 2

const IgPreview = ({ ig, steamName, steamPrice }) => {
  const notFound = !ig || ig.length <= 0

  if (notFound) return <SadText>Not Found</SadText>

  const { exact, variants, list } = organizeIgResults(steamName, ig)

  if (!exact && variants.length === 0) return <SadText>Not Found</SadText>

  // if (!exact && variants.length <= 0)
  //   console.log(name, { all: ig })
  // if (!exact && variants.length > 1)
  //   console.log(normalize(name), { exact, variants, all: ig })
  // if (exact) console.log(`${exact.name}\n%c${name}`, 'color: yellow')
  // if (variants.length > 2)
  //   console.log(
  //     name,
  //     Boolean(exact),
  //     variants.map(v => v.variant)
  //   )
  //bf33004d
  const collapsedNumber = list.length - (NUM_VARIANTS + 1)

  const renderedVariants = list
    .slice(0, NUM_VARIANTS + 1)
    .filter(x => Boolean(x))
    .map(item => (
      <React.Fragment key={item.variant || 'default'}>
        <Variant className="w-32" link={item.buyLink}>
          <Tagged
            tag={item.variant}
            className="text-gray-300 opacity-70 capitalize"
          >
            <Discount price={item.price} discount={null} zeroText="N/A" />
          </Tagged>
        </Variant>
      </React.Fragment>
    ))

  return (
    <div className="flex flex-row space-x-2">
      {renderedVariants}
      {collapsedNumber > 0 && (
        <Variant className="flex flex-row align-center h-full">
          <p className="text-xl font-medium m-2 opacity-70">
            +{collapsedNumber}
          </p>
        </Variant>
      )}
    </div>
  )
}

export default IgPreview
