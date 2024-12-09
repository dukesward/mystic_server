function StringUtils() {
  return {
    capitalize: (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    camelCase: (str: string) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    },
    kebabCase: (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    },
    snakeCase: (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    },
    titleCase: (str: string) => {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },
    parseString: (str: string, target: { [key: string]: any }): string => {
      let result: string = str;
      let iterator: IterableIterator<RegExpMatchArray> = str.matchAll(/{([^}]+)}/g);
      for(let m of iterator) {
        if(m && (m[1] in target)) {
          result = result.replace(m[0].toString(), target[m[1]]);
        }
      }
      return result;
    }
  }
}

export default StringUtils();