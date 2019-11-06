const Extra = require('telegraf/extra');
const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const { candidate, serverError } = require('./content');

/* ---- Helper ---- */
const getCandidateList = (keyword) => {
  if (_.isEmpty(keyword)) {
    return;
  }

  const qs = querystring.stringify({ query: keyword });
  return axios.get(`${process.env.DATA_ENDPOINT}/persons/search?${qs}`);
};

const getPoliticalFaction = (faction) => {
  if (faction === 'PANDEMO' || faction === 'PROESTAB') {
    return candidate.politicalFaction[faction];
  } else {
    return candidate.politicalFaction['OTHER'];
  }
};

const getTagText = (tags) => {
  if (!_.isEmpty(tags)) {
    return _.map(tags, tag => `#${tag}`).join(', ');
  } else {
    return candidate.noData;
  }
};

const getCandidateText = (originalText, data) => {
  return originalText
    .replace('#name#', data.name || candidate.noData)
    .replace('#voteNumber#', data.voteNumber ? `(${data.voteNumber}號)` : '')
    .replace('#region#', data.region || candidate.noData)
    .replace('#politicalAffiliation#', data.politicalAffiliation || candidate.noData)
    .replace('#politicalFaction#', getPoliticalFaction(data.politicalFaction))
    .replace('#background#', data.background || candidate.noData)
    .replace('#message#', data.message || candidate.noData)
    .replace('#tags#', getTagText(data.tags))
    .replace('#socialMedia#', data.socialMedia || candidate.noData)
    .replace(/(<([^>]+)>)/ig, '');
};

const filterListWithTag = (list, tag) => {
  return _.filter(list, (item) => {
    return _.includes(item.tags, tag);
  });
};

const displayMultipleOptions = ({ reply, match }, list, text, markup) => {
  reply(candidate.numResult.replace('#num#', list.length).replace('#keyword#', match[1]));

  setTimeout(() => {
    reply(text, markup);
  }, 500);
};

const displayCandidateInfo = (ctx, keyword) => {
  getCandidateList(keyword)
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, '正式參選');

      if (!_.isEmpty(list)) {

        ctx.reply(candidate.numResult.replace('#num#', list.length).replace('#keyword#', keyword));
        setTimeout(() => {
          _.forEach(list, (item) => {
            const text = getCandidateText(candidate.text, item);

            if (!_.isEmpty(item.socialMedia) && !_.isEmpty(item.introLink)) {
              const socialMediaLink = item.socialMedia.includes(' ')
                ? candidate.facebookSearchLink.replace('#query#', item.name)
                : item.socialMedia;

              ctx.reply(text, Extra.markup((m) =>
                m.inlineKeyboard([
                  m.urlButton(candidate.introLinkLabel, item.introLink),
                  m.urlButton(candidate.socialMediaLabel, socialMediaLink)
                ])));
            } else {
              ctx.reply(text);
            }
          });
        }, 500);
      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });
};

module.exports = {
  getCandidateList,
  filterListWithTag,
  displayMultipleOptions,
  displayCandidateInfo
};
