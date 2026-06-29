/**
 * @file src/utils/cn.js
 * @description Lightweight class name merging utility (similar to clsx/twMerge).
 * Merges conditional class strings without pulling in extra dependencies.
 *
 * @example
 * cn('btn', isActive && 'btn-primary', undefined, null, 'extra')
 * // → 'btn btn-primary extra'
 */

/**
 * Merge class name arguments into a single string, filtering falsy values.
 * @param {...(string|boolean|null|undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;
