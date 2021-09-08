import { Discount, SadText, Tagged } from './common'

const normalize = name =>
  name
    // eslint-disable-next-line no-useless-escape
    .replaceAll(/[^\w\s]/g, '')
    .toLowerCase()
    .split(/\s/)
    .filter(s => s.length > 0)
    .join(' ')

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

        if (isNaN(Number(variant))) {
          return { name, ...others, variant }
        }
      }

      return null
    })
    .filter(i => i !== null)

  return { exact, variants }
}

const IgPreview = ({ ig, steamName, steamPrice }) => {
  const notFound = !ig || ig.length <= 0

  if (notFound) return <SadText>Not Found</SadText>

  const { exact, variants } = organizeIgResults(steamName, ig)

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

  let main = null

  if (exact) main = exact
  else if (variants.length === 1) main = variants[0]

  if (main === null) return <SadText>Too much data</SadText>

  return (
    <Tagged tag={main.variant === ''}>
      <Discount price={main.price} discount={null} />
    </Tagged>
  )
}

export default IgPreview
