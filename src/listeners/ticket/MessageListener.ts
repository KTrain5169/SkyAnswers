import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';

export class MessageListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'messageCreate',
        });
    }

    public async run(message: Message) {
        // Log the message content to the console
        console.log(`Message received: ${message.content}`);

        // Example: Respond to a specific message
        if (message.content.toLowerCase() === 'ping') {
            await message.channel.send('Pong!');
        }
    }
}

export default MessageListener;
