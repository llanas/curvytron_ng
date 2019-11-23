"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collection = /** @class */ (function () {
    function Collection(items, key, index) {
        var _this = this;
        if (key === void 0) { key = 'id'; }
        this.ids = [];
        this.items = [];
        this.id = 0;
        this.key = key;
        this.index = Boolean(index);
        items.forEach(function (item) { return _this.add(item); });
    }
    /**
     * Clear
     */
    Collection.prototype.clear = function () {
        this.ids.length = 0;
        this.items.length = 0;
        this.id = 0;
    };
    /**
     * Count the size of the collection
     */
    Collection.prototype.count = function () {
        return this.ids.length;
    };
    /**
     * Is the collection empty?
     */
    Collection.prototype.isEmpty = function () {
        return this.ids.length === 0;
    };
    /**
     * Add an elements
     * @param element Element to add
     * @param ttl Time to live
     */
    Collection.prototype.add = function (element, ttl) {
        this.setId(element);
        if (this.exists(element)) {
            return false;
        }
        this.ids.push(element[this.key]);
        var index = this.ids.indexOf(element[this.key]);
        this.items[index] = element;
        if (typeof (ttl) !== 'undefined' && ttl) {
            var collection_1 = this;
            setTimeout(function () { return collection_1.remove(element); }, ttl);
        }
        return true;
    };
    /**
     * Remove an element
     */
    Collection.prototype.remove = function (element) {
        var index = this.ids.indexOf(element[this.key]);
        if (index >= 0) {
            this.deleteIndex(index);
            return true;
        }
        return false;
    };
    /**
     * Remove an element by its id
     */
    Collection.prototype.removeById = function (id) {
        var index = this.ids.indexOf(id);
        if (index >= 0) {
            this.deleteIndex(index);
            return true;
        }
        return false;
    };
    /**
     * Set the id of an element
     */
    Collection.prototype.setId = function (element) {
        if (this.index) {
            if (typeof (element[this.key]) !== 'undefined' && element[this.key]) {
                if (element[this.key] > this.id) {
                    this.id = element[this.key];
                }
            }
            else {
                element[this.key] = ++this.id;
            }
        }
    };
    /**
     * Get the index for the given element
     */
    Collection.prototype.getElementIndex = function (element) {
        return this.ids.indexOf(element[this.key]);
    };
    /**
     * Get the index fo the given id
     */
    Collection.prototype.getIdIndex = function (id) {
        return this.ids.indexOf(id);
    };
    /**
     * Delete the element at the given index
     */
    Collection.prototype.deleteIndex = function (index) {
        this.items.splice(index, 1);
        this.ids.splice(index, 1);
    };
    /**
     * Get an element by its id
     */
    Collection.prototype.getById = function (id) {
        var index = this.ids.indexOf(id);
        return index >= 0 ? this.items[index] : null;
    };
    /**
     * Get an element by its index
     */
    Collection.prototype.getByIndex = function (index) {
        return typeof (this.items[index]) !== 'undefined' ? this.items[index] : null;
    };
    /**
     * Test if an element is in the collection
     */
    Collection.prototype.exists = function (element) {
        return this.getElementIndex(element) >= 0;
    };
    /**
     * Test if the given index exists is in the collection
     */
    Collection.prototype.indexExists = function (index) {
        return this.ids.indexOf(index) >= 0;
    };
    /**
     * Map
     */
    Collection.prototype.map = function (callable) {
        var elements = this.items.map(callable);
        return new Collection(elements, this.key, this.index);
    };
    /**
     * Filter
     */
    Collection.prototype.filter = function (callable) {
        var elements = this.items.filter(callable);
        return new Collection(elements, this.key, this.index);
    };
    /**
     * Match
     */
    Collection.prototype.match = function (callable) {
        return this.items.find(callable);
    };
    /**
     * Apply the given callback to all element
     */
    Collection.prototype.walk = function (callable) {
        this.items.forEach(callable);
    };
    /**
     * Get random item from the collection
     */
    Collection.prototype.getRandomItem = function () {
        if (this.items.length === 0) {
            return null;
        }
        return this.items[Math.floor(Math.random() * this.items.length)];
    };
    /**
     * Get first item in collection
     */
    Collection.prototype.getFirst = function () {
        return this.items.length > 0 ? this.items[0] : null;
    };
    /**
     * Get last item in collection
     */
    Collection.prototype.getLast = function () {
        return this.items.length > 0 ? this.items[this.items.length - 1] : null;
    };
    /**
     * Sort
     */
    Collection.prototype.sort = function (callable) {
        this.items.sort(callable);
        this.rebuildIds();
    };
    /**
     * Rebuild Ids
     */
    Collection.prototype.rebuildIds = function () {
        var ids = new Array(this.items.length);
        for (var i = this.items.length - 1; i >= 0; i--) {
            ids[i] = this.items[i][this.key];
        }
        this.ids = ids;
    };
    return Collection;
}());
exports.Collection = Collection;
