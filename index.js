const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = '&';

// IDs de configuration
const VERIFICATION_CHANNEL_ID = '1512416583136579694'; // Channel de vérification (visible seulement aux non-vérifiés)
const VERIFIED_ROLE_ID = '1512416266990780606';         // Rôle donné après vérification
const RULES_CHANNEL_ID = '1512461738753392750';          // Channel où envoyer le panel de vérification

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('QLAND | &help', { type: 'WATCHING' });
});

// ─── Commandes textuelles ───────────────────────────────────────────────────

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ── &help ──────────────────────────────────────────────────────────────────
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Commandes QLAND')
      .setDescription('Voici toutes les commandes disponibles :')
      .addFields(
        {
          name: '`&help`',
          value: 'Affiche ce message d\'aide.',
          inline: false,
        },
        {
          name: '`&setup`',
          value: 'Envoie le panel de vérification dans le salon configuré. *(Admin requis)*',
          inline: false,
        },
        {
          name: '`&info`',
          value: 'Affiche les informations du bot et sa configuration.',
          inline: false,
        },
        {
          name: '`&ping`',
          value: 'Affiche la latence du bot.',
          inline: false,
        }
      )
      .setFooter({ text: 'QLAND Bot • Système de vérification' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // ── &ping ──────────────────────────────────────────────────────────────────
  if (command === 'ping') {
    const ping = client.ws.ping;
    const embed = new EmbedBuilder()
      .setColor(ping < 100 ? 0x57F287 : ping < 200 ? 0xFEE75C : 0xED4245)
      .setTitle('🏓 Pong !')
      .setDescription(`Latence : **${ping}ms**`)
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── &info ──────────────────────────────────────────────────────────────────
  if (command === 'info') {
    const guild = message.guild;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('ℹ️ Informations du bot')
      .addFields(
        { name: 'Serveur', value: guild ? guild.name : 'N/A', inline: true },
        { name: 'Membres', value: guild ? `${guild.memberCount}` : 'N/A', inline: true },
        { name: 'Préfixe', value: PREFIX, inline: true },
        { name: 'Channel vérification', value: `<#${VERIFICATION_CHANNEL_ID}>`, inline: true },
        { name: 'Channel règlement', value: `<#${RULES_CHANNEL_ID}>`, inline: true },
        { name: 'Rôle vérifié', value: `<@&${VERIFIED_ROLE_ID}>`, inline: true },
      )
      .setFooter({ text: 'QLAND Bot' })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── &setup ─────────────────────────────────────────────────────────────────
  if (command === 'setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
    }

    const channel = message.guild.channels.cache.get(RULES_CHANNEL_ID);
    if (!channel) {
      return message.reply(`❌ Impossible de trouver le salon <#${RULES_CHANNEL_ID}>. Vérifie l'ID.`);
    }

    await sendVerificationPanel(channel);
    return message.reply(`✅ Panel de vérification envoyé dans <#${RULES_CHANNEL_ID}> !`);
  }
});

// ─── Fonction d'envoi du panel ──────────────────────────────────────────────

async function sendVerificationPanel(channel) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('📋 Règlement QLAND')
    .setDescription(
      'Bienvenue sur **QLAND** ! Avant de continuer, merci de lire et d\'accepter nos règles :\n\n' +
      '🔗 [Conditions d\'utilisation Discord](https://discord.com/terms)\n' +
      '🔗 [Règles de la communauté Discord](https://discord.com/guidelines)\n\n' +
      '> Clique sur le bouton **Accepter** ci-dessous pour accéder au serveur.'
    )
    .setFooter({ text: 'QLAND • Système de vérification' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_accept')
      .setLabel('✅ Accepter & Accéder au serveur')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ embeds: [embed], components: [row] });
}

// ─── Interaction bouton ──────────────────────────────────────────────────────

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'verify_accept') return;

  const member = interaction.member;
  const guild = interaction.guild;

  // Récupérer le rôle vérifié
  const verifiedRole = guild.roles.cache.get(VERIFIED_ROLE_ID);
  if (!verifiedRole) {
    return interaction.reply({
      content: '❌ Le rôle de vérification est introuvable. Contacte un administrateur.',
      ephemeral: true,
    });
  }

  // Vérifier si déjà vérifié
  if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
    return interaction.reply({
      content: '✅ Tu es déjà vérifié !',
      ephemeral: true,
    });
  }

  try {
    await member.roles.add(verifiedRole);
    await interaction.reply({
      content: '🎉 Tu as été **vérifié** ! Bienvenue sur QLAND, profite bien du serveur !',
      ephemeral: true,
    });
    console.log(`✅ ${member.user.tag} a été vérifié.`);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du rôle :', err);
    await interaction.reply({
      content: '❌ Une erreur est survenue. Contacte un administrateur.',
      ephemeral: true,
    });
  }
});

// ─── Nouveau membre ───────────────────────────────────────────────────────────

client.on('guildMemberAdd', async (member) => {
  // Envoyer un message privé de bienvenue
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('👋 Bienvenue sur QLAND !')
      .setDescription(
        `Bonjour **${member.user.username}** !\n\n` +
        `Rends-toi dans le salon <#${RULES_CHANNEL_ID}> et accepte le règlement pour accéder au serveur.`
      )
      .setTimestamp();
    await member.send({ embeds: [dmEmbed] });
  } catch {
    // DMs fermés, on ignore
  }
});

client.login(TOKEN);
