import Message from './message.model';

export default class MessageTip extends Message {

    /**
     * Message type
     */
    static type = 'tip';

    /**
     * Default icon
     */
    static icon = 'icon-megaphone';

    /**
     * Tips
     */
    static tips = [
        'To customize your left/right controls, click the [←]/[→] buttons and press any key.',
        'Curvytron supports gamepads! Connect it, press A, then setup your controls.',
        'Yes, you can play Curvytron on your smartphone ;)',
        'You can add multiple players on the same computer.',
        'Green bonuses apply only to you.',
        'Red bonuses target your enemies.',
        'White bonuses affect everyone.',
        'Making a Snail™ is a sure way to win, but other players might hate you for it.',
        'The Enrichment Center regrets to inform you that this next test is impossible. Make no attempt to solve it.'
    ];

    constructor () {
        super();

        this.content = MessageTip.tips[Math.floor(Math.random() * MessageTip.tips.length)];
    }
}
