import slugify from 'slugify'

export const formatFromStringtoSlug = (str) => {
  return slugify(str, { lower: true, strict: false, locale: 'vi' })
}