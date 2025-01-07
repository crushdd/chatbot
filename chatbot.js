const { Client } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const client = new Client();

// Função para adicionar delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Respostas armazenadas
const options = {
    'Como funciona': 'Disponibilizamos a internet ilimitada por meio do nosso aplicativo. Basta baixá-lo, fazer login com o acesso iremos fornecer, e conectar. Enquanto você mantiver o aplicativo aberto e conectado, terá acesso à internet ilimitada.',
    'Valores dos planos': `### *PLANOS SEM ACESSO PARA ROTEAR INTERNET:*

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

======================`,
    'Fazer teste no Android': 'Por favor, _*INSTALE*_ este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro E _*abra-o*_ com o _*Wi-Fi ligado*_.',
};

// Lógica para iniciar o cliente WhatsApp
client.on('qr', (qr) => {
    console.log('QR Code recebido:', qr);
    // Implemente o código para gerar o QR Code se necessário
});

client.on('ready', () => {
    console.log('Bot está pronto!');
});

client.on('message', async (message) => {
    console.log('Mensagem recebida:', message.body);

    const chat = await message.getChat();
    const contact = await message.getContact();
    const name = contact.pushname ? contact.pushname.split(' ')[0] : 'Usuário';

    // Simulando a digitação antes de responder
    await chat.sendStateTyping();
    await delay(2000); // Atraso de 2 segundos

    // Verificando se a mensagem é uma saudação ou pedido de menu
    if (message.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
        await client.sendMessage(
            message.from,
            `Olá, ${name}! Sou o assistente virtual da empresa tal. Como posso ajudá-lo hoje? Escolha uma das opções abaixo:\n\n` +
            '1 - Como funciona\n' +
            '2 - Valores dos planos\n' +
            '3 - Fazer teste no Android\n' +
            '4 - Fazer teste no iPhone\n' +
            '5 - Como aderir\n' +
            '6 - Outras perguntas\n' +
            '7 - Receber vídeo informativo'
        );
    } else if (message.body === '1') {
        await message.reply(options['Como funciona']);
    } else if (message.body === '2') {
        await message.reply(options['Valores dos planos']);
    } else if (message.body === '3') {
        // Quando o usuário escolhe "Fazer teste no Android" (opção 3)
        await chat.sendStateTyping();
        await delay(3000); // Atraso de 3 segundos

        try {
            const videoUrl = 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F'; // Link direto do Google Drive
            const videoPath = '/tmp/video.mp4';

            // Baixar o vídeo
            const response = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            // Esperar o término do download
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Enviar o vídeo como mensagem
            await client.sendMessage(message.from, fs.createReadStream(videoPath), { caption: 'Aqui está o vídeo ensinando como fazer o teste no Android!' });
            console.log('Vídeo enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar o vídeo:', error);
            await client.sendMessage(message.from, 'Desculpe, houve um problema ao enviar o vídeo. Tente novamente mais tarde.');
        }
    } else if (message.body === '7') {
        // Enviar vídeo informativo
        await chat.sendStateTyping();
        await delay(2000); // Atraso de 2 segundos
        await client.sendMessage(message.from, 'Aqui está o vídeo informativo:', { link: 'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F' });
    } else {
        await chat.sendStateTyping();
        await delay(1500); // Atraso de 1.5 segundos
        await message.reply('Não entendi sua solicitação. Por favor, escolha uma das opções do menu.');
    }
});

client.initialize();
