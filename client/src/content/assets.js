import profileImage from '../static/images/profilepic.jpg';
import sentimentImage from '../static/images/prediction_jpm_2.png';
import agentImage from '../static/images/widget.png';
import airlineImage from '../static/images/airline.png';
import portfolioImage from '../static/images/homepage.png';
import nyuLogo from '../static/images/education/nyu-logo.png';
import tjhsstLogo from '../static/images/education/tjhsst-logo.jpg';
import treasuryLogo from '../static/images/experience/treasury-seal.png';
import trianzLogo from '../static/images/experience/trianz.svg';
import trianzDarkLogo from '../static/images/experience/trianz-dark.svg';
import medidataLogo from '../static/images/experience/medidata.png';
import microsoftLogo from '../static/images/experience/microsoft.png';
import techNyuLogo from '../static/images/experience/tech-nyu.svg';
import tamidLogo from '../static/images/experience/tamid.png';
import tamidDarkLogo from '../static/images/experience/tamid-dark.png';
import jikaLogo from '../static/images/experience/jika.png';
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

export const educationAssets = {
  nyu: nyuLogo,
  tjhsst: tjhsstLogo,
};

export const experienceAssets = {
  treasury: treasuryLogo,
  trianz: { light: trianzLogo, dark: trianzDarkLogo },
  medidata: { light: medidataLogo, dark: medidataLogo },
  microsoft: microsoftLogo,
  'tech-nyu': techNyuLogo,
  tamid: { light: tamidLogo, dark: tamidDarkLogo },
  jika: jikaLogo,
};

export function resolveLink(link) {
  return documentAssets[link] || link;
}
