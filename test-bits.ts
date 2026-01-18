// Test bit manipulation for index 31
const idx = 31;
const bitValue = (1 << idx) >>> 0;
console.log(`Bit value for index ${idx}: ${bitValue} (0x${bitValue.toString(16)})`);

const stateLo = 0b10000000000010000000000001000000;
const targetLo = bitValue;

console.log(`\nState lo: ${stateLo} (0x${stateLo.toString(16)})`);
console.log(`Target lo: ${targetLo} (0x${targetLo.toString(16)})`);
console.log(`State lo & Target lo: ${(stateLo & targetLo)} (0x${(stateLo & targetLo).toString(16)})`);
console.log(`Match: ${(stateLo & targetLo) === targetLo}`);

// Check if bit 31 is set in stateLo
console.log(`\nBit 31 in stateLo: ${((stateLo >>> 31) & 1) === 1}`);
console.log(`Bit 31 check (alternative): ${((stateLo & (1 << 31)) >>> 0) === (1 << 31) >>> 0}`);

// The issue: 1 << 31 in JavaScript
console.log(`\n1 << 31: ${1 << 31}`);
console.log(`(1 << 31) >>> 0: ${(1 << 31) >>> 0}`);
console.log(`0x80000000: ${0x80000000}`);
