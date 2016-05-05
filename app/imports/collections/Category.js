import Logger from 'imports/logger';

/**
 * Create MongoDB collection: Categories
 */ 
const Categories = new Meteor.Collection("categories", {
  transform: function(doc) {
    return new Category(doc);
  }
});

/**
 *  a Category is definied by a category id, name, and sub-category name
 *  mongo db is updated with new category or modified if category already exists
 */
export default class Category {

  constructor(doc) {
    this._id = doc._id;
    this._category_id = doc.category_id;
    this._name = doc.name;
    this._subcategory = doc.subcategory;
  }

  get id() {
    return this._id;
  };

  get name() {
    return this._name;
  };

  get category_id() {
    return this._category_id;
  };

  get subcategory() {
    return this._subcategory;
  };

  static getCollection() {
    return Categories;
  };

  static findById(category_id) {
    return Category.getCollection().findOne({category_id: category_id});
  };

  save(callback) {
    if (!this.category_id) {
      throw new Meteor.Error("Category ID is missing!");
    }

    if (!this.name) {
      throw new Meteor.Error("Category name is missing!");
    }

    // Create a doc to save or update to the MongoDB database.
    var doc = {
      name: this.name,
      category_id: this.category_id,
      subcategory: this.subcategory
    };

    // If this category already exists, then modify it.
    if (this.id || Categories.find({category_id: this.category_id}).count() > 0) {

      this._id = this.id || Categories.findOne({category_id: this.category_id}).id;

      Categories.update(this.id, {$set: doc},
        callback
      );
      // Else, create a new category.
    } else {
      // remember the context, since in callback it's changed
      var that = this;

      Categories.insert(doc, function(error, result) {
        that._id = result;

        if (callback !== null) {
          callback.call(that, error, result);
        }
      });
    }
  };

  remove(callback) {
    if (this.id)
      Categories.remove(this.id, callback);
    else
      callback.call(this);
  }
}


Categories.before.insert(function(userId, doc) {
  let now = new Date();
  doc.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
  Logger.debug('Inserting category %s', doc.category_id);
});

Categories.before.update(function(userId, doc, fieldNames, modifier, options) {
  let now = new Date();
  modifier.$set = modifier.$set || {};
  modifier.$set.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
  Logger.debug('Updating category %s', doc.category_id);
});

Categories.before.remove(function(userId, doc) {
  Logger.debug('Removing category %s', doc.category_id, {expires: doc.expires});
});


Categories.allow({
  insert: function(userId, doc) {
    return userId && Roles.userIsInRole(userId, 'admin', 'default-group');
  },
  update: function(userId, doc, fields, modifier) {
    return userId && Roles.userIsInRole(userId, 'admin', 'default-group');
  },
  remove: function(userId, doc) {
    return userId && Roles.userIsInRole(userId, 'admin', 'default-group');
  }
});
