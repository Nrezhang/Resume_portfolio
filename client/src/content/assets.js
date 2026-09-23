import profileImage from '../static/images/profilepic.jpg';
import sentimentImage from '../static/images/prediction_jpm_2.png';
import agentImage from '../static/images/widget.png';
import airlineImage from '../static/images/airline.png';
import portfolioImage from '../static/images/homepage.png';
import mydianLogo from '../static/images/mydian-logo.png';
import inyoLogo from '../static/images/inyo-logo.png';
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
  mydian: mydianLogo,
  inyo: inyoLogo,
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

/**
 * Resolves a content-owned media reference without coupling the UI to a
 * particular storage provider. A value can be a bundled asset key, a URL, or
 * an object with light/dark variants. The object form is what published
 * DynamoDB content should use for future S3/CloudFront media.
 */
export function resolveMedia(value, assets = {}) {
  if (!value) return null;
  if (typeof value === 'string') {
    const source = assets[value] || value;
    return typeof source === 'string' ? { light: source } : source;
  }
  if (typeof value !== 'object') return null;

  const source = value.light || value.src || value.url;
  const resolvedSource = typeof source === 'string' ? (assets[source] || source) : source;
  const light = typeof resolvedSource === 'string' ? resolvedSource : resolvedSource?.light;
  const darkSource = value.dark || value.darkSrc;
  const resolvedDark = typeof darkSource === 'string' ? (assets[darkSource] || darkSource) : darkSource;
  const dark = typeof resolvedDark === 'string' ? resolvedDark : resolvedDark?.light || resolvedSource?.dark || (value.darkMode === 'invert' ? light : null);
  return light ? { light, ...(dark ? { dark } : {}), alt: value.alt, fit: value.fit, darkMode: value.darkMode } : null;
}

export function resolveExperienceLogo(experience = {}) {
  return resolveMedia(experience.media?.logo, experienceAssets)
    || resolveMedia(experienceAssets[experience.brand]);
}

export function resolveLink(link) {
  return documentAssets[link] || link;
}
