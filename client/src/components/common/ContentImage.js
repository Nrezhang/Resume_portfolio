import React from 'react';
import { resolveMedia } from '../../content/assets';

/** Renders the shared portable media shape used by portfolio content. */
export default function ContentImage({ media, assets, alt, className = '', imgClassName = '', darkImgClassName }) {
  const image = resolveMedia(media, assets);
  if (!image?.light) return null;

  return <span className={`${className}${image.dark ? ' has-dark-variant' : ''}`}>
    <img className={imgClassName} src={image.light} alt={image.alt || alt || ''} />
    {image.dark && <img className={`${darkImgClassName || `${imgClassName} content-image-dark`.trim()}${image.darkMode === 'invert' ? ' content-image-invert' : ''}`} src={image.dark} alt="" aria-hidden="true" />}
  </span>;
}
