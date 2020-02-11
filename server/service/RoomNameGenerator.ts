/**
 * Room Name Generator
 */
export class RoomNameGenerator {

    private static adjectives = [
        'awesome',
        'amazing',
        'great',
        'fantastic',
        'super',
        'admirable',
        'famous',
        'fine',
        'gigantic',
        'grand',
        'marvelous',
        'mighty',
        'outstanding',
        'splendid',
        'wonderful',
        'big',
        'super',
        'smashing',
        'sensational'
    ];

    private static nouns = [
        'game',
        'adventure',
        'fun zone',
        'arena',
        'party',
        'tournament',
        'league',
        'gala',
        'gathering',
        'bunch',
        'fight',
        'battle',
        'conflict',
        'encounter',
        'clash',
        'combat',
        'confrontation',
        'challenge'
    ];

    constructor() { }

    /**
     * Get random name
     */
    getName(): string {
        return 'The ' + this.getAdjective() + ' ' + this.getNoun();
    }

    /**
     * Get random adjective
     */
    getAdjective(): string {
        return RoomNameGenerator.adjectives[Math.floor(Math.random() * RoomNameGenerator.adjectives.length)];
    }

    /**
     * Get random noun
     */
    getNoun(): string {
        return RoomNameGenerator.nouns[Math.floor(Math.random() * RoomNameGenerator.nouns.length)];
    }
}
