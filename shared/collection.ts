export class Collection<T> {

    ids: number[] = [];
    items: T[] = [];
    key: string;
    index: boolean;
    id = 0;

    constructor(items: T[], key: string = 'id', index?: boolean) {

        this.key = key;
        this.index = Boolean(index);
        items.forEach(item => this.add(item));
    }

    /**
     * Clear
     */
    clear(): void {
        this.ids.length = 0;
        this.items.length = 0;
        this.id = 0;
    }

    /**
     * Count the size of the collection
     */
    get count(): number {
        return this.ids.length;
    }

    /**
     * Is the collection empty?
     */
    isEmpty(): boolean {
        return this.ids.length === 0;
    }

    /**
     * Add an elements
     * @param element Element to add
     * @param ttl Time to live
     */
    add(element: T, ttl?: number): boolean {

        this.setId(element);

        if (this.exists(element)) {
            return false;
        }

        this.ids.push(element[this.key]);

        const index = this.ids.indexOf(element[this.key]);

        this.items[index] = element;

        if (typeof (ttl) !== 'undefined' && ttl) {
            const collection = this;
            setTimeout(() => collection.remove(element), ttl);
        }

        return true;
    }

    /**
     * Remove an element
     */
    remove(element: T): boolean {
        const index = this.ids.indexOf(element[this.key]);

        if (index >= 0) {
            this.deleteIndex(index);
            return true;
        }

        return false;
    }

    /**
     * Remove an element by its id
     */
    removeById(id: number): boolean {
        const index = this.ids.indexOf(id);

        if (index >= 0) {
            this.deleteIndex(index);
            return true;
        }

        return false;
    }

    /**
     * Set the id of an element
     */
    setId(element: T) {
        if (this.index) {
            if (typeof (element[this.key]) !== 'undefined' && element[this.key]) {
                if (element[this.key] > this.id) {
                    this.id = element[this.key];
                }
            } else {
                element[this.key] = ++this.id;
            }
        }
    }

    /**
     * Get the index for the given element
     */
    getElementIndex(element: T): number {
        return this.ids.indexOf(element[this.key]);
    }

    /**
     * Get the index fo the given id
     */
    getIdIndex(id: number): number {
        return this.ids.indexOf(id);
    }

    /**
     * Delete the element at the given index
     */
    deleteIndex(index: number) {
        this.items.splice(index, 1);
        this.ids.splice(index, 1);
    }

    /**
     * Get an element by its id
     */
    getById(id: number): T {
        const index = this.ids.indexOf(id);

        return index >= 0 ? this.items[index] : null;
    }

    /**
     * Get an element by its index
     */
    getByIndex(index: number): T {
        return typeof (this.items[index]) !== 'undefined' ? this.items[index] : null;
    }

    /**
     * Test if an element is in the collection
     */
    exists(element: T): boolean {
        return this.getElementIndex(element) >= 0;
    }

    /**
     * Test if the given index exists is in the collection
     */
    indexExists(index: number): boolean {
        return this.ids.indexOf(index) >= 0;
    }

    /**
     * Map
     */
    map(callable: () => T): Collection<T> {
        const elements = this.items.map(callable);
        return new Collection(elements, this.key, this.index);
    }

    /**
     * Filter
     */
    filter(callable: any): Collection<T> {
        const elements = this.items.filter(callable);
        return new Collection(elements, this.key, this.index);
    }

    /**
     * Match
     */
    match(callable: () => boolean): T {
        return this.items.find(callable);
    }

    /**
     * Apply the given callback to all element
     */
    walk(callable: () => void) {
        this.items.forEach(callable);
    }

    /**
     * Get random item from the collection
     */
    getRandomItem(): T {
        if (this.items.length === 0) {
            return null;
        }

        return this.items[Math.floor(Math.random() * this.items.length)];
    }

    /**
     * Get first item in collection
     */
    getFirst(): T {
        return this.items.length > 0 ? this.items[0] : null;
    }

    /**
     * Get last item in collection
     */
    getLast(): T {
        return this.items.length > 0 ? this.items[this.items.length - 1] : null;
    }

    /**
     * Sort
     */
    sort(callable: (a: T, b: T) => number) {
        this.items.sort(callable);
        this.rebuildIds();
    }

    /**
     * Rebuild Ids
     */
    private rebuildIds() {
        const ids = new Array(this.items.length);

        for (let i = this.items.length - 1; i >= 0; i--) {
            ids[i] = this.items[i][this.key];
        }

        this.ids = ids;
    }
}
