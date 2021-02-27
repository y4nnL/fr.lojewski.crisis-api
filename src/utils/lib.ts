export const StringUnion = <T extends string>(...values: T[]) => {
  Object.freeze(values)
  
  const valueSet: Set<string> = new Set(values)
  const narrow = (value: string): value is T => valueSet.has(value)
  const union = { narrow, values }
  
  return Object.freeze(union as typeof union & { type: T })
}
