const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';

export function getCourseIconUrl(key: string): string {
  if (!key) return '';
  const k = key.toLowerCase().trim();

  // icon filename keys (from DB)
  const byFile: Record<string, string> = {
    'c.png':      BASE + 'c/c-original.svg',
    'cpp.png':    BASE + 'cplusplus/cplusplus-original.svg',
    'java.png':   BASE + 'java/java-original.svg',
    'csharp.png': BASE + 'csharp/csharp-original.svg',
    'python.png': BASE + 'python/python-original.svg',
    'js.png':     BASE + 'javascript/javascript-original.svg',
    'html.png':   BASE + 'html5/html5-original.svg',
    'css.png':    BASE + 'css3/css3-original.svg',
  };
  if (byFile[k]) return byFile[k];

  // title-based matching
  if (k.includes('c#') || k.includes('csharp') || k.includes('c# /')) return BASE + 'csharp/csharp-original.svg';
  if (k.includes('c++') || k.includes('cpp'))                           return BASE + 'cplusplus/cplusplus-original.svg';
  if (k.startsWith('javascript') || k.startsWith('js ') || k === 'js') return BASE + 'javascript/javascript-original.svg';
  if (k.startsWith('java') && !k.startsWith('javascript'))              return BASE + 'java/java-original.svg';
  if (k.startsWith('python'))                                            return BASE + 'python/python-original.svg';
  if (k.startsWith('html'))                                              return BASE + 'html5/html5-original.svg';
  if (k.startsWith('css'))                                               return BASE + 'css3/css3-original.svg';
  if (k === 'c' || k.startsWith('c ') || k.startsWith('c-') || k.startsWith('c_') || k.startsWith('c prog') || k.startsWith('c lang') || k.startsWith('c bas')) return BASE + 'c/c-original.svg';

  return '';
}
