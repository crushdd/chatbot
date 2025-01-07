const puppeteer = require('puppeteer-core');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');

// Armazenando as opções e respostas
let options = {};

// Configuração do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable', // Caminho para o navegador
        args: [
            '--no-sandbox', // Desativa o sandbox
            '--disable-setuid-sandbox', // Desativa o setuid sandbox
        ],
    },
});

// Função para baixar vídeo
async function downloadVideo(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Função para simular digitação
async function simulateTyping(chat, duration) {
    await chat.sendStateTyping();
    return new Promise(resolve => setTimeout(resolve, duration));
}

// Gerar o QR Code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima!');
});

// Após a conexão bem-sucedida
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Lidar com as mensagens recebidas no WhatsApp
client.on('message', async (message) => {
    console.log('Mensagem recebida:', message.body);

    const chat = await message.getChat();

    // Opções para interagir com o menu principal
    if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola|interessado)/i)) {
        await simulateTyping(chat, 2000);
        const contact = await message.getContact();
        const name = contact.pushname || 'Amigo';
        await client.sendMessage(
            message.from,
            `Olá, ${name.split(' ')[0]}! Sou o assistente virtual da Hyper. Escolha uma das opções abaixo digitando o número correspondente:\n\n` +
            '1 - Como funciona\n' +
            '2 - Valores dos planos\n' +
            '3 - Fazer teste no Android\n' +
            '4 - Fazer teste no iPhone\n' +
            '5 - Como aderir\n' +
            '6 - Outras perguntas\n' +
            '7 - Receber imagem informativa\n' +
            '8 - Baixar e enviar vídeo informativo'
        );
        return;
    }

    // Responder às opções do menu
    switch (message.body) {
        case '1':
            await simulateTyping(chat, 2000);
            await message.reply(
                'Oferecemos internet ilimitada por meio de nosso aplicativo. É simples: baixe, faça login com as credenciais fornecidas e conecte. Enquanto estiver conectado ao app, você terá acesso à internet ilimitada!'
            );
            break;
        case '2':
            await simulateTyping(chat, 2000);
            await client.sendMessage(message.from, options['Valores dos planos']);
            break;
        case '3':
            await simulateTyping(chat, 2000);
            await client.sendMessage(
                message.from,
                'Por favor, *INSTALE* este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro e abra-o com o Wi-Fi ligado.'
            );
            await simulateTyping(chat, 3000);
            await client.sendMessage(
                message.from,
                '👤 Usuário: 5120\n🔑 Senha: 5120\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções: Use o Wi-Fi ao abrir o app, depois ative os dados móveis. Escolha a operadora e clique em conectar.'
            );
            break;
        case '4':
            await simulateTyping(chat, 3000);
            await client.sendMessage(
                message.from,
                'Por favor, *BAIXE* este aplicativo: https://apps.apple.com/app/napsternetv/id1629465476.'
            );
            await simulateTyping(chat, 3500); // Pausa antes de enviar a próxima mensagem
            await client.sendMessage(
                message.from,
                'Em qual operadora você gostaria de testar? Para testar, *digite vivo* iphone ou *tim iphone*, de acordo com a sua operadora.'
            );

            // Aguardar a resposta do cliente
            client.on('message', async (response) => {
                const userReply = response.body.toLowerCase();

                // Caso o usuário mencione "claro iphone"
                if (userReply.includes('claro') && userReply.includes('iphone')) {
                    await simulateTyping(chat, 2000);
                    await client.sendMessage(
                        response.from,
                        'Desculpe, atualmente só temos suporte para Vivo e TIM. Por favor, escolha uma dessas operadoras.'
                    );
                } else if (userReply.includes('vivo') && userReply.includes('iphone')) {
                    await simulateTyping(chat, 2000);

                    // Links para os arquivos no Google Drive
                    const vivoFileLink = 'https://drive.google.com/uc?export=download&id=1vB5mAaC8jz9PJqo_EMBesmKIIUawMmWE';
                    const vivoVideoLink = 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F';

                    await client.sendMessage(
                        response.from,
                        `Aqui está o arquivo de configuração para Vivo no iPhone:\n${vivoFileLink}`
                    );
                    await simulateTyping(chat, 3000); // Simula pausa antes de enviar o vídeo
                    await client.sendMessage(
                        response.from,
                        `Aqui está o vídeo tutorial para Vivo no iPhone:\n${vivoVideoLink}`
                    );
                } else if (userReply.includes('tim') && userReply.includes('iphone')) {
                    await simulateTyping(chat, 2000);

                    // Links para os arquivos no Google Drive
                    const timFileLink = 'https://drive.google.com/uc?export=download&id=1oLrl7PMJ4CfCirOB_vZ06UIkgiJAdbL1';
                    const timVideoLink = 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F';

                    await client.sendMessage(
                        response.from,
                        `Aqui está o arquivo de configuração para TIM no iPhone:\n${timFileLink}`
                    );
                    await simulateTyping(chat, 3000); // Simula pausa antes de enviar o vídeo
                    await client.sendMessage(
                        response.from,
                        `Aqui está o vídeo tutorial para TIM no iPhone:\n${timVideoLink}`
                    );
                } else {
                    await simulateTyping(chat, 2000);
                    await client.sendMessage(
                        response.from,
                        'Desculpe, atualmente só temos suporte para Vivo e TIM. Por favor, escolha uma dessas operadoras.'
                    );
                }
            });
            break;
        case '5':
            await simulateTyping(chat, 2000);
            await client.sendMessage(
                message.from,
                'Para aderir, basta acessar nosso site oficial ou entrar em contato pelo WhatsApp para escolher o plano ideal para você.'
            );
            break;
        case '6':
            await simulateTyping(chat, 2000);
            await message.reply('Envie sua pergunta! Estamos aqui para ajudar.');
            break;
        case '7':
            await simulateTyping(chat, 2000);
            const imagePath = './imagemInformativa.png'; // Substitua pelo caminho da imagem
            if (fs.existsSync(imagePath)) {
                const media = MessageMedia.fromFilePath(imagePath);
                await client.sendMessage(message.from, media, {
                    caption: 'Imagem informativa sobre nossos planos e serviços.'
                });
            } else {
                await message.reply('Imagem informativa não encontrada no momento.');
            }
            break;
        case '8':
            const videoUrl = 'https://bit.ly/appandroidbo';
            const filePath = './videoInformativo.mp4';

            try {
                await simulateTyping(chat, 2000);
                await downloadVideo(videoUrl, filePath);

                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(message.from, media, {
                    caption: 'Vídeo ensinando como conectar no aplicativo!'
                });
                console.log('Vídeo enviado com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar vídeo:', error);
                await message.reply('Ocorreu um erro ao tentar enviar o vídeo.');
            }
            break;
        default:
            await simulateTyping(chat, 2000);
            await message.reply('Não entendi sua mensagem. Por favor, digite "menu" para ver as opções disponíveis.');
            break;
    }
});

// Respostas armazenadas
options['Valores dos planos'] = `### Planos disponíveis: [...]`; // Personalize os detalhes

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
});
