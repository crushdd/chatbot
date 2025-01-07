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

    // Verificando se a mensagem recebida é uma das perguntas armazenadas
    const response = options[message.body];

    if (response) {
        // Respondendo com a resposta associada
        const chat = await message.getChat();
        await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
        message.reply(response);
        console.log('Resposta enviada:', response);
    } else {
        // Enviando o menu se a mensagem for de saudação ou pedido de menu
        if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
            const chat = await message.getChat();
            await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
            const contact = await message.getContact(); // Pegando o contato
            const name = contact.pushname; // Pegando o nome do contato
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
            const chat = await message.getChat();

            await simulateTyping(chat, 2000); // Simulando digitação por 2 segundos
            await client.sendMessage(message.from, '👤 Usuário: 5120\n🔑 Senha: 5120\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções de conexão: Abra o aplicativo com o seu Wi-Fi ligado. Após abrir o aplicativo, desligue o Wi-Fi e ligue os seus dados móveis. Certifique-se de que apareça a indicação de 3G, H+, 4G ou 5G. Insira o usuário e senha acima, escolha a opção correspondente à sua operadora e clique em conectar. Aguarde 15 segundos. Se não funcionar, teste todas as opções disponíveis para a sua operadora no aplicativo.');

            await simulateTyping(chat, 3000); // Pausa antes de enviar o vídeo
            const videoUrl = 'https://drive.google.com/uc?id=1y0_2GJPW3mIh2Ei5-X2WWsZIXyJipXZL&export=download'; // Link para download direto
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
        }
    }
});

// Respostas armazenadas
options['Como funciona'] = 'Disponibilizamos a internet ilimitada por meio do nosso aplicativo. Basta baixá-lo, fazer login com o acesso iremos fornecer, e conectar. Enquanto você mantiver o aplicativo aberto e conectado, terá acesso à internet ilimitada.';
options['Valores dos planos'] = `### *PLANOS SEM ACESSO PARA ROTEAR INTERNET:*

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

======================`;

options['Fazer teste no Android 3'] = 'Por favor, _*INSTALE*_ este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro E _*abra-o*_ com o _*Wi-Fi ligado*_.';

// Iniciar o cliente
client.initialize();

// Lidar com desconexões ou falhas
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado. Razão:', reason);
});
