import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const NANO_URL = "https://nano-gpt.com/api/subscription/v1";
const NANO_KEY = "sk-nano-a07cc82f-5166-4b32-9ccf-cae5d71e0485";
const NANO_MODEL = "deepseek/deepseek-v3.2";
const DISCORD_TOKEN = "MTUxNDE0Nzk1ODY5MjY0MjgxOA.GG_uqR.JwKSv2pDFxHhYZW7mAaSPH4zVUeUrtH_sD_jAY";

let SYSTEM_PROMPT =
  "Jesteś botem na prywatnym serwerze ziomków. Żaden konkretny vibe - raz jesteś spokojny, raz totalnie pojebany, raz pijany, raz filozofujesz o głupotach. Przeklinasz naturalnie, bez napinki. Zero motywacji, zero coachingu, zero korpo-gadki. Gadaj krótko, jak typ z ekipy przy piwie. Jak pytanie jest głupie - wyśmiewasz.";

async function askAI(question: string): Promise<string> {
  const res = await fetch(NANO_URL + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + NANO_KEY,
    },
    body: JSON.stringify({
      model: NANO_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      max_tokens: 300,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

client.once("ready", () => {
  console.log("No i wjeżdżam. Zalogowano jako " + client.user?.tag);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.mentions.has(client.user!.id)) {
    const question = msg.content.replace(/<@!?\d+>/g, "").trim();
    if (!question) return msg.reply("No co chcesz, pytaj.");
    await msg.channel.sendTyping();
    try {
      const reply = await askAI(question);
      msg.reply(reply.slice(0, 2000));
    } catch (e) {
      msg.reply("Zjebało się. Nie moja wina.");
      console.error(e);
    }
  }

  if (msg.content.startsWith("!nick")) {
    const target = msg.mentions.members?.first();
    const newNick = msg.content.replace(/!nick\s*(<@!?\d+>)?\s*/, "");
    if (!newNick) return msg.reply("Podaj nick, matole. `!nick @typ Frajer`");
    try {
      if (target) {
        await target.setNickname(newNick);
        msg.reply(`Nick ${target.user.username} → **${newNick}**`);
      } else {
        await msg.member?.setNickname(newNick);
        msg.reply(`Twój nick → **${newNick}**`);
      }
    } catch (e) {
      msg.reply("Nie mogę. Pozwolenia daj.");
    }
  }

  if (msg.content.startsWith("!tryb")) {
    const t = msg.content.replace("!tryb ", "").trim();
    if (t === "pojeb") {
      SYSTEM_PROMPT = "Totalny odlot. Gadasz jak ktoś na grzybach. Absurd, śmiech, zero sensu.";
      msg.reply("Tryb → **pojeb**. Odlot pełen.");
    } else if (t === "chill") {
      SYSTEM_PROMPT = "Luźny ziomek. Na spokojnie, z humorem, ale bez szaleństw.";
      msg.reply("Tryb → **chill**. Wyluzowanko.");
    } else if (t === "pijany") {
      SYSTEM_PROMPT = "Jesteś pijany w trzy dupy. Bełkot, głupie pomysły, zataczasz się słownie.";
      msg.reply("Tryb → **pijany**. Kto tu jest trzeźwy?!");
    } else {
      msg.reply("Tryby: `pojeb`, `chill`, `pijany`. Wybieraj.");
    }
  }
});

await client.login(DISCORD_TOKEN);
console.log("Bot started");
