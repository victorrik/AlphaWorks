export type Sexo = 'H' | 'M';

export type CurpInput = {
  nombres: string[]; // 1..3 nombres de pila, sin normalizar
  apellidoPaterno: string;
  apellidoMaterno: string; // '' => 'X'
  birth: Date;
  sexo: Sexo;
  estado: string; // Clave_Estado, p. ej. 'GR'
  diferenciador: string; // 1 carácter: dígito (<2000) o letra (>=2000)
};

// 32 entidades → clave CURP. Sin 'NE'.
export const STATE_CODES = [
  'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR',
  'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP',
  'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS',
] as const;

const PARTICLES = new Set([
  'DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LOS',
  'LAS', 'LE', 'LES', 'MAC', 'MC', 'VAN', 'VON', 'Y',
]);

const SKIP_FIRST_NAMES = new Set(['JOSE', 'J', 'MARIA', 'MA', 'M']);

// Lista oficial RENAPO de palabras inconvenientes.
const BAD_WORDS = new Set([
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA',
  'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO',
  'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO',
  'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI',
  'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME',
  'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 'MOKO', 'MULA',
  'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO',
  'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO',
  'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY',
]);

const DICT = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'; // valor = índice (0..36)

const CURP_RE =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

// Ñ→X antes de NFD: NFD descompone Ñ en N + tilde y terminaría como N.
function normalize(s: string): string {
  return s
    .toUpperCase()
    .replace(/Ñ/g, 'X')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Quita Partículas iniciales y devuelve la primera palabra restante.
function stripParticles(s: string): string {
  const words = normalize(s).split(' ');
  while (words.length > 1 && PARTICLES.has(words[0])) words.shift();
  return words[0];
}

const firstVowel = (s: string) => s.match(/[AEIOU]/)?.[0] ?? 'X';
const firstConsonant = (s: string) => s.match(/[B-DF-HJ-NP-TV-Z]/)?.[0] ?? 'X';
const pad2 = (n: number) => String(n).padStart(2, '0');

export function checkDigit(first17: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += DICT.indexOf(first17[i]) * (18 - i);
  return String((10 - (sum % 10)) % 10);
}

export function buildCurp(p: CurpInput): string {
  const pat = stripParticles(p.apellidoPaterno);
  const mat = stripParticles(p.apellidoMaterno);
  const names = p.nombres.map(stripParticles);
  const nom = names.length > 1 && SKIP_FIRST_NAMES.has(names[0]) ? names[1] : names[0];

  let head = pat[0] + firstVowel(pat.slice(1)) + (mat[0] ?? 'X') + nom[0];
  if (BAD_WORDS.has(head)) head = head[0] + 'X' + head.slice(2);

  const b = p.birth;
  const first17 =
    head +
    pad2(b.getFullYear() % 100) +
    pad2(b.getMonth() + 1) +
    pad2(b.getDate()) +
    p.sexo +
    p.estado +
    firstConsonant(pat.slice(1)) +
    firstConsonant(mat.slice(1)) +
    firstConsonant(nom.slice(1)) +
    p.diferenciador;
  return first17 + checkDigit(first17);
}

export function isValidCurp(curp: string): boolean {
  return CURP_RE.test(curp) && checkDigit(curp.slice(0, 17)) === curp[17];
}
