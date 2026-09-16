import React from 'react';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { documentAssets } from '../content/assets';
import Button from '../components/ui/Button';

export default function ResumePage() {
  return (
    <main className="site-shell resume-page page-top">
      <div className="resume-heading"><div><p className="eyebrow">Resume</p><h1>Experience at a glance.</h1></div><div><Button asChild variant="secondary"><a href={documentAssets.resume} download><FiDownload /> Download</a></Button><Button asChild><a href={documentAssets.resume} target="_blank" rel="noreferrer">Open PDF <FiExternalLink /></a></Button></div></div>
      <object className="resume-viewer" data={documentAssets.resume} type="application/pdf"><p>Your browser cannot display the PDF. <a href={documentAssets.resume}>Open the resume.</a></p></object>
    </main>
  );
}
