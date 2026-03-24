// src/utils/console.js

/**
 * Désactive tous les console.* en production
 * Garde les console en développement
 */

const isProduction = import.meta.env.PROD;

if (isProduction) {
  // Sauvegarder les méthodes originales (au cas où tu en as besoin)
  const noop = () => {};

  // Désactiver toutes les méthodes console
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.trace = noop;
  console.table = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.groupCollapsed = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.count = noop;
  console.clear = noop;
  console.dir = noop;
  console.dirxml = noop;
  console.assert = noop;
  console.profile = noop;
  console.profileEnd = noop;
  console.timeStamp = noop;
}

export default console;