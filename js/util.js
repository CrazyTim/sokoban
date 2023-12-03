export function downloadFile(content, type, fileName) {
  const file = new Blob([content], {type: type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

/**
 * Get a random number between `min` (inclusive) and `max` (inclusive).
 * Control the number of decimal places with `round`.
 */
export function getRandom(min, max, round = 0) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(round));
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

export function preloadImages(urls) {
  urls.forEach(i => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'preload');
    l.setAttribute('href', i);
    l.setAttribute('as', 'image');
    document.head.appendChild(l);
  });
}
