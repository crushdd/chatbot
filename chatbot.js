const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js'); // Remover a importação de Buttons e List, não são necessárias aqui
const client = new Client();

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Conexão realizada com sucesso
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicializa tudo
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função para criar o delay entre uma ação e outra

// Funil de mensagens
client.on('message', async msg => {
    // Identifica mensagens de saudação e envia o menu inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        const contact = await msg.getContact(); // Pegando o contato
        const name = contact.pushname; // Pegando o nome do contato
        await client.sendMessage(
            msg.from,
            'Olá! ' +
                name.split(' ')[0] +
                ', sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n' +
                '1 - Como funciona\n' +
                '2 - Valores dos planos\n' +
                '3 - Fazer teste no Android\n' +
                '4 - Fazer teste no IPhone\n' +				
                '5 - Como aderir\n' +
                '6 - Outras perguntas\n' +
                '7 - Receber vídeo informativo' // Nova opção 7
        );
    }

    // Responde com as informações para cada opção
    if (msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Disponibilizamos internet ilimitada por meio do nosso aplicativo. Basta baixá-lo, realizar a conexão com os dados que forneceremos e conectar. Enquanto o aplicativo estiver aberto e conectado, você terá acesso à internet ilimitada.');
    }

    if (msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, `Planos disponíveis...`); // Colocar suas informações de planos aqui
    }

    if (msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Confira os benefícios para Android...');
    }

    if (msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Para aderir, siga esses passos...');
    }

    if (msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Outras perguntas? Estou aqui para ajudar!');
    }

    if (msg.body === '6' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Envio do vídeo informativo...');
    }
});
