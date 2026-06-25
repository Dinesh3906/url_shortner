const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length;

/**
 * Encodes a numeric ID to a Base62 string.
 * @param {number} num - The numeric ID to encode.
 * @returns {string} The encoded Base62 short code.
 */
function encodeBase62(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new Error('Input must be a valid number');
  }
  if (num === 0) return CHARSET[0];
  
  let result = '';
  let tempNum = num;
  
  while (tempNum > 0) {
    const remainder = tempNum % BASE;
    result = CHARSET[remainder] + result;
    tempNum = Math.floor(tempNum / BASE);
  }
  
  return result;
}

/**
 * Decodes a Base62 string back to a numeric ID.
 * @param {string} str - The Base62 string to decode.
 * @returns {number} The decoded numeric ID.
 */
function decodeBase62(str) {
  if (typeof str !== 'string' || str.length === 0) {
    throw new Error('Input must be a non-empty string');
  }
  
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = CHARSET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid character in Base62 string: ${char}`);
    }
    num = num * BASE + index;
  }
  
  return num;
}

module.exports = {
  encodeBase62,
  decodeBase62
};
