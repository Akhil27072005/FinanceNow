/** Iconify marks for mini-card overlay (no white Brandfetch tile). */
const NETWORK_ICONIFY = {
  visa: 'logos:visa',
  mastercard: 'logos:mastercard',
  'american express': 'logos:american-express',
  amex: 'logos:american-express',
  discover: 'logos:discover',
  rupay: 'simple-icons:rupay',
  jcb: 'logos:jcb',
  'diners club': 'logos:diners-club'
};

/**
 * Iconify icon for a stored network key (visa, mastercard, …).
 * @param {string} network
 * @returns {string|null}
 */
export function getCardNetworkIconifyIcon(network) {
  if (!network) return null;
  const key = String(network).toLowerCase().trim();
  if (NETWORK_ICONIFY[key]) return NETWORK_ICONIFY[key];
  if (key.includes('visa')) return NETWORK_ICONIFY.visa;
  if (key.includes('master')) return NETWORK_ICONIFY.mastercard;
  if (key.includes('amex') || key.includes('american')) {
    return NETWORK_ICONIFY['american express'];
  }
  if (key.includes('discover')) return NETWORK_ICONIFY.discover;
  if (key.includes('rupay')) return NETWORK_ICONIFY.rupay;
  if (key.includes('jcb')) return NETWORK_ICONIFY.jcb;
  if (key.includes('diners')) return NETWORK_ICONIFY['diners club'];
  return null;
}

/**
 * Infer card network search term from first 4 digits (BIN hint only — never stored).
 * @param {string} prefix - Up to 4 digits
 * @returns {{ network: string, label: string, fallbackIcon: string } | null}
 */
export function cardNetworkFromPrefix(prefix) {
  const digits = String(prefix || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length < 1) return null;

  const n = parseInt(digits, 10);
  const len = digits.length;

  if (digits[0] === '4') {
    return { network: 'visa', label: 'Visa', fallbackIcon: 'logos:visa' };
  }

  if (digits.startsWith('34') || digits.startsWith('37')) {
    return {
      network: 'american express',
      label: 'American Express',
      fallbackIcon: 'logos:american-express'
    };
  }

  if (len >= 2) {
    const two = parseInt(digits.slice(0, 2), 10);
    if (two >= 51 && two <= 55) {
      return { network: 'mastercard', label: 'Mastercard', fallbackIcon: 'logos:mastercard' };
    }
    if (two >= 22 && two <= 27 && len >= 4) {
      const four = parseInt(digits, 10);
      if (four >= 2221 && four <= 2720) {
        return { network: 'mastercard', label: 'Mastercard', fallbackIcon: 'logos:mastercard' };
      }
    }
  }

  if (digits.startsWith('6011') || digits.startsWith('65')) {
    return { network: 'discover', label: 'Discover', fallbackIcon: 'logos:discover' };
  }

  if (digits.startsWith('60') || digits.startsWith('5085') || digits.startsWith('817')) {
    return { network: 'rupay', label: 'RuPay', fallbackIcon: 'simple-icons:rupay' };
  }

  if (digits.startsWith('35')) {
    return { network: 'jcb', label: 'JCB', fallbackIcon: 'logos:jcb' };
  }

  if (digits.startsWith('36') || digits.startsWith('38')) {
    return { network: 'diners club', label: 'Diners Club', fallbackIcon: 'logos:diners-club' };
  }

  if (n >= 622126 && n <= 622925 && len === 4) {
    return { network: 'discover', label: 'Discover', fallbackIcon: 'logos:discover' };
  }

  return null;
}
