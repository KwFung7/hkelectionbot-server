const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const content = require('./content');

/* ---- Helper ---- */
const displayCandidateInfo = ({ reply }, keyword) => {
  if (_.isEmpty(keyword)) {
    return;
  }

  const { candidate } = content;
  const qs = querystring.stringify({ query: keyword });
  axios.get(`${process.env.DATA_ENDPOINT}/persons/search?${qs}`)
    .then((result) => {

      const { data = [] } = result;
      if (!_.isEmpty(data)) {

        _.forEach(data, (item) => {
          const text = candidate.text
            .replace('#name#', item.name || candidate.noData)
            .replace('#region#', item.region || candidate.noData)
            .replace('#politicalAffiliation#', item.politicalAffiliation || candidate.noData)
            .replace('#claim#', item.claim || candidate.noData)
            .replace('#background#', item.background || candidate.noData)
            .replace('#socialMedia#', item.socialMedia || candidate.noData);
          reply(text);
        });
        reply(candidate.numResult.replace('#num#', data.length));
      } else {
        reply(candidate.numResult.replace('#num#', 0));
      }
    })
    .catch(() => {
      reply(content.serverError);
    });
};

module.exports = {
  displayCandidateInfo
};
