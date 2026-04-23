/* ============================================
   TypeFlow — Word List & Generator
   ============================================ */

// Top 500 common English words for typing tests
const WORD_LIST = [
  "the","of","and","to","in","is","you","that","it","he","was","for","on","are",
  "but","not","what","all","were","we","when","your","can","had","have","each",
  "which","she","do","how","their","if","will","up","other","about","out","many",
  "then","them","these","so","some","her","would","make","like","him","into",
  "time","has","look","two","more","write","go","see","number","no","way","could",
  "people","my","than","first","water","been","call","who","oil","its","find",
  "long","down","day","did","get","come","made","may","part","over","new","sound",
  "take","only","little","work","know","place","year","live","me","back","give",
  "most","very","after","thing","our","just","name","good","sentence","man",
  "think","say","great","where","help","through","much","before","line","right",
  "too","mean","old","any","same","tell","boy","follow","came","want","show",
  "also","around","form","three","small","set","put","end","does","another",
  "well","large","must","big","even","such","here","why","ask","went","men",
  "read","need","land","different","home","us","move","try","kind","hand",
  "picture","again","change","off","play","spell","air","away","animal","house",
  "point","page","letter","mother","answer","found","study","still","learn",
  "should","world","high","every","near","add","food","between","own","below",
  "country","plant","last","school","father","keep","tree","never","start","city",
  "earth","eye","light","thought","head","under","story","saw","left","few",
  "while","along","might","close","something","seem","next","hard","open",
  "example","begin","life","always","those","both","paper","together","got",
  "group","often","run","important","until","children","side","feet","car",
  "mile","night","walk","white","sea","began","grow","took","river","four",
  "carry","state","once","book","hear","stop","without","second","later","miss",
  "idea","enough","eat","face","watch","far","real","almost","let","above","girl",
  "sometimes","mountain","cut","young","talk","soon","list","song","being",
  "leave","family","body","music","color","stand","sun","question","fish","area",
  "mark","dog","horse","door","sure","become","top","ship","across","today",
  "during","short","better","best","however","low","hours","black","product",
  "happen","whole","measure","remember","early","reach","rest","done","surface",
  "produce","building","ocean","class","note","nothing","plan","figure","front",
  "felt","among","power","heart","present","ready","green","north","king","size",
  "problem","order","hold","ground","develop","warm","free","minute","strong",
  "special","mind","behind","clear","tail","include","build","table","since",
  "possible","course","common","gold","south","morning","practice","report",
  "voice","sit","field","travel","weather","space","visit","create","brought",
  "pattern","slow","center","love","person","money","serve","appear","road",
  "map","rain","rule","govern","pull","cold","notice","shape","energy","war",
  "true","town","piece","basic","fast","dark","machine","region","island","test",
  "simple","complete","verb","process","direct","ring","suggest","wonder",
  "remain","bed","past","bring","heat","snow","tire","fill","east","weight",
  "language","final","drive","check","design","round","press","touch","inform",
  "train","blue","wish","drop","window","deep","edge","sign","type","speed",
  "flow","system","step","fact","unit","busy","gentle","sleep","cover","board",
  "modern","age","moment","reason","stay","result","wheel","return","spring",
  "observe","dream","soft","length","single","join","provide","clean","break",
  "purpose","view","bit","stone","equal","job","wave","count","base","cool",
  "fair","material","total","wide","deal","finger","garden","choose","wild",
  "happy","charge","method","track","captain","quiet","locate","half","supply"
];

/**
 * Generate a random array of words for typing tests.
 * @param {number} count - Number of words to generate
 * @returns {string[]} Array of random words
 */
export function generateWords(count) {
  const words = [];
  const len = WORD_LIST.length;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * len);
    words.push(WORD_LIST[idx]);
  }
  return words;
}

/**
 * Generate a large pool of words for time-based tests.
 * @returns {string[]} Array of ~250 random words
 */
export function generateTimedWords() {
  return generateWords(250);
}

export default WORD_LIST;
