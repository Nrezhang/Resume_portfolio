import profileImage from '../static/images/profilepic.jpg';
import sentimentImage from '../static/images/prediction_jpm_2.png';
import agentImage from '../static/images/widget.png';
import airlineImage from '../static/images/airline.png';
import portfolioImage from '../static/images/homepage.png';
import resumeDocument from '../static/docs/resume.pdf';
import capstoneDocument from '../static/docs/35_Parameter_Efficient_Fine_Tu.pdf';

export const imageAssets = {
  profile: profileImage,
  sentiment: sentimentImage,
  agent: agentImage,
  airline: airlineImage,
  portfolio: portfolioImage,
};

export const documentAssets = {
  resume: resumeDocument,
  capstone: capstoneDocument,
};

export function resolveLink(link) {
  return documentAssets[link] || link;
}
