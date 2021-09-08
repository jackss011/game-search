const IgPreview = ({ ig }) => {
  const first = ig?.[0]

  if (!first) return null

  return (
    <div>
      <p className="text-yellow-500">{first.name}</p>
      <p className="text-yellow-300">{first.price}</p>
    </div>
  )
}

export default IgPreview
