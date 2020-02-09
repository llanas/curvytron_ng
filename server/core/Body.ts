import { Collection } from '@shared/collection';

/**
 * Body
 */
export class Body {

    x: number;
    y: number;
    radius: number;
    data: any;
    islands: any;
    id: any;

    constructor(x: number, y: number, radius: number, data?: any) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.data = data;
        this.islands = new Collection();
        this.id = null;
    }

    /**
     * Match?
     */
    match(body: Body) {
        return true;
    }
}
