const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Adicionada a importação de MessageMedia
const client = new Client();

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Após isso, ele diz que foi tudo certo
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicializa tudo
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função para criar o delay entre uma ação e outra

// Funil
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
                '4 - Como aderir\n' +
                '5 - Outras perguntas\n' +
                '6 - Receber vídeo informativo' // Nova opção 6
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
        await client.sendMessage(msg.from, `
        ### *PLANOS SEM ACESSO PARA ROTEAR INTERNET:*

        ====================== 
        *Plano Mensal:* R$25,00 /mês  
        30 dias de internet ilimitada (sem acesso para rotear para TV/computador/celular)

        -------------------------------------------------
        *Plano Bronze* 🥉  
        3 Meses de internet ilimitada por: *R$69,90*  
        (Ficam apenas R$23,30 por mês)

        -------------------------------------------------
        *Plano Prata* 🥈  
        6 Meses de internet ilimitada por: *R$129,90*  
        (Ficam apenas R$21,65 por mês)  
        + 1 Mês de Bônus (Pague 6 e Leve 7 meses)

        -------------------------------------------------
        *Plano Ouro* 🥇  
        12 Meses de internet ilimitada por: *R$226,90*  
        (Ficam apenas R$18,90 por mês)  
        + 2 Meses de Bônus (Pague 12 e Leve 14 meses)

        ======================

        ### *PLANOS COM ACESSO PARA ROTEAR INTERNET:*
        *(DISPONIVEL APENAS PARA PLANOS COMPRADOS PARA ANDROID)*

        ====================== 
        *Plano Mensal:* R$35,00 /mês  
        30 dias de internet ilimitada + roteamento ilimitado para TV/computador/celular

        -------------------------------------------------
        *Plano Bronze* 🥉  
        3 Meses de internet ilimitada + roteamento por: *R$95,00*  
        (Ficam apenas R$31,67 por mês)

        -------------------------------------------------
        *Plano Prata* 🥈  
        6 Meses de internet ilimitada + roteamento por: *R$180,00*  
        (Ficam apenas R$30,00 por mês)  
        + 1 Mês de Bônus (Pague 6 e Leve 7 meses)

        -------------------------------------------------
        *Plano Ouro* 🥇  
        12 Meses de internet ilimitada + roteamento por: *R$330,00*  
        (Ficam apenas R$27,50 por mês)  
        + 2 Meses de Bônus (Pague 12 e Leve 14 meses)
        ======================
        `);
    }

    if (msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Confira os benefícios...');
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

    // Nova funcionalidade: Envio de vídeo na opção 6
    if (msg.body === '6' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);

        // Envio do vídeo
        const video = MessageMedia.fromFilePath('C:\Users\julio\Videos\2025-01-04 16-54-03.mkv'); // Caminho para o arquivo de vídeo
        await client.sendMessage(msg.from, video, { caption: 'Confira este vídeo informativo sobre nossos serviços!' });
    }
});
