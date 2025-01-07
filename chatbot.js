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
    const contact = await message.getContact();
    const name = contact.pushname;

    // Exibindo o menu quando o usuário digitar 'menu' ou saudação
    if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(
            message.from,
            'Olá! ' + name.split(' ')[0] + ', sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n' +
            '1 - Como funciona\n' +
            '2 - Valores dos planos\n' +
            '3 - Fazer teste no Android\n' +
            '4 - Fazer teste no IPhone\n' +
            '5 - Como aderir\n' +
            '6 - Outras perguntas\n' +
            '7 - Receber imagem informativa\n' +
            '8 - Baixar e enviar vídeo informativo'
        );
    } else if (message.body === '3') {
        // Resposta para a opção 3
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Por favor, *INSTALE* este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro e abra-o com o Wi-Fi ligado.\n\n' +
            'Aqui estão os dados para acesso:\n\n' +
            '👤 Usuário: 5120\n' +
            '🔑 Senha: 5120\n' +
            '📲 Limite: 1\n' +
            '🗓️ Expira em: 24 horas\n\n' +
            'Após instalar o aplicativo, abra-o com o Wi-Fi ligado. Em seguida, insira o usuário e senha fornecidos, escolha a operadora e clique em conectar. Aguarde até 15 segundos para a conexão ser estabelecida.\n\n');
        
        // Baixando e enviando o vídeo
        await simulateTyping(chat, 3000); // Pausa antes de enviar o vídeo
        const videoUrl = 'https://drive.google.com/uc?id=1EQCmyXCgM3tBd7ETbL5U8k89ffvArPw-&export=download'; // Link para download direto
        const filePath = './videoInformativo.mp4'; // Caminho para salvar o vídeo localmente

        try {
            await downloadVideo(videoUrl, filePath);
            
            // Enviar o vídeo pelo WhatsApp
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media, {
                caption: 'Vídeo ensinando como conectar no aplicativo!'
            });
            console.log('Vídeo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao baixar ou enviar o vídeo:', error);
            await message.reply('Ocorreu um erro ao tentar baixar ou enviar o vídeo.');
        }
    } else if (message.body === '4') {
        // Resposta para a opção 4
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Por favor, _*INSTALE*_ este aplicativo: https://apps.apple.com/us/app/...');
    } else if (message.body === '5') {
        // Resposta para a opção 5
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Você pode aderir aos nossos planos diretamente pelo nosso aplicativo ou entrando em contato com nosso suporte.');
    } else if (message.body === '6') {
        // Resposta para a opção 6
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Se você tiver qualquer outra dúvida, por favor, nos avise!');
    } else if (message.body === '7') {
        // Resposta para a opção 7
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Aqui está a imagem informativa que você solicitou.');
        // Enviar imagem informativa aqui (adicionar código para enviar imagem)
    } else if (message.body === '8') {
        // Resposta para a opção 8
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        await client.sendMessage(message.from, 'Aqui está o vídeo informativo que você solicitou!');
        // Enviar vídeo informativo aqui (adicionar código para enviar vídeo)
    }
});

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
    // Reconnection logic (optional)
    setTimeout(() => client.initialize(), 5000); // Tenta reconectar após 5 segundos
});
