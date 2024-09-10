class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  static formatQuery(query) {
    if (Array.isArray(query)) {
      query = query.join(' ');
    }
    return query.replaceAll(',', ' ');
  }

  filter() {
    const exclude = ['sort', 'limit', 'page', 'fields'];
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let reqObject = { ...this.queryStr };
    // removing cutom keywords form the query
    exclude.forEach((el) => delete reqObject[el]);
    // adding the dollar sign
    reqObject = JSON.stringify(reqObject);
    reqObject = reqObject.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(reqObject));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      this.query.sort(this.constructor.formatQuery(this.queryStr.sort));
      return this;
    }
    this.query.sort('-updatedAt');
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      this.query = this.query.select(this.queryStr.fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const pageLimit = +this.queryStr.limit || 100;
    const pages = +this.queryStr.page || 1;
    const skippedPages = (pages - 1) * pageLimit;
    if (this.queryStr.limit) {
      this.query = this.query.skip(skippedPages).limit(pageLimit);
    }
    return this;
  }
}

module.exports = APIFeatures;
