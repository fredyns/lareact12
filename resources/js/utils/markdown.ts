/**
 * Normalize markdown text to fix common formatting issues while preserving fenced code blocks
 * This function handles invisible characters, extra spaces, and malformed markdown syntax
 */
export const normalizeMarkdown = (md: string): string => {
  if (!md) return md;
  
  // Split on fenced code blocks to preserve them
  const parts = md.split(/(```[\s\S]*?```)/g); // keep fences in results
  
  return parts
    .map((segment) => {
      // If this is a fenced code block, return as-is
      if (/^```[\s\S]*```$/.test(segment)) return segment;
      
      // Otherwise, normalize common typos and formatting issues
      let s = segment;
      
      // Remove invisible characters and normalize spaces
      s = s.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' '); // invisible spaces
      s = s.replace(/\s{2,}/g, ' '); // collapse multiple spaces
      
      // Fix bold formatting (** **)
      s = s.replace(/\*\*([\s\S]*?)\*\*/g, (_m, c) => `**${String(c).trim()}**`);
      
      // Fix bold formatting (__ __)
      s = s.replace(/__([\s\S]*?)__/g, (_m, c) => `__${String(c).trim()}__`);
      
      // Fix strikethrough formatting (~~ ~~)
      s = s.replace(/~~([\s\S]*?)~~/g, (_m, c) => `~~${String(c).trim()}~~`);
      
      // Fix italic formatting (* *) - avoid conflicts with bold
      s = s.replace(/(^|[^*])\*([^*\n][\s\S]*?)\*(?!\*)/g, (_m, pre, c) => `${pre}*${String(c).trim()}*`);
      
      // Fix italic formatting (_ _) - avoid conflicts with bold
      s = s.replace(/(^|[^_])_([^_\n][\s\S]*?)_(?!_)/g, (_m, pre, c) => `${pre}_${String(c).trim()}_`);
      
      return s;
    })
    .join('');
};
