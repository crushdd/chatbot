const puppeteer = require('puppeteer-core');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

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

// Função para baixar o arquivo
async function downloadFile(url, filePath) {
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

// Função para apagar arquivos
async function deleteFile(filePath) {
    return fs.promises.unlink(filePath);
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
    if (message.body.match(/(menu|Menu|tornar|saber|interessado)/i)) {
        await simulateTyping(chat, 3500);
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
            '6 - Perguntas Frequentes\n' +
            '7 - Falar com um Atendente\n' +
            '8 - Quero me tornar um Revendedor\n' +
            '9 - Tabela de Valores para Revendedores\n' +		
            '10 - Termos de uso\n' +
            '11 - Planos IPTV\n' +
            '12 - Testar IPTV'    
        );
        return;
    }

    // Responder às opções do menu
    switch (message.body) {
        case '1':
            await simulateTyping(chat, 3000);
            await message.reply(
                'Oferecemos internet ilimitada por meio de nosso aplicativo. É simples: baixe, faça login com as credenciais fornecidas e conecte. Enquanto estiver conectado ao app, você terá acesso à internet ilimitada!'
            );
            break;
        case '2':
            await simulateTyping(chat, 2500);
            await client.sendMessage(
                message.from,
                `### *PLANOS SEM ACESSO PARA ROTEAR INTERNET:*

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

======================`
            );
            break;
        case '3':
            await simulateTyping(chat, 3600);
            await client.sendMessage(
                message.from,
                'Por favor, *INSTALE* este aplicativo: https://play.google.com/store/apps/details?id=com.hypernet23.pro e abra-o com o Wi-Fi ligado.'
            );
            await simulateTyping(chat, 2100);
            await client.sendMessage(
                message.from,
                '👤 Usuário: 0211\n🔑 Senha: 0211\n📲 Limite: 1\n🗓️ Expira em: 24 horas\n🌍 Instruções: Use o Wi-Fi ao abrir o app, depois ative os dados móveis. Escolha a operadora e clique em conectar.'
            );
            await simulateTyping(chat, 3150);

            // Agora, o vídeo será baixado e enviado diretamente
            const videoLink = 'https://drive.google.com/uc?export=download&id=1B30tef3Ic9lImJy6J_EadmjwlhOUcJcd';
            const videoFilePath = path.join(__dirname, 'tutorial_video.mp4'); // Caminho para salvar o vídeo

            await downloadFile(videoLink, videoFilePath); // Baixar o vídeo

            // Enviar o vídeo para a conversa
            const media = MessageMedia.fromFilePath(videoFilePath); // Criar o objeto de mídia
            await client.sendMessage(message.from, media, { caption: 'Vídeo ensinando como conectar no aplicativo!' });

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
                'Em qual operadora você gostaria de testar? Para testar, digite *vivo iphone* ou *tim iphone*, de acordo com a sua operadora.'
            );

// Aguardar a resposta do cliente
const filter = (response) => response.from === message.from;

const collector = async (response) => {
    if (response.from !== message.from) return;

    const userReply = response.body.toLowerCase();

    const sendFileAndVideo = async (operator, fileLink, fileName, videoLink, videoName) => {
        try {
            // Baixar o arquivo de configuração
            const filePath = path.join(__dirname, fileName);
            await downloadFile(fileLink, filePath);

            // Enviar o arquivo para o cliente
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(response.from, media, {
                caption: `Arquivo de configuração para ${operator} no iPhone`,
            });

            // Baixar o vídeo tutorial
            const videoPath = path.join(__dirname, videoName);
            await downloadFile(videoLink, videoPath);

            // Enviar o vídeo tutorial para o cliente
            const videoMedia = MessageMedia.fromFilePath(videoPath);
            await client.sendMessage(response.from, videoMedia);

            // Apagar os arquivos locais após o envio
            await deleteFile(filePath);
            await deleteFile(videoPath);
        } catch (err) {
            console.error(`Erro ao processar os arquivos para ${operator}:`, err);
        }
    };

    if (userReply.includes('vivo') && userReply.includes('iphone')) {
        // Processar e enviar arquivos para Vivo
        await sendFileAndVideo(
            'Vivo',
            'https://drive.google.com/uc?export=download&id=1iemIIPIRRhRheiirvz7cGh6ULTD7HIDQ',
            'vivosiphone.inpv',
            'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F',
            'vivo_tutorial_video.mp4'
        );
    } else if (userReply.includes('tim') && userReply.includes('iphone')) {
        // Processar e enviar arquivos para TIM
        await sendFileAndVideo(
            'TIM',
            'https://drive.google.com/uc?export=download&id=1fwgBMlOeUC95Bpq2rP-Nn6wjKgeeuF4U',
            'timiphone.inpv',
            'https://drive.google.com/uc?export=download&id=1w8Wlt_lcs0gCm845ZsJiYWxjw58MZh-F',
            'tim_tutorial_video.mp4'
        );
    }

    // Remover o coletor após a primeira resposta
    client.removeListener('message', collector);
};

client.on('message', collector);

            break;
		        case '5':
            await simulateTyping(chat, 2220);
            await client.sendMessage(
                message.from,
                'Para aderir, basta escolher um dos nossos planos, efetuar o pagamento e enviar o comprovante. Nossa chave PIX é a seguinte:\n\n' +
                'Chave PIX Nubank: speednetservicec@gmail.com\n' +
                'Nome: Julio Cezar\n\n' +
                'Por favor, envie o comprovante para que possamos liberar seu acesso.'
            );
            break;
        case '6':
            await simulateTyping(chat, 3450);
            await client.sendMessage(
                message.from,
                `*Perguntas Frequentes*

*1. A conexão é segura? Meus dados estão protegidos?*
*R:* Sim, nossa conexão é criptografada de ponta a ponta, garantindo total segurança para seus dados. Você sempre navegará com tranquilidade e privacidade.

*2. O aplicativo pode apresentar quedas?*
*R:* Sim, podem ocorrer quedas por dois motivos principais:
- *Manutenções programadas:* Embora raras, manutenções podem ser realizadas para aprimorar o aplicativo. Quando isso acontece, ele pode ficar fora do ar por algumas horas. Sempre notificamos antecipadamente no grupo de clientes.
- *Quedas inesperadas:* Caso ocorra uma queda por qualquer outro motivo e o aplicativo não volte a funcionar, garantimos a compensação do tempo em que ficou fora do ar.

*3. Posso usar meu acesso em outros dispositivos?*
*R:* Não. Se você compartilhar seu acesso ou utilizá-lo em mais de um dispositivo sem adquirir uma licença adicional, nosso sistema detectará a irregularidade, o acesso será suspenso, e não será recriado nem reembolsado. Para evitar problemas, nunca compartilhe seu acesso.

*4. Existe um grupo para clientes?*
*R:* Sim. Após a compra, você será adicionado ao grupo exclusivo de clientes. Nesse grupo, informamos sobre manutenções, descontos em renovações e quaisquer outras atualizações importantes.

Caso tenha mais dúvidas, entre em contato conosco. Estamos à disposição para ajudar!`
            );
            break;
        case '7':
            await simulateTyping(chat, 2100);
            await client.sendMessage(
                message.from,
                'Por favor, aguarde um momento enquanto direcionamos você para um de nossos atendentes.'
            );
            break;
        case '8':
            await simulateTyping(chat, 3150);
            await client.sendMessage(
                message.from,
                'Para se tornar nosso revendedor, é bem simples. Temos revenda disponível para Android e uma revenda híbrida para Android e iPhone. Basta escolher uma das opções e a quantidade de crédito/acesso que você deseja adquirir. Para consultar os valores para revendedores, digite o número 9.'
            );
            break;
        case '9':
            await simulateTyping(chat, 4100);
            await client.sendMessage(
                message.from,
                `📲 SPEEDNET - * ✌️`
            );
            break;
        case '10':
            await simulateTyping(chat, 2890);
            await client.sendMessage(
                message.from,
                `*TERMOS DE USO – HYPER NET*
            );
            break;
		case '11':
            await simulateTyping(chat, 3000);
            await client.sendMessage(
                message.from,
                'Aproveite agora a melhor IPTV do Brasil por apenas R$30,00/mês! 🔥 Uma oferta imperdível e por tempo limitado!\n\n' +
                'Quer testar antes? Digite "12" e ganhe 6 horas de acesso gratuito! Não perca essa chance!'
            );

            // Baixar e enviar a imagem
            const imageLink = 'https://drive.google.com/uc?export=download&id=1DnD0Z7bfoeEC1kZfemZswrbwqJzeOe-t';
            const imageFilePath = path.join(__dirname, 'iptv_image.jpg');
            await downloadFile(imageLink, imageFilePath);
            const imageMedia = MessageMedia.fromFilePath(imageFilePath);
            await client.sendMessage(message.from, imageMedia);

            // Baixar e enviar o vídeo
            const videoLinkIptv = 'https://drive.google.com/uc?export=download&id=1VOLQ9aeI-FlxfyHC46zsWbScNewZGX30';
            const videoFilePathIptv = path.join(__dirname, 'iptv_video.mp4');
            await downloadFile(videoLinkIptv, videoFilePathIptv);
            const videoMediaIptv = MessageMedia.fromFilePath(videoFilePathIptv);
            await client.sendMessage(message.from, videoMediaIptv);

            // Apagar os arquivos locais após o envio
            await deleteFile(imageFilePath);
            await deleteFile(videoFilePathIptv);
            break;
        case '12':
            await simulateTyping(chat, 1500);
            await client.sendMessage(
                    message.from,
                    'Para liberarmos um teste, precisamos saber onde você deseja testar. Será em uma TV? Qual o modelo da sua TV? Ou será em um dispositivo Android ou iPhone? Basta nos informar e tentaremos enviar o teste o mais rápido possível após recebermos sua resposta.'
            );
            break;
        default:
            await simulateTyping(chat, 1500);
            break;
        }
    });
    
    // Inicializar cliente WhatsApp
    client.initialize();
        
