export function deepCopy(inObject) {

  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value)
  }

  return outObject

}

export function downloadFile(content, type, fileName) {
  const file = new Blob([content], {type: type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

/**
 * Get a random integer between `min` (inclusive) and `max` (exclusive).
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Return a string where str is padded with a character x number of times.
 */
export function pad(str, x, char = '0') {
  str = str + ''; // Ensure a string;
  return str.length >= x ? str : new Array(x - str.length + 1).join(char) + str;
}

/**
 * Return true if the given arrays are the same.
 */
export function areArraysIdentical(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function makeSvg(viewbox, classes, html) {

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewbox);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.innerHTML = html;
  classes.forEach(c => {
    svg.classList.add(c);
  });
  return svg;

}

// Wrapper for `setTimeout` that can be awaited.
// Resolve after a certain duration (in milliseconds).
export async function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}
