import './env.js';
import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { translate } from '@vitalets/google-translate-api';
import { scheduleJob, RecurrenceRule } from 'node-schedule';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const zenQuotesUrl = 'https://zenquotes.io/api/today';

const channelId = process.env.CHANNEL_ID;

const getQuote = async () => {
  try {
    const { data } = await axios.get(zenQuotesUrl);
    return data[0].q;
  } catch (error) {
    console.error(error);
  }
};

const translateQuote = async () => {
  try {
    const quote = await getQuote();
    const translatedQuote = await translate(quote, { to: 'ru' });
    return translatedQuote.text;
  } catch (error) {
    console.error(error);
  }
};

const sendQuote = async () => {
  try {
    const quote = await translateQuote();
    bot.sendMessage(channelId, quote);
  } catch (error) {
    console.error(error);
  }
};

const scheduleRule = new RecurrenceRule();
scheduleRule.hour = 7;
scheduleRule.minute = 0;
scheduleRule.tz = 'Europe/Prague';

const scheduledMessage = scheduleJob(scheduleRule, async () => {
  sendQuote();
});

bot.on('text', (msg) => {
  console.log(msg);
});
