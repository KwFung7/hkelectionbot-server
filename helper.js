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

const displayCandidateInfo = ({ reply }, keyword) => {
  getCandidateList(keyword)
    .then(({ data = [] }) => {
      console.log('felix testing 1: ' + JSON.stringify(data, undefined, 2));

      if (!_.isEmpty(data)) {
        console.log('felix testing 2: ' + JSON.stringify(data, undefined, 2));

        reply(candidate.numResult.replace('#num#', data.length).replace('#keyword#', keyword));
        setTimeout(() => {
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
        }, 500);
      } else {
        console.log('felix testing 3: ' + JSON.stringify(candidate.noResult, undefined, 2));
        reply(candidate.noResult);
      }
    })
    .catch(() => {
      reply(serverError);
    });
};

module.exports = {
  getCandidateList,
  displayCandidateInfo
};
