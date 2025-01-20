interface Filter {
  doFilter(request: Request, response: Response, chain: FilterChain): void;
}

interface FilterChain extends Filter {
  _filters: Filter[];
  next(): Filter
}

class ApplicationFilterChain implements FilterChain {
  _filters: Filter[];
  _current: number = 0;
  constructor() {
    this._filters = [];
  }
  doFilter(request: Request, response: Response): void {
    // this.filter.doFilter(request, response, this.next);
    if(this._current < this._filters.length) {
      let filter = this.next();
      filter.doFilter(request, response, this);
    }
  }
  next(): Filter {
    return this._filters[this._current++];
  };
}

export {
  Filter,
  FilterChain,
  ApplicationFilterChain
};